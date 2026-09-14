/**
 * Shared analysis: does a `v-on` binding (`@click`, `@keydown`, …) compile to
 * a handler that Vue actually INVOKES, or to a handler whose body merely
 * REFERENCES a function without calling it?
 *
 * WHY THIS EXISTS (campaign that produced #432 / #434)
 *
 * Five independent components shipped five different spellings of the same
 * mistake — a `v-on` expression whose FINAL value, as written, is a bare
 * function reference rather than a function CALL:
 *
 *   OrigamProgressLinear   @click="clickable && handleClick"
 *   OrigamDatePicker       @click="!viewModeIsMonth ? handleClickDate : undefined"
 *   OrigamDataTableRow     withModifiers(() => toggleSelect(row), ['stop'])
 *                          used as a bare statement, its return value discarded
 *
 * None of these throw. None of them fail type-check (a function value is a
 * perfectly valid operand of `&&` / `||` / `?:` — TypeScript has no way to
 * know the AUTHOR meant to call it). None of them are caught by any existing
 * guard. They were found by reading source, one component at a time — which
 * is exactly the kind of cost this file exists to remove.
 *
 * THE MECHANISM, VERIFIED AGAINST THE REAL COMPILER
 * ---------------------------------------------------
 * `vue/compiler-sfc`'s `compileTemplate()` was used to inspect the ACTUAL
 * generated code for each shape below (not reconstructed from memory):
 *
 *   @click="handleClick"                     -> (...args) => (_ctx.handleClick && _ctx.handleClick(...args))
 *   @click="handleClick()"                   -> $event => (_ctx.handleClick())
 *   @click="clickable && handleClick"         -> $event => (_ctx.clickable && _ctx.handleClick)
 *   @click="cond ? handleClick : undefined"   -> $event => (_ctx.cond ? _ctx.handleClick : undefined)
 *   @click="withModifiers(handleClick, [...])"-> $event => (_ctx.withModifiers(_ctx.handleClick, [...]))
 *
 * Vue's compiler special-cases exactly ONE shape: the ENTIRE `v-on` expression
 * being a bare member-expression path (`handleClick`, `foo.bar`) — for that
 * shape ONLY, it auto-generates a guarded call `(...args) => (expr && expr(...args))`.
 * Every other shape compiles to `$event => (EXPR)` — EXPR is evaluated for
 * its value and then DISCARDED (the DOM ignores an event listener's return
 * value). So `clickable && handleClick` evaluates to the function `handleClick`
 * itself when `clickable` is true, hands that function to nobody, and nothing
 * happens. Same for a ternary branch, same for `withModifiers(...)` used bare
 * (it returns a NEW guarded function — which is then never invoked either).
 *
 * WHAT THIS FILE DETECTS
 * -----------------------
 * For every `v-on` directive in a component's `<template>`:
 *
 *   1. If the WHOLE expression is a bare identifier / member-expression path,
 *      or a function literal (arrow / `function`), or already a call
 *      (`foo()`) -> SAFE, never flagged. This is the ONE correct shape and
 *      the main false-positive to avoid (per the mission brief).
 *   2. Otherwise Vue compiles it as an inline statement whose value is
 *      thrown away. Walk it looking for:
 *        a. an operand of `&&` / `||` that is itself a bare identifier /
 *           member-expression matching a name declared as a function in the
 *           component's own `<script setup>` (cross-referenced for
 *           precision — see `collectLocalCallables`).
 *        b. a `?:` branch (either side) that is the same shape.
 *        c. a bare call to `withModifiers` / `withKeys` NOT itself invoked
 *           by an enclosing `(...)` — this factory always returns a function,
 *           and returning-but-not-calling that function is the same bug
 *           regardless of which local names it wraps, so this sub-case does
 *           NOT require the cross-reference in (a)/(b).
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT FLAG
 * --------------------------------------------
 *   - `@click="handleClick"` / `@click="foo.bar"` — the correct, sole
 *     Vue-blessed bare-reference shape.
 *   - `@click="handleClick()"` / `@click="foo.bar()"` — already invoked.
 *   - `@click="() => handleClick()"` — a function LITERAL is the handler
 *     itself; Vue calls it with `$event`, and whatever it does inside is a
 *     separate concern this guard does not audit.
 *   - `@click="isOpen = !isOpen"` — an assignment; no dangling function
 *     reference anywhere in it.
 *   - `@click="a && b"` where `b` is NOT a name declared as a function in
 *     this component's own script — could be a boolean flag, a computed
 *     ref unwrapped by the template, anything. Flagging every `&&`/`?:` in
 *     every template would drown real defects in noise; the cross-reference
 *     against locally-declared callables is what keeps precision usable.
 *
 * Selftest: `dead-handlers.selftest.mjs` pins both directions AND replays
 * the four known real-world bugs as a mutation check.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { getRealComponents, DS_ROOT } from './components.mjs'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')

// `@vue/compiler-dom` is not a direct dependency of packages/ds — it is only
// reachable through `vue`'s own node_modules (pnpm's isolated layout blocks
// a bare `require('@vue/compiler-dom')` from here otherwise). Requiring it
// relative to where `vue/compiler-sfc` itself resolved from gives the exact
// copy Vue's own SFC compiler uses — the authoritative parser, not a
// hand-rolled HTML scanner.
const vueCompilerSfcPath = require_.resolve('vue/compiler-sfc')
const sfc = require_('vue/compiler-sfc')
const domRequire = createRequire(vueCompilerSfcPath)
const { parse: parseTemplate, NodeTypes } = domRequire('@vue/compiler-dom')

/** Factories whose return value is a function Vue does NOT auto-invoke when
 *  the factory call itself sits in a discarded (inline-statement) position. */
const HANDLER_FACTORY_CALLEES = new Set(['withModifiers', 'withKeys'])

/**
 * Pull the `<template>` block plus its absolute line number in the SFC, via
 * `vue/compiler-sfc`'s own top-level `parse()` — NOT a hand-rolled regex.
 *
 * ⚠️ A naive `/<template\b([^>]*)>([\s\S]*?)<\/template>/` (non-greedy) looks
 * correct in isolation but is WRONG on every real Vue SFC that uses named
 * slots: `<template #foo>…</template>` is common INSIDE the root template,
 * and a non-greedy regex stops at that FIRST inner `</template>`, silently
 * truncating everything after it. Measured on this exact codebase: it drops
 * `OrigamDatePicker`'s `@click="!viewModeIsMonth ? handleClickDate : undefined"`
 * (past the file's first `<template #…>` slot) from the scan entirely — a
 * real bug disappearing not because the analyser misjudged it, but because
 * the extraction never handed it the text to judge. `vue/compiler-sfc`'s own
 * SFC-level parser (the same one the build pipeline runs) handles nesting
 * correctly by construction.
 */
export function extractTemplate (source, filename = 'component.vue') {
    let descriptor
    try {
        ({ descriptor } = sfc.parse(source, { filename }))
    } catch {
        return null
    }
    if (!descriptor.template) return null
    return {
        body: descriptor.template.content,
        startLine: descriptor.template.loc.start.line
    }
}

/**
 * Pull the `<script setup>` (or plain `<script>`) body via the same SFC
 * parser, for the same reason `extractTemplate` does not use regex.
 */
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
 * Names declared as functions at the top level of a `<script setup>` body:
 *   - `function foo () {}`
 *   - `const foo = () => {}` / `const foo = function () {}`
 *   - every name destructured from a call (covers composable-returned
 *     handlers, e.g. `const { onClickPrepend: handleClickPrepend } = useAdjacent(props)`)
 *
 * The destructuring branch is intentionally loose (it does not verify the
 * destructured value is actually callable) — a false ADD here only widens
 * what CAN be flagged as a dangling reference; the surrounding structural
 * check (bare name inside `&&`/`||`/`?:`) still has to hold too, so this
 * does not by itself create false positives in the template scan.
 */
export function collectLocalCallables (scriptBody) {
    const names = new Set()
    if (!scriptBody) return names

    let sf
    try {
        sf = ts.createSourceFile('script.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return names
    }

    const visit = (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
            names.add(node.name.text)
        } else if (ts.isVariableDeclaration(node) && node.initializer) {
            const init = node.initializer
            const isFnLiteral = ts.isArrowFunction(init) || ts.isFunctionExpression(init)
            if (isFnLiteral && ts.isIdentifier(node.name)) {
                names.add(node.name.text)
            } else if (ts.isCallExpression(init) && ts.isObjectBindingPattern(node.name)) {
                for (const el of node.name.elements) {
                    names.add(el.name.getText(sf))
                }
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
    return names
}

/** Unwrap parens / `as` / non-null assertions down to the underlying node. */
function unwrap (node) {
    while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node))) {
        node = ts.isParenthesizedExpression(node) ? node.expression : node.expression
    }
    return node
}

/** Root-level shapes Vue treats as a real handler (member-expression path,
 *  function literal, or an already-invoked call). A call whose callee is a
 *  known handler-FACTORY (`withModifiers`/`withKeys`) is NOT safe by itself —
 *  the factory only returns a function; something still has to invoke it. */
function isSafeRootShape (node) {
    const n = unwrap(node)
    if (!n) return true
    if (ts.isCallExpression(n)) {
        const callee = n.expression
        if (ts.isIdentifier(callee) && HANDLER_FACTORY_CALLEES.has(callee.text)) return false
        return true
    }
    return ts.isIdentifier(n) ||
        ts.isPropertyAccessExpression(n) ||
        ts.isElementAccessExpression(n) ||
        ts.isArrowFunction(n) ||
        ts.isFunctionExpression(n)
}

/** A bare, un-invoked reference matching a known local callable name. */
function danglingCallableRef (node, localCallables) {
    const n = unwrap(node)
    if (!n) return null
    if (ts.isIdentifier(n) && localCallables.has(n.text)) return n.text
    if (ts.isPropertyAccessExpression(n) && localCallables.has(n.name.text)) return `${n.expression.getText()}.${n.name.text}`
    return null
}

/** A bare call to `withModifiers` / `withKeys` not itself invoked further. */
function danglingFactoryCall (node) {
    const n = unwrap(node)
    if (!n || !ts.isCallExpression(n)) return null
    const callee = n.expression
    if (ts.isIdentifier(callee) && HANDLER_FACTORY_CALLEES.has(callee.text)) {
        return callee.text
    }
    return null
}

/**
 * Walk a single expression looking for the dangling-reference sub-patterns,
 * restricted to `&&` / `||` / `?:` operand positions (the positions where a
 * value is USED without being called) — never descending into a nested
 * function's own body, since that body only runs if/when the function is
 * itself invoked.
 */
function walkForDangling (node, localCallables, out, sourceFile, originalText) {
    if (!node) return

    const record = (name, kind) => {
        out.push({ kind, name, node })
    }

    if (ts.isBinaryExpression(node) && (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || node.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
        for (const side of [node.left, node.right]) {
            const ref = danglingCallableRef(side, localCallables)
            const factory = danglingFactoryCall(side)
            if (ref) record(ref, 'logical-operand')
            else if (factory) record(factory, 'factory-call')
            else walkForDangling(unwrap(side), localCallables, out, sourceFile, originalText)
        }
        return
    }

    if (ts.isConditionalExpression(node)) {
        for (const branch of [node.whenTrue, node.whenFalse]) {
            const ref = danglingCallableRef(branch, localCallables)
            const factory = danglingFactoryCall(branch)
            if (ref) record(ref, 'ternary-branch')
            else if (factory) record(factory, 'factory-call')
            else walkForDangling(unwrap(branch), localCallables, out, sourceFile, originalText)
        }
        return
    }

    const factory = danglingFactoryCall(node)
    if (factory) {
        record(factory, 'factory-call')
        return
    }

    // Anything else (assignment, plain call, plain identifier not matching a
    // known callable, literal, …) is not part of this pattern.
}

/**
 * Analyse one `v-on` expression string. Returns a list of findings; empty
 * means "safe" (either the correct bare-reference / call / literal shape,
 * or an inline statement that doesn't dangle a known handler).
 */
export function analyseVOnExpression (text, localCallables) {
    let sf
    try {
        sf = ts.createSourceFile('expr.ts', text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return []
    }

    const statements = sf.statements.filter(ts.isExpressionStatement)
    if (statements.length === 0) return []

    // The whole-directive special case only applies when there is exactly
    // ONE statement and its root is one of Vue's blessed safe shapes.
    if (statements.length === 1 && isSafeRootShape(statements[0].expression)) {
        return []
    }

    const findings = []
    for (const stmt of statements) {
        walkForDangling(stmt.expression, localCallables, findings, sf, text)
    }
    return findings
}

/**
 * Second pass, script-level: `withModifiers(fn, [...])` (or `withKeys`) used
 * as a bare, discarded STATEMENT inside a regular function body — the
 * `OrigamDataTableRow` shape. This is NOT a `v-on` binding at all; it is a
 * factory call sitting inside a hand-written event handler:
 *
 *     const handleCheckBoxClick = () => {
 *         withModifiers(() => toggleSelect(props.item), ['stop'])   // ← discarded
 *         emits('select')
 *     }
 *
 * The call executes (constructs a guarded function) and its result is thrown
 * away in the very next tick of the same statement — `toggleSelect` is never
 * reached. Flags any `ExpressionStatement` at function-body top level whose
 * expression is a bare call to a `HANDLER_FACTORY_CALLEES` name. Restricted
 * to STATEMENT position (not e.g. `const f = withModifiers(...)`, which is a
 * legitimate assignment someone might call later) — see `dead-handlers.selftest.mjs`.
 */
export function findDanglingFactoryStatements (scriptBody) {
    const findings = []
    if (!scriptBody) return findings

    let sf
    try {
        sf = ts.createSourceFile('script.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return findings
    }

    const visitBlockStatements = (statements) => {
        for (const stmt of statements) {
            if (ts.isExpressionStatement(stmt)) {
                const factory = danglingFactoryCall(stmt.expression)
                if (factory) {
                    findings.push({ kind: 'script-factory-call', name: factory, node: stmt, text: stmt.getText(sf) })
                }
            }
        }
    }

    const visit = (node) => {
        if (node.body && ts.isBlock(node.body) &&
            (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node))) {
            visitBlockStatements(node.body.statements)
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)

    return findings.map(f => ({
        ...f,
        line: sf.getLineAndCharacterOfPosition(f.node.getStart(sf)).line + 1
    }))
}

/** Collect every `v-on` directive `{ event, text, line }` in a template. */
export function collectVOnBindings (templateSource) {
    const bindings = []
    let ast
    try {
        ast = parseTemplate(templateSource, { onError: () => {} })
    } catch {
        return bindings
    }

    const walk = (node) => {
        if (node.type === NodeTypes.ELEMENT) {
            for (const prop of node.props || []) {
                if (prop.type === NodeTypes.DIRECTIVE && prop.name === 'on' && prop.exp && prop.exp.content) {
                    bindings.push({
                        event: prop.arg && prop.arg.content ? prop.arg.content : '(dynamic)',
                        text: prop.exp.content,
                        line: prop.exp.loc.start.line,
                        column: prop.exp.loc.start.column
                    })
                }
            }
        }
        for (const child of node.children || []) walk(child)
    }
    walk(ast)
    return bindings
}

/**
 * Analyse one SFC source string end-to-end.
 *
 * @returns {{ findings: Array<{event:string, text:string, line:number, kind:string, name:string}> }}
 */
export function analyseSource (source, filename = 'component.vue') {
    const template = extractTemplate(source, filename)
    const script = extractScriptBody(source, filename)
    const localCallables = collectLocalCallables(script.body)

    const findings = []

    if (template) {
        const bindings = collectVOnBindings(template.body)
        for (const binding of bindings) {
            const results = analyseVOnExpression(binding.text, localCallables)
            for (const r of results) {
                findings.push({
                    event: binding.event,
                    text: binding.text,
                    kind: r.kind,
                    name: r.name,
                    // `template.startLine` is the absolute line of the `<template>`
                    // tag itself; `binding.line` is 1-based from the START OF THE
                    // TEMPLATE CONTENT (which begins on that same line, right
                    // after the opening tag) — so line 1 inside the content maps
                    // to `startLine`, not `startLine + 1`.
                    line: template.startLine + binding.line - 1
                })
            }
        }
    }

    for (const f of findDanglingFactoryStatements(script.body)) {
        findings.push({
            event: '(script)',
            text: f.text,
            kind: f.kind,
            name: f.name,
            line: script.startLine + f.line - 1
        })
    }

    return { findings }
}

/** Analyse the whole shipped catalogue. */
export function analyseCatalogue () {
    return getRealComponents().map(({ pascalName, kebabName, file }) => ({
        pascalName,
        kebabName,
        relative: path.relative(DS_ROOT, file),
        ...analyseSource(readFileSync(file, 'utf8'), path.basename(file))
    }))
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const rows = analyseCatalogue()
    if (process.argv[2] === 'json') {
        console.log(JSON.stringify(rows, null, 2))
    } else {
        const withFindings = rows.filter(r => r.findings.length)
        console.log(`components ................. ${rows.length}`)
        console.log(`dead v-on handler(s) found : ${withFindings.reduce((n, r) => n + r.findings.length, 0)} across ${withFindings.length} component(s)`)
        for (const r of withFindings) {
            console.log(`  ${r.pascalName}`)
            for (const f of r.findings) {
                console.log(`    ${r.relative}:${f.line}  @${f.event}="${f.text}"  [${f.kind}: ${f.name}]`)
            }
        }
    }
}
