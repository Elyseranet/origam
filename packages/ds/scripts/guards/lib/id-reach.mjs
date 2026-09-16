/**
 * Shared analysis: does the `id` a consumer passes reach the rendered DOM
 * AT ALL?
 *
 * WHY THIS EXISTS (#633)
 * ----------------------
 * Guard 15 (`id-forwarding`) covers ONE half of its own subject: an `id`
 * that EXISTS on the root and is SHADOWED by the identifier `useStyle()`
 * generates. It has nothing to say about the symmetric — and, measured,
 * far more banal — shape: **the component binds no `id` anywhere at all.**
 * The consumer writes `<OrigamXxx id="mon-champ">`, the prop is declared,
 * the value is read (often into a local `computed`), and it never lands on
 * a node. No shadowing, therefore no alert; identical outcome for the
 * integrator.
 *
 * `OrigamConfirmWrapper` is the case that revealed it (fixed in #632,
 * `21cb0792`). Its pre-fix shape is replayed as a mutation fixture in
 * `id-reach.selftest.mjs` — a guard that does not catch the bug it was
 * written for catches nothing.
 *
 * ⛔ WHY "DERIVED ONLY" DOES NOT COUNT AS REACHING
 * ------------------------------------------------
 * The ticket suggested crediting a derived id (`${id}-messages`). Measured
 * against the case that produced the ticket, that credit makes the guard
 * blind: pre-fix `OrigamConfirmWrapper` DID bind `:id="messagesId"` on a
 * descendant, with `messagesId = computed(() => `${id.value}-messages`)`.
 * Crediting derivation therefore turns the one known real defect green.
 * A derivative is also not what the consumer asked for — nothing answers
 * `document.getElementById('mon-champ')` when only `mon-champ-messages`
 * exists. So a derivative is recorded, reported as context, and does NOT
 * satisfy the contract.
 *
 * WHAT COUNTS AS REACHING (any one is enough — the guard stays silent)
 * -------------------------------------------------------------------
 *   1. DIRECT     — an `:id="…"` binding whose expression reads a member of
 *                   the id-chain OUTSIDE a template literal. Anywhere in the
 *                   template: root or descendant, but NEVER on a `<slot>` or
 *                   `<template>` (a scoped-slot payload is not a DOM node —
 *                   see `scanTemplate`). The descendant case is LEGITIMATE
 *                   and common (a field puts the id on its `<input>` so
 *                   `<label for>` resolves) — 33 components measured do
 *                   exactly that, so a root-only rule would redden 33
 *                   correct components. See PRECISION below.
 *   2. OBJECT     — a `v-bind="X"` in the template where `X` is an object
 *                   (usually a `computed`) carrying `id: <chain expr>`.
 *                   `OrigamChart` forwards through `surfaceProps`.
 *   3. WHOLE      — `v-bind="props"` / `v-bind="$props"` / `v-bind="$attrs"`
 *                   on any element: `id` rides along.
 *   4. FILTERPROPS— `filterProps(props, […])` whose exclusion list does NOT
 *                   contain `'id'`. The default exclusion list IS
 *                   `['class','style','id']`, so a bare `filterProps(props)`
 *                   does NOT credit — same reading as
 *                   `audit-unconsumed-props.mjs:FILTER_PROPS_DEFAULT_EXCLUDES`.
 *   5. SPREAD     — `...props` / `mergeProps(props, …)` in the script.
 *
 * THE ID-CHAIN
 * ------------
 * Seeded with `props.id` / `props['id']` / `$props.id`, then grown to a
 * fixpoint:
 *   - `const {id} = useStyle(styles, () => props.id)` — the SECOND argument
 *     is what makes a consumer id win (documented on `useStyle`), so the
 *     destructured name joins the chain, renamed (`{id: styleId}`) or not.
 *     WITHOUT a second argument it joins a third set, `generated`: provably
 *     NOT the consumer's id. Binding it satisfies nothing — which is how
 *     `OrigamInput` reads healthy to guard 15 (its destructure is RENAMED, a
 *     shape that guard's header lists as "the correct pattern") while its
 *     root renders `origam-input-v-0`.
 *   - `const X = <init>` joins the chain when `<init>` still references a
 *     chain member after every template literal is blanked out. That one
 *     test separates the DS's ubiquitous fallback idiom
 *     `props.id || `origam-xxx-${uid}`` (a pass-through — blanking the
 *     literal leaves `props.id ||`) from a genuine derivative
 *     `` `${id}-messages` `` (blanking leaves nothing).
 *
 * PRECISION AND RECALL, MEASURED (2026-09-16, `origin/develop` @ 65a3fe277)
 * -------------------------------------------------------------------------
 * The runtime companion `pnpm -F @origam/tests audit:id-forwarding` mounts
 * every component declaring an `id` prop and reads the rendered attribute.
 * On that commit it announces 193 components — root 154, descendant 38,
 * **lost 0**.
 *
 * ⛔ THAT ZERO IS WRONG, and finding out why is what made this analysis
 * measurable at all. Its `descendant` verdict is `html.includes(SENTINEL)`
 * (`packages/tests/audit/id-forwarding-sweep.spec.ts`) — a SUBSTRING test,
 * which any derivative satisfies: `origam-snackbar-group-<sentinel>`
 * contains the sentinel. Replayed with an EXACT `getAttribute('id')`
 * comparison, the same sweep gives **root 154, descendant 33, lost 5**.
 * The instrument that was supposed to be ground truth was itself crediting
 * the exact defect this analysis exists to find.
 *
 * Against that corrected ground truth:
 *   - PRECISION — 3 flagged, 3 confirmed lost by exact-match mounting:
 *     **0 false positives.**
 *   - RECALL — 3 of 5. The two it does not flag are explained, not unknown:
 *     `OrigamRatingField` correctly forwards `:id="id"` to `<origam-input>`
 *     and the loss is entirely `OrigamInput`'s (the static verdict is the
 *     right one); `OrigamDataTableHeadersCell` writes
 *     `props.id ? `${props.id}-row-${i}` : undefined`, whose ternary
 *     CONDITION reads the prop, so the pass-through test below classes it as
 *     a carrier. Known false negative, accepted on the guard's stated bias.
 *
 * SCOPE — static, like every guard here. It proves an id-carrying channel
 * EXISTS in the source, not that the attribute survives to the DOM at
 * runtime; the runtime verdict is the audit above, which is NOT on any
 * blocking path (checked: absent from `run-all.mjs`, `.github/workflows/`
 * and `.husky/`) and, as measured, currently under-reports.
 *
 * Selftest: `id-reach.selftest.mjs`, run by the guard BEFORE it sweeps.
 */

import { createRequire } from 'node:module'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')
const sfc = require_('vue/compiler-sfc')
const vueCompilerSfcPath = require_.resolve('vue/compiler-sfc')
const domRequire = createRequire(vueCompilerSfcPath)
const { parse: parseTemplate, NodeTypes } = domRequire('@vue/compiler-dom')

/* Same default list `useProps(props).filterProps` applies when no explicit
 * exclusion array is passed — kept in sync with
 * `audit-unconsumed-props.mjs:FILTER_PROPS_DEFAULT_EXCLUDES`. */
const FILTER_PROPS_DEFAULT_EXCLUDES = ['class', 'style', 'id']

const READS_PROP_ID = /\bprops\s*(?:\.\s*id\b|\[\s*['"]id['"]\s*\])|\$props\s*\.\s*id\b/

/** Blanks line and block comments so a `props.id` written in prose never
 *  credits anything — the negative control `class-fallthrough` learned the
 *  hard way (a textual detector called `OrigamChartBullet` healthy). */
export function stripComments (src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
        .replace(/(^|[^:\\])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length))
}

/** Blanks the CONTENT of every template literal, backticks included. The
 *  single test that separates a pass-through from a derivative. */
export function blankTemplateLiterals (src) {
    return src.replace(/`(?:\\.|[^`\\])*`/g, (m) => ' '.repeat(m.length))
}

/** Blanks quoted string bodies so `'ajouter props.id ici'` credits nothing. */
export function blankStringLiterals (src) {
    return src.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, (m) => ' '.repeat(m.length))
}

function sfcParts (source, filename) {
    let descriptor
    try {
        ({ descriptor } = sfc.parse(source, { filename }))
    } catch {
        return null
    }
    return {
        template: descriptor.template ? descriptor.template.content : null,
        script: (descriptor.scriptSetup ?? descriptor.script)?.content ?? ''
    }
}

const IDENT = /[A-Za-z_$][A-Za-z0-9_$]*/g

function referencesAny (text, names) {
    for (const m of text.matchAll(IDENT)) {
        if (names.has(m[0])) return true
    }
    return false
}

/**
 * Collects TOP-LEVEL `const NAME = <initialiser>` declarations, by AST.
 *
 * ⛔ SCOPE MATTERS, measured. A lexical scan cannot tell a setup-level
 * `const id = …` from a `const id = window.requestAnimationFrame(…)` buried
 * in a handler. `OrigamMasonry` and `OrigamCommandPalette` both do the
 * latter, and treating it as a setup binding made the analysis believe the
 * template's bare `id` was that local rather than the prop — two false
 * positives on correct components. Only statements at the top level of
 * `<script setup>` can shadow a prop name in the compiled template.
 */
export function collectDeclarations (script) {
    const out = []
    let sf
    try {
        sf = ts.createSourceFile('component.ts', script, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return out
    }
    for (const stmt of sf.statements) {
        if (!ts.isVariableStatement(stmt)) continue
        for (const d of stmt.declarationList.declarations) {
            if (!d.initializer) continue
            const init = d.initializer.getText(sf)
            if (ts.isIdentifier(d.name)) {
                out.push({ name: d.name.text, init })
            } else if (ts.isObjectBindingPattern(d.name)) {
                for (const el of d.name.elements) {
                    if (!ts.isIdentifier(el.name)) continue
                    out.push({ name: el.name.text, init, destructured: true })
                }
            }
        }
    }
    return out
}

/**
 * Finds `const {id[: alias], …} = useStyle(A, B)`. Returns the local name
 * bound to the id AND whether a second argument was supplied — only the
 * two-argument form carries the consumer's id (cf. `useStyle`'s JSDoc and
 * guard 15's header).
 */
function collectUseStyleIds (script) {
    const out = []
    const re = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*useStyle\s*\(/g
    let m
    while ((m = re.exec(script))) {
        const bind = /(?:^|,)\s*id\s*(?::\s*([A-Za-z_$][A-Za-z0-9_$]*))?\s*(?=,|$)/.exec(m[1])
        if (!bind) continue
        const local = bind[1] ?? 'id'

        /* Walk the argument list balancing parentheses so a second argument
         * is recognised even when the first one spans nested calls. */
        let depth = 1
        let i = re.lastIndex
        let topLevelComma = false
        let args = ''
        for (; i < script.length && depth > 0; i++) {
            const c = script[i]
            if (c === '(') depth++
            else if (c === ')') depth--
            if (depth === 1 && c === ',') topLevelComma = true
            if (depth > 0) args += c
        }
        out.push({ local, hasSecondArg: topLevelComma, args })
    }
    return out
}

/**
 * Grows the set of local identifiers holding the consumer's `id`.
 * @returns {{chain: Set<string>, derived: Set<string>}}
 */
export function buildIdChain (rawScript) {
    const script = blankStringLiterals(stripComments(rawScript))
    const chain = new Set()
    const derived = new Set()
    const generated = new Set()

    const decls = collectDeclarations(script)
    const useStyleIds = collectUseStyleIds(script)

    /*
     * ⛔ THE BARE NAME `id` IN A TEMPLATE IS THE PROP, unless setup declares
     * something of that name. Vue's compiled render function resolves an
     * unqualified identifier against setup bindings FIRST and falls back to
     * props — so `:id="id"` with no setup-level `id` binds `props.id`
     * directly. 55 components in this catalogue are exactly that shape, and
     * seeding without this rule flagged every one of them (measured: 47 false
     * positives before this line existed, against a runtime ground truth of
     * ZERO).
     *
     * When setup DOES declare `id`, the bare name is that local, and whether
     * it carries the consumer id is decided by the fixpoint below (a
     * pass-through `props.id || fallback` does; a bare `useStyle()`
     * destructure does not — that is guard 15's shadowing case).
     */
    const setupDeclaresId = decls.some((d) => d.name === 'id') ||
        useStyleIds.some((u) => u.local === 'id') ||
        /(?:^|\n)\s*function\s+id\s*\(/.test(script)
    if (!setupDeclaresId) chain.add('id')

    /*
     * `useStyle(styles)` returns a GENERATED identifier (`origam-xxx-0`) for
     * its own `<style>` selector. Its SECOND argument is what makes a
     * consumer-supplied id win (documented on `useStyle`, and the whole
     * subject of #381 / guard 15). So:
     *   - two arguments, the second reading `props.id` -> the local CARRIES
     *     the consumer id;
     *   - otherwise -> the local is PROVABLY NOT the consumer id. That is a
     *     known non-carrier, not an unknown: binding it satisfies nothing.
     *     `OrigamInput` binds exactly that on its root (`:id="styleId"`,
     *     `useStyle(inputStyles)` with one argument) and guard 15 stays
     *     silent because the destructure is RENAMED — which its own header
     *     lists as "the correct pattern". Renaming avoids the collision; it
     *     does not put the consumer's id on the root.
     */
    for (const { local, hasSecondArg, args } of useStyleIds) {
        if (hasSecondArg && READS_PROP_ID.test(blankTemplateLiterals(args))) chain.add(local)
        else generated.add(local)
    }

    let changed = true
    while (changed) {
        changed = false
        for (const d of decls) {
            if (chain.has(d.name) || derived.has(d.name)) continue
            const bare = blankTemplateLiterals(d.init)
            const passThrough = READS_PROP_ID.test(bare) || referencesAny(bare, chain)
            if (passThrough) { chain.add(d.name); changed = true; continue }
            const viaLiteral = READS_PROP_ID.test(d.init) || referencesAny(d.init, chain)
            if (viaLiteral) { derived.add(d.name); changed = true }
        }
    }
    return { chain, derived, generated }
}

/** Does a template expression read the chain (outside a template literal)? */
function expressionReachesChain (expr, chain) {
    const bare = blankTemplateLiterals(expr)
    return READS_PROP_ID.test(bare) || referencesAny(bare, chain)
}

/**
 * Walks the template collecting every `:id` binding and every `v-bind="X"`
 * spread.
 */
function scanTemplate (templateSource) {
    const idBindings = []
    const spreads = []
    let ast
    try {
        ast = parseTemplate(templateSource, { onError: () => {} })
    } catch {
        return { idBindings, spreads }
    }
    const walk = (node) => {
        /*
         * ⛔ `<slot v-bind="X">` IS NOT A DOM BINDING. It publishes a scoped
         * slot payload to the CONSUMER's template; nothing of it lands on a
         * node of this component. Counting it as a channel is what made
         * `OrigamInput` read healthy: it exposes `inputProps` — which does
         * carry `id: id.value` — through two `<slot v-bind="inputProps">`,
         * while its own root binds `:id="styleId"`, the GENERATED id. Mounted
         * with `id="origam-audit-sentinel-id"`, the rendered tree carries
         * `origam-input-v-0` and `…-messages`, and the consumer's id
         * NOWHERE. `<template>` is excluded for the same reason.
         */
        if (node.type === NodeTypes.ELEMENT && (node.tag === 'slot' || node.tag === 'template')) {
            for (const c of node.children || []) walk(c)
            return
        }
        if (node.type === NodeTypes.ELEMENT) {
            for (const p of node.props || []) {
                if (p.type !== NodeTypes.DIRECTIVE || p.name !== 'bind') continue
                if (p.arg && p.arg.content === 'id' && p.exp) {
                    idBindings.push({ tag: node.tag, expr: p.exp.content, line: p.exp.loc.start.line })
                } else if (!p.arg && p.exp) {
                    spreads.push({ tag: node.tag, expr: p.exp.content.trim(), line: p.exp.loc.start.line })
                }
            }
        }
        for (const c of node.children || []) walk(c)
    }
    walk(ast)
    return { idBindings, spreads }
}

/**
 * Analyse one SFC source string.
 *
 * @param {string} source     full `.vue` file content
 * @param {boolean} declaresId  does the component's prop interface declare `id`?
 * @param {string} filename
 * @returns {{violates: boolean, evidence: string, detail: string|null}}
 */
export function analyseIdReach (source, declaresId, filename = 'component.vue') {
    if (!declaresId) return { violates: false, evidence: 'id not declared', detail: null }

    const parsed = sfcParts(source, filename)
    if (!parsed) return { violates: false, evidence: 'unparseable SFC', detail: null }
    if (parsed.template === null) {
        /* A render-function component has no template to read; guard 5
         * territory, not this one. */
        return { violates: false, evidence: 'no <template> block', detail: null }
    }

    const script = blankStringLiterals(stripComments(parsed.script))
    /*
     * ⛔ The `filterProps` exclusion list is read from the COMMENT-STRIPPED
     * but STRING-INTACT source. Reading it off `script` blanks the very
     * literals that make up the list — `['class','style','id']` becomes
     * `[' ',' ',' ']`, no `'id'` is found, and the guard concludes the id is
     * forwarded. Caught by the ConfirmWrapper mutation fixture, which went
     * green on a source known to be broken: exactly the failure mode these
     * fixtures exist for.
     */
    const scriptWithStrings = stripComments(parsed.script)
    const { chain, derived, generated } = buildIdChain(parsed.script)
    const { idBindings, spreads } = scanTemplate(parsed.template)

    /* 1 — DIRECT */
    for (const b of idBindings) {
        if (expressionReachesChain(b.expr, chain)) {
            return { violates: false, evidence: `:id="${b.expr}" on <${b.tag}>`, detail: null }
        }
    }

    /*
     * 1bis — UNDECIDABLE. An `:id` binding exists but its expression comes
     * from somewhere this pass cannot follow — typically a composable handed
     * the whole props object (`const {…, layoutId} = useCreateLayout(props)`
     * in `OrigamLayout`). The value may well be the consumer's id; deciding
     * would mean following the composable, which is the blast radius
     * `unconsumed-props` deliberately refused for the same reason. The guard
     * only reddens when it can positively say WHERE the id went: nowhere, or
     * into a derivative.
     */
    const unknown = idBindings.filter((b) => !referencesAny(b.expr, derived) && !referencesAny(b.expr, generated))
    if (unknown.length) {
        return {
            violates: false,
            evidence: `:id="${unknown[0].expr}" on <${unknown[0].tag}> — provenance not resolvable, undecidable`,
            detail: null
        }
    }

    /* 3 — WHOLE-PROPS spread on any element */
    for (const s of spreads) {
        if (/^\$?props$/.test(s.expr) || s.expr === '$attrs') {
            return { violates: false, evidence: `v-bind="${s.expr}" on <${s.tag}>`, detail: null }
        }
    }

    /*
     * 2 — OBJECT forwarding: `v-bind="X"` where `X` is an object literal
     * carrying `id: <chain expr>`. Followed TRANSITIVELY through object
     * spreads: `OrigamChart` binds `cartesianProps`, which is
     * `{...surfaceProps.value, …}`, and only `surfaceProps` writes
     * `id: props.id`. One level of indirection was enough to produce a false
     * positive on all 21 Chart families.
     */
    const decls = collectDeclarations(script)
    const declByName = new Map(decls.map((d) => [d.name, d.init]))
    const carriers = new Set()
    let grew = true
    while (grew) {
        grew = false
        for (const d of decls) {
            if (carriers.has(d.name)) continue
            let carries = false
            for (const m of d.init.matchAll(/\bid\s*:\s*([^,\n}]+)/g)) {
                if (expressionReachesChain(m[1], chain)) { carries = true; break }
            }
            if (!carries) {
                for (const m of d.init.matchAll(/\.\.\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
                    if (carriers.has(m[1])) { carries = true; break }
                }
            }
            if (carries) { carriers.add(d.name); grew = true }
        }
    }
    for (const s of spreads) {
        const root = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(s.expr)
        if (!root) continue
        if (carriers.has(root[0])) {
            return { violates: false, evidence: `v-bind="${s.expr}" carries the id`, detail: null }
        }
        if (!declByName.has(root[0])) {
            /* An object this pass cannot resolve (a slot scope variable, a
             * composable return). Undecidable, not a violation — the guard's
             * bias: a false positive blocks an innocent PR, a false negative
             * only fails to catch some debt. */
            return { violates: false, evidence: `v-bind="${s.expr}" — object not resolvable, undecidable`, detail: null }
        }
    }

    /* 4 — filterProps whose exclusion list keeps `id` */
    for (const m of scriptWithStrings.matchAll(/\bfilterProps\s*\(\s*props\b\s*(?:,\s*\[([^\]]*)\])?/g)) {
        const excl = m[1] === undefined
            ? FILTER_PROPS_DEFAULT_EXCLUDES
            : [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1])
        if (!excl.includes('id')) {
            return { violates: false, evidence: 'filterProps(props, […]) does not exclude id', detail: null }
        }
    }

    /* 5 — object spread of the whole props bag */
    if (/\.\.\.\s*props\b/.test(script)) {
        return { violates: false, evidence: '...props spread', detail: null }
    }
    if (/\bmergeProps\s*\(\s*props\b/.test(script)) {
        return { violates: false, evidence: 'mergeProps(props, …)', detail: null }
    }

    const derivedOnly = idBindings.filter((b) => referencesAny(b.expr, derived))
    const generatedOnly = idBindings.filter((b) => referencesAny(b.expr, generated))
    const reasons = []
    if (derivedOnly.length) {
        reasons.push(`valeurs DERIVEES seulement (${derivedOnly.map((b) => `:id="${b.expr}" sur <${b.tag}>`).join(', ')})`)
    }
    if (generatedOnly.length) {
        reasons.push(`id GENERE par useStyle() sans 2e argument (${generatedOnly.map((b) => `:id="${b.expr}" sur <${b.tag}>`).join(', ')})`)
    }
    const detail = reasons.length
        ? `${reasons.join(' ; ')} — l'id du consommateur lui-meme n'atteint aucun noeud`
        : 'aucun binding :id, aucun transfert en bloc (v-bind="props", filterProps sans exclusion, ...props)'

    return { violates: true, evidence: 'no channel carries the consumer id', detail }
}
