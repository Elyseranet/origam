/**
 * Shared analysis: does `:id="id"` in a component's `<template>` resolve to
 * the `id` PROP the consumer passed in, or to a GENERATED identifier that
 * happens to share the same local name?
 *
 * WHY THIS EXISTS (#381)
 * -----------------------
 * `useStyle(xxxStyles)` returns an `id` — a generated identifier
 * (`origam-xxx-0`) meant ONLY for the scoped `<style>` selector it injects
 * (`#origam-xxx-0 { … }`). 16 components destructured it as the bare name
 * `id`:
 *
 *   const {id, css, load, isLoaded, unload} = useStyle(xxxStyles)
 *
 * and then bound `:id="id"` on their rendered root — which, because
 * `useStyle`'s SECOND argument is what makes a consumer-supplied id win
 * (`useStyle(xxxStyles, () => props.id)`, documented on `useStyle` itself),
 * silently rendered the GENERATED id instead of the one a consumer passed
 * via `<OrigamXxx id="my-id">`. No type error (both are strings), no thrown
 * warning, nothing a snapshot test would catch unless it specifically reads
 * the `id` attribute.
 *
 * WHAT THIS GUARD FLAGS
 * ----------------------
 * A component where BOTH are true:
 *   1. `<script setup>` destructures a BARE `id` (not renamed, e.g. NOT
 *      `{id: styleId}`) from a call to `useStyle(...)` with exactly ONE
 *      argument (no `() => props.id` / `props.id` second argument).
 *   2. The `<template>` binds `:id="id"` (the bare identifier `id`, nothing
 *      else) SOMEWHERE that is NOT inside a `v-slot` scope which itself
 *      destructures a same-named `id` (that shape is a DIFFERENT, correct
 *      channel — see below).
 *
 * THE SHAPE THIS GUARD DELIBERATELY DOES NOT FLAG (three OTHER #381/#421
 * mechanisms, all runtime-only — see the ticket and
 * `packages/tests/audit/id-forwarding.audit.mjs`, runnable via
 * `pnpm -F @origam/tests audit:id-forwarding`)
 * -------------------------------------------------------------------------
 *   A. LOCAL COMPUTED SHADOWING — `const id = computed(() => props.id ||
 *      fallback)` declared SEPARATELY from useStyle (which is then renamed
 *      `{id: styleId}` precisely to avoid the collision). This is the
 *      CORRECT pattern (OrigamCheckbox, OrigamRadio, OrigamRadioGroup,
 *      OrigamMenu, OrigamSelectionControl, OrigamSwitch, OrigamTooltip,
 *      OrigamRatingFieldItem) — never flagged, because step 1 above
 *      requires the useStyle destructure to be literally named `id`.
 *   B. SCOPED-SLOT FORWARDING — `<origam-input>` exposes its OWN correctly
 *      themed `id` via `#default="{id, ...}"`; a consumer template that
 *      destructures that slot scope and rebinds `:id="id"` on a CHILD
 *      element inside it is reading the SLOT value, not the useStyle
 *      homonym (OrigamTextField, OrigamTextareaField, OrigamPasswordField,
 *      OrigamFileField, OrigamSliderField, OrigamRatingField's own
 *      internal label). Detected via v-slot scope tracking (see
 *      `collectIdBindings` below) so it is never flagged EVEN IF the same
 *      file's useStyle destructure is also named `id` for an unrelated,
 *      correctly-fixed root-level binding (OrigamRatingField is exactly
 *      this case post-#421-fix: root `:id="id"` outside any slot scope
 *      correctly resolves to the FIXED useStyle id, `:for="id"` deeper in a
 *      `#default="{id,...}"` scope correctly resolves to the slot value —
 *      both correct, neither flagged).
 *   C. FORWARDING GAPS UPSTREAM (`filterProps` excluding `id`, a real
 *      control with NO `:id` binding at all) — these have no `:id="id"`
 *      textual shape to detect; they require mounting the component and
 *      reading the rendered attribute. Out of scope for a static AST guard
 *      by construction — see `packages/tests/audit/id-forwarding.audit.mjs`
 *      (`pnpm -F @origam/tests audit:id-forwarding`) for the runtime
 *      cross-check, following the same split as guard 5
 *      (`unconsumed-props.mjs` static guard + `audit:inert-props` runtime
 *      sweep in packages/tests). That audit currently reports 10 components
 *      losing a consumer-supplied `id` outright — the mechanism-C population
 *      this guard cannot see.
 *
 * Selftest: `id-forwarding.selftest.mjs` pins both directions AND replays
 * the 16 real components found+fixed during the #381 campaign as a
 * mutation check (pre-fix source reconstructed from the actual diff).
 */

import path from 'node:path'
import { createRequire } from 'node:module'
import { getRealComponents, DS_ROOT } from './components.mjs'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')
const sfc = require_('vue/compiler-sfc')
const vueCompilerSfcPath = require_.resolve('vue/compiler-sfc')
const domRequire = createRequire(vueCompilerSfcPath)
const { parse: parseTemplate, NodeTypes } = domRequire('@vue/compiler-dom')

export { DS_ROOT }

/** Same SFC-level extraction dead-handlers.mjs uses — vue/compiler-sfc
 *  handles named-slot nesting correctly, a hand-rolled regex does not. */
export function extractTemplate (source, filename = 'component.vue') {
    let descriptor
    try {
        ({ descriptor } = sfc.parse(source, { filename }))
    } catch {
        return null
    }
    if (!descriptor.template) return null
    return { body: descriptor.template.content, startLine: descriptor.template.loc.start.line }
}

export function extractScriptBody (source, filename = 'component.vue') {
    let descriptor
    try {
        ({ descriptor } = sfc.parse(source, { filename }))
    } catch {
        return { body: '', startLine: 1 }
    }
    const block = descriptor.scriptSetup ?? descriptor.script
    return block ? { body: block.content, startLine: block.loc.start.line } : { body: '', startLine: 1 }
}

/**
 * Finds `const {id, ...} = useStyle(ARG1[, ARG2])` at the top level of a
 * `<script setup>` body. Returns `{ hasSecondArg, line }` or `null` if no
 * such BARE-`id` destructure exists (renamed destructures like
 * `{id: styleId}` never match — that is mechanism A above, intentionally
 * not this guard's concern).
 */
export function findBareIdUseStyleCall (scriptBody) {
    let sf
    try {
        sf = ts.createSourceFile('component.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return null
    }

    let found = null
    const visit = (node) => {
        if (found) return
        if (
            ts.isVariableDeclaration(node) &&
            node.name && ts.isObjectBindingPattern(node.name) &&
            node.initializer && ts.isCallExpression(node.initializer) &&
            ts.isIdentifier(node.initializer.expression) &&
            node.initializer.expression.text === 'useStyle'
        ) {
            const bindsBareId = node.name.elements.some(el =>
                !el.propertyName && ts.isIdentifier(el.name) && el.name.text === 'id'
            )
            if (bindsBareId) {
                found = {
                    hasSecondArg: node.initializer.arguments.length >= 2,
                    line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
                }
                return
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
    return found
}

/**
 * Walk the template AST tracking `v-slot`/`#name="{...}"` scopes. Returns
 * every `:id="id"` (bare-identifier) binding NOT shadowed by an ancestor
 * slot-scope destructure of the same name — i.e. every binding that, per
 * mechanism B in the file header, genuinely resolves to the script-level
 * `id` rather than a slot-exposed one.
 */
export function collectUnshadowedIdBindings (templateSource) {
    const bindings = []
    let ast
    try {
        ast = parseTemplate(templateSource, { onError: () => {} })
    } catch {
        return bindings
    }

    // A slot-scope expression like `{id, messagesId, isDisabled}` or
    // `{ id }` destructures `id` as a shorthand object property — matched
    // as a bare `id` token bounded by `{`/`,`/`}`/whitespace so it does not
    // false-match `messagesId` or `validId`.
    const SHADOWS_ID = /(?:^|[{,]\s*)id\s*(?:[,}]|$)/

    const walk = (node, idShadowed) => {
        if (node.type === NodeTypes.ELEMENT) {
            let nextShadowed = idShadowed
            for (const prop of node.props || []) {
                if (prop.type === NodeTypes.DIRECTIVE && prop.name === 'slot' && prop.exp && prop.exp.content) {
                    if (SHADOWS_ID.test(prop.exp.content)) nextShadowed = true
                }
            }
            for (const prop of node.props || []) {
                if (
                    prop.type === NodeTypes.DIRECTIVE && prop.name === 'bind' &&
                    prop.arg && prop.arg.content === 'id' &&
                    prop.exp && prop.exp.content.trim() === 'id' &&
                    !nextShadowed
                ) {
                    bindings.push({ line: prop.exp.loc.start.line, column: prop.exp.loc.start.column })
                }
            }
            for (const child of node.children || []) walk(child, nextShadowed)
        } else {
            for (const child of node.children || []) walk(child, idShadowed)
        }
    }
    walk(ast, false)
    return bindings
}

/**
 * Analyse one SFC source string end-to-end.
 *
 * @returns {{ findings: Array<{line:number}> }}
 */
export function analyseSource (source, filename = 'component.vue') {
    const template = extractTemplate(source, filename)
    const script = extractScriptBody(source, filename)
    const useStyleCall = findBareIdUseStyleCall(script.body)

    const findings = []
    if (template && useStyleCall && !useStyleCall.hasSecondArg) {
        const bindings = collectUnshadowedIdBindings(template.body)
        for (const b of bindings) {
            findings.push({ line: template.startLine + b.line - 1, useStyleLine: script.startLine + useStyleCall.line - 1 })
        }
    }
    return { findings }
}

/** Analyse the whole shipped catalogue. */
export function analyseCatalogue () {
    return getRealComponents().map(({ pascalName, kebabName, file }) => ({
        pascalName,
        kebabName,
        relative: path.relative(DS_ROOT, file),
        ...analyseSource(require('node:fs').readFileSync(file, 'utf8'), path.basename(file))
    }))
}
