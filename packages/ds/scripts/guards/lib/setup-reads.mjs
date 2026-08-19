/**
 * Shared analysis: which props does a component read EAGERLY, at `setup()`
 * level, in a way the ADR-005 theme resolver can never reach?
 *
 * WHY THIS EXISTS (issue #363)
 *
 * The theme-props resolver patches `instance.props` from a global mixin's
 * `beforeCreate`. Vue runs `beforeCreate` AFTER `setup()` for a component
 * compiled from `<script setup>` (`setupStatefulComponent` calls `setup()`,
 * then `finishComponentSetup` → `applyOptions` → the `beforeCreate` hooks).
 *
 * Consequence: a prop value read EAGERLY in the setup body — captured into a
 * plain local, an object literal, a composable argument — snapshots the
 * PRE-theme value and never updates. A theme configuring that prop has no
 * effect and emits no warning. Reads deferred into a `computed` / `watch` /
 * event handler are fine: they first run at render, long after `beforeCreate`.
 *
 * `useDefaults(_props)` is the only fix, because it resolves through the
 * injected defaults map at read time rather than at setup time.
 *
 * WHAT COUNTS AS AN EAGER READ
 *
 * A property access on the raw props object sitting at function-nesting
 * depth 0 relative to the setup body. Blocks (`if`, `for`, `try`) do NOT
 * create depth — their contents still execute during setup.
 *
 * DELIBERATELY NOT FLAGGED (verified against the fixtures in
 * `setup-reads.selftest.mjs`, which fail loudly if this drifts):
 *   - `toRef(props, 'x')` / `toRefs(props)` — lazy by construction.
 *   - `computed(() => props.x)`, `watch(() => props.x, …)`, handlers — deferred.
 *   - `useFoo(props)` — passes the reactive object rather than a value. Safe
 *     unless the composable itself reads eagerly, so it is reported
 *     separately as a `transitive` candidate, never counted as a defect.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { getRealComponents, DS_ROOT } from './components.mjs'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')

const FUNCTION_KINDS = new Set([
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.ArrowFunction,
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.GetAccessor,
    ts.SyntaxKind.SetAccessor,
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.ClassExpression
])

/** Lazy-by-construction helpers: receiving `props` here reads no value. */
const LAZY_CALLEES = new Set(['toRef', 'toRefs', 'useDefaults'])

/**
 * Pull the `<script setup>` body (falling back to a plain `<script>`) plus its
 * absolute offset in the SFC, so reported line numbers match the real file.
 */
export function extractScript (source) {
    const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g
    const blocks = []
    let m
    while ((m = re.exec(source)) !== null) {
        blocks.push({ attrs: m[1], body: m[2], start: m.index + m[0].indexOf(m[2]) })
    }
    return blocks.find(b => /\bsetup\b/.test(b.attrs)) ?? blocks[0] ?? null
}

function lineOf (source, pos) {
    return source.slice(0, pos).split('\n').length
}

/**
 * Analyse one SFC source string.
 *
 * @returns {{propsVars: string[], callsUseDefaults: boolean, resolvedPropsVar: string|null,
 *            eager: Array<{kind:string,prop:string,text:string,line:number}>,
 *            transitive: Array<{callee:string,text:string,line:number}>}}
 */
export function analyseSource (source, filename = 'component.vue') {
    const block = extractScript(source)
    const empty = { propsVars: [], callsUseDefaults: false, resolvedPropsVar: null, eager: [], transitive: [] }
    if (!block) return empty

    const sf = ts.createSourceFile(
        `${filename}.ts`, block.body, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS
    )

    // ── Pass 1: locate the raw props variable, and any useDefaults() call.
    const propsVars = new Set()
    let callsUseDefaults = false
    let resolvedPropsVar = null

    const findDecls = (node) => {
        if (ts.isVariableDeclaration(node) && node.initializer && ts.isIdentifier(node.name) &&
            ts.isCallExpression(node.initializer)) {
            const callee = node.initializer.expression
            const name = ts.isIdentifier(callee) ? callee.text : null
            if (name === 'withDefaults' || name === 'defineProps') propsVars.add(node.name.text)
            if (name === 'useDefaults') {
                callsUseDefaults = true
                resolvedPropsVar = node.name.text
            }
        }
        ts.forEachChild(node, findDecls)
    }
    findDecls(sf)

    // Reads through the RESOLVED variable are safe by construction; only the
    // raw `withDefaults(...)` result is at risk.
    const atRisk = propsVars
    const eager = []
    const transitive = []

    const record = (kind, prop, text, node) => {
        eager.push({ kind, prop, text, line: lineOf(source, block.start + node.getStart(sf)) })
    }

    // ── Pass 2: walk, tracking function-nesting depth.
    const walk = (node, depth) => {
        const nextDepth = FUNCTION_KINDS.has(node.kind) ? depth + 1 : depth

        if (depth === 0) {
            if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) &&
                atRisk.has(node.expression.text)) {
                record('member', node.name.text, `${node.expression.text}.${node.name.text}`, node)
            } else if (ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) &&
                atRisk.has(node.expression.text)) {
                const arg = node.argumentExpression
                const prop = arg && ts.isStringLiteral(arg) ? arg.text : '?'
                record('element', prop, `${node.expression.text}[…]`, node)
            } else if (ts.isVariableDeclaration(node) && node.initializer &&
                ts.isIdentifier(node.initializer) && atRisk.has(node.initializer.text) &&
                ts.isObjectBindingPattern(node.name)) {
                for (const el of node.name.elements) {
                    const prop = el.propertyName ? el.propertyName.getText(sf) : el.name.getText(sf)
                    record('destructure', prop, `const { ${el.name.getText(sf)} } = ${node.initializer.text}`, node)
                }
            } else if (ts.isSpreadAssignment(node) && ts.isIdentifier(node.expression) &&
                atRisk.has(node.expression.text)) {
                record('spread', '*', `{ …${node.expression.text} }`, node)
            } else if (ts.isCallExpression(node)) {
                const callee = ts.isIdentifier(node.expression)
                    ? node.expression.text
                    : (ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : null)
                if (callee && !LAZY_CALLEES.has(callee)) {
                    for (const arg of node.arguments) {
                        if (ts.isIdentifier(arg) && atRisk.has(arg.text)) {
                            transitive.push({
                                callee,
                                text: `${callee}(${arg.text})`,
                                line: lineOf(source, block.start + node.getStart(sf))
                            })
                        }
                    }
                }
            }
        }

        ts.forEachChild(node, c => walk(c, nextDepth))
    }
    walk(sf, 0)

    return { propsVars: [...propsVars], callsUseDefaults, resolvedPropsVar, eager, transitive }
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
        const withUD = rows.filter(r => r.callsUseDefaults)
        const withoutUD = rows.filter(r => !r.callsUseDefaults)
        const broken = withoutUD.filter(r => r.eager.length)
        console.log(`components ................. ${rows.length}`)
        console.log(`  calls useDefaults ........ ${withUD.length}`)
        console.log(`  does not ................. ${withoutUD.length}`)
        console.log(`eager setup() reads, no useDefaults: ${broken.length}`)
        for (const r of broken.sort((a, b) => b.eager.length - a.eager.length)) {
            const props = [...new Set(r.eager.map(e => e.prop))].join(', ')
            console.log(`  ${r.pascalName.padEnd(28)} ${String(r.eager.length).padStart(2)}  [${props}]`)
        }
    }
}
