/**
 * Shared analysis: a component whose props interface declares `class`
 * TRANSITIVELY must re-bind that value by hand — otherwise a consumer's
 * `class="…"` is silently dropped.
 *
 * WHY THIS EXISTS (#620)
 * -----------------------
 * Vue applies a class written by a consumer through ATTRIBUTE FALLTHROUGH:
 * `class` lands in `$attrs` and Vue merges it onto the single root element
 * for free. DECLARING `class` as a prop REMOVES it from `$attrs`, and the
 * automatic merge stops. Measured at runtime, Vue 3.5.39, SSR:
 *
 *   <div class="own-a from-parent">A</div>   ← class NOT declared → merged
 *   <div class="own-b">B</div>               ← class DECLARED, not re-bound → LOST
 *
 * `ICommonsComponentProps` (commons.interface.ts) declares `class`, and most
 * of the catalogue inherits it — so most of the catalogue is in the second
 * row of that table and only stays correct by convention: ending the
 * `rootClasses` array with `props.class`. 189 of 192 components did. Three
 * did not, and a consumer writing `class="…"` on them painted nothing, with
 * no type error and no runtime warning.
 *
 * ⛔ The reason this needs a GUARD rather than three fixes: 189 correct out
 * of 192 is not a state a codebase holds by itself. Nothing in the type
 * system, the linter or the test suite expresses "you declared it, therefore
 * you owe a re-bind". The next component to inherit the interface starts
 * broken by default, exactly as these three did.
 *
 * WHAT COUNTS AS A RE-BIND
 * -------------------------
 * Any ONE of:
 *   1. `props.class` read anywhere in `<script setup>` — the conventional
 *      shape, used by all 189 correct components (`rootClasses` ends with
 *      it). Detected on the TS AST, so an occurrence inside a comment or a
 *      string literal does NOT count.
 *   2. `$props.class` in the `<template>`, or `v-bind="$props"` — the same
 *      thing spelled from the template side.
 *   3. A `…filterProps(props, [ … ])` call whose exclusion array does NOT
 *      list `'class'`. `useProps`' `filterProps` forwards every key of the
 *      child's props MINUS the excludes, and its DEFAULT excludes are
 *      `['class', 'style', 'id']` — so a bare `filterProps(props)` does NOT
 *      forward class and is not evidence. An explicit array that omits
 *      `'class'` does forward it, and is.
 *
 * ⛔ WHAT THIS GUARD DOES NOT PROVE
 * ---------------------------------
 * Static, like every guard in this suite. It proves the VALUE IS READ, not
 * that it lands on the rendered root: a component could read `props.class`
 * and bind it to a child that discards it. Same split as guard 15
 * (`id-forwarding`) and guard 5 (`unconsumed-props`) — the runtime verdict
 * lives in the specs, `packages/tests/TU/components/Chart/
 * chart-class-style-fallthrough.spec.ts` and `…/Dialog/
 * dialog-confirmation-class-style-620.spec.ts`, which mount the component
 * and read `wrapper.classes()` / the rendered markup.
 *
 * It also says nothing about `style`, which has the SAME mechanism and was
 * broken on the same component (`OrigamDialogConfirmation` lost both). The
 * reason is precision, not oversight: `style` is legitimately re-bound
 * through a dozen different local names (`rootStyles`, `dialogStyles`,
 * `contentStyles`, an entry in a `:style` array…), so the textual evidence
 * is far weaker and a `style` arm measured as noisy. The `class` arm has a
 * single idiomatic shape and, after the #620 fixes, ZERO findings on the
 * whole catalogue — which is what makes a strict baseline of `[]` honest.
 *
 * Selftest: `class-fallthrough.selftest.mjs` pins BOTH directions and
 * replays the three real pre-fix sources as a mutation check.
 */

import { createRequire } from 'node:module'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')
const sfc = require_('vue/compiler-sfc')

/** Splits an SFC into its `<script setup>` body and its `<template>` body. */
export function splitSfc (source, filename = 'component.vue') {
    let descriptor
    try {
        ({ descriptor } = sfc.parse(source, { filename }))
    } catch {
        return { script: '', template: '' }
    }
    const block = descriptor.scriptSetup ?? descriptor.script
    return {
        script: block ? block.content : '',
        template: descriptor.template ? descriptor.template.content : ''
    }
}

/**
 * Does the script READ `props.class` (a real member access, not a mention
 * inside a comment or a string)?
 */
export function readsPropsClass (scriptBody) {
    let sf
    try {
        sf = ts.createSourceFile('component.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return false
    }

    let found = false
    const visit = (node) => {
        if (found) return
        // `props.class`
        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.expression) && node.expression.text === 'props' &&
            node.name.text === 'class'
        ) {
            found = true
            return
        }
        // `props['class']`
        if (
            ts.isElementAccessExpression(node) &&
            ts.isIdentifier(node.expression) && node.expression.text === 'props' &&
            ts.isStringLiteralLike(node.argumentExpression) &&
            node.argumentExpression.text === 'class'
        ) {
            found = true
            return
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
    return found
}

/**
 * Does the script forward `class` through a `filterProps(props, [ … ])`
 * call whose explicit exclusion array omits `'class'`?
 *
 * A call with NO second argument falls back to `useProps`' defaults, which
 * DO exclude `class` — so it is not evidence. Only an explicit array that
 * leaves `'class'` out forwards it.
 */
export function forwardsClassViaFilterProps (scriptBody) {
    let sf
    try {
        sf = ts.createSourceFile('component.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return false
    }

    let found = false
    const visit = (node) => {
        if (found) return
        if (ts.isCallExpression(node)) {
            const callee = node.expression
            const name = ts.isPropertyAccessExpression(callee)
                ? callee.name.text
                : (ts.isIdentifier(callee) ? callee.text : null)
            if (name === 'filterProps' && node.arguments.length >= 2) {
                const excludes = node.arguments[1]
                if (ts.isArrayLiteralExpression(excludes)) {
                    const listed = excludes.elements
                        .filter(ts.isStringLiteralLike)
                        .map((el) => el.text)
                    // Every element must be a literal for the read to be
                    // trustworthy; a spread or a variable means we cannot
                    // tell, so we stay silent rather than guess.
                    const allLiteral = excludes.elements.every(ts.isStringLiteralLike)
                    if (allLiteral && !listed.includes('class')) {
                        found = true
                        return
                    }
                }
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
    return found
}

/** `$props.class` or `v-bind="$props"` in the template. */
export function templateRebindsClass (templateBody) {
    return /\$props\s*\.\s*class\b/.test(templateBody) ||
        /\$props\s*\[\s*['"]class['"]\s*\]/.test(templateBody) ||
        /v-bind\s*=\s*"\s*\$props\s*"/.test(templateBody)
}

/**
 * Analyse one SFC.
 *
 * @param {string} source            raw `.vue` file content
 * @param {boolean} declaresClass    does its props interface declare `class`
 *                                   transitively? (resolved by the caller,
 *                                   which owns the interface graph)
 * @returns {{ violates: boolean, evidence: string|null }}
 */
export function analyseSource (source, declaresClass, filename = 'component.vue') {
    if (!declaresClass) return { violates: false, evidence: 'class-not-declared' }

    const { script, template } = splitSfc(source, filename)

    if (readsPropsClass(script)) return { violates: false, evidence: 'props.class' }
    if (templateRebindsClass(template)) return { violates: false, evidence: '$props.class' }
    if (forwardsClassViaFilterProps(script)) return { violates: false, evidence: 'filterProps' }

    return { violates: true, evidence: null }
}
