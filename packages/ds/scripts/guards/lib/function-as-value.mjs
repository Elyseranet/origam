/**
 * Shared analysis: is a locally-declared FUNCTION used where the code needs
 * that function's RETURN VALUE?
 *
 * WHY THIS EXISTS (the other half of the #409 / #401 root cause)
 * --------------------------------------------------------------
 * `dead-handlers` (sibling file) covers one half of the family: a function
 * that should have been CALLED sits in a discarded position — a `v-on`
 * expression, or a bare `withModifiers(...)` statement. It found five
 * occurrences.
 *
 * The other half is the same mistake in the opposite direction: the function
 * IS in a consumed position, but it is the function OBJECT that lands there
 * instead of its result. Nothing is discarded — a value is used, it is just
 * always the wrong one, and always the same one.
 *
 *   OrigamColorPickerSwatches (#401)
 *     v-if="colorHsv && deepEqual(colorHsv, hsva)"
 *
 *   `hsva` is `const hsva = (color: TColorType) => RGBtoHSV(rgba(color))`.
 *   `deepEqual` therefore compared an HSVA object against a FUNCTION — false
 *   for every swatch, in every state, forever. The selection tick never
 *   rendered once. No throw, no type error (`deepEqual(a: any, b: any)`),
 *   no lint. It shipped, and the e2e suite had no click test to catch it.
 *
 * WHAT IS FLAGGED — three provably-wrong shapes only
 * ---------------------------------------------------
 * In each, `fn` is a name declared as a function in the SAME component's
 * `<script setup>` (see `collectLocalCallables`), used WITHOUT `()`:
 *
 *   1. `interpolation`  — `{{ fn }}`. Rendering a function stringifies its
 *      source code into the DOM. Never intentional.
 *   2. `condition`      — `v-if="fn"` / `v-else-if` / `v-show`, or `fn` as an
 *      operand of `&&` / `||` / `!` / a ternary condition inside one. A
 *      function object is unconditionally truthy: the condition is a
 *      constant, and the branch it guards is dead or always-live.
 *   3. `comparison`     — `fn === x`, `x !== fn`, or `fn` passed as an
 *      argument to a VALUE-comparison helper (`deepEqual`, `isEqual`,
 *      `Object.is`, `includes`, `indexOf`, `lastIndexOf`). This is the
 *      #401 shape. Comparing a function against a value is always false
 *      (or always true, for `!==`).
 *
 * Shape 3 is checked in the `<script setup>` body too — `deepEqual(a, fn)`
 * inside a `computed` is the identical defect one indirection away.
 *
 * WHAT IS DELIBERATELY NOT FLAGGED
 * ---------------------------------
 *   - `:prop="fn"` / `:item-props="fn"` / `#slot="{ fn }"` — passing a
 *     callback as a prop or slot payload is the single most common correct
 *     use of a bare function name in a template. Flagging `v-bind` would
 *     drown the three real shapes above in noise, so `v-bind` is out of
 *     scope entirely.
 *   - `@click="fn"` — the Vue-blessed handler shape; `dead-handlers` owns
 *     `v-on` and has the compiler-verified rules for it.
 *   - `fn` as an argument to any callee NOT in `VALUE_COMPARISON_CALLEES`
 *     (`items.map(render)`, `useX(fn)`, `arr.sort(byName)`) — a callback
 *     argument is legitimate and indistinguishable from a mistake without
 *     type information the guard does not have.
 *   - `{{ fn() }}` / `v-if="fn()"` — already invoked.
 *   - a name that is NOT declared as a function in this component's own
 *     script. Cross-referencing against local callables is what keeps
 *     precision usable, exactly as in `dead-handlers`.
 *
 * Selftest: `function-as-value.selftest.mjs` pins both directions AND
 * replays the real #401 bug verbatim as a mutation check.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { getRealComponents, DS_ROOT } from './components.mjs'
import { extractTemplate, extractScriptBody } from './dead-handlers.mjs'

const require_ = createRequire(import.meta.url)
const ts = require_('typescript')

// Same resolution dance as `dead-handlers.mjs`: `@vue/compiler-dom` is only
// reachable through `vue`'s own node_modules under pnpm's isolated layout.
const vueCompilerSfcPath = require_.resolve('vue/compiler-sfc')
const domRequire = createRequire(vueCompilerSfcPath)
const { parse: parseTemplate, NodeTypes } = domRequire('@vue/compiler-dom')

/** Helpers that compare a VALUE against a VALUE. A function reaching one of
 *  these is never the intended operand. */
const VALUE_COMPARISON_CALLEES = new Set([
    'deepEqual', 'isEqual', 'is', 'includes', 'indexOf', 'lastIndexOf'
])

/** Directives whose expression is consumed as a boolean condition. */
const CONDITION_DIRECTIVES = new Set(['if', 'else-if', 'show'])

const EQUALITY_OPERATORS = new Set([
    ts.SyntaxKind.EqualsEqualsToken,
    ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken,
    ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ts.SyntaxKind.LessThanToken,
    ts.SyntaxKind.LessThanEqualsToken,
    ts.SyntaxKind.GreaterThanToken,
    ts.SyntaxKind.GreaterThanEqualsToken
])

const LOGICAL_OPERATORS = new Set([
    ts.SyntaxKind.AmpersandAmpersandToken,
    ts.SyntaxKind.BarBarToken,
    ts.SyntaxKind.QuestionQuestionToken
])

/**
 * Names bound to a function LITERAL in this component's own `<script setup>`:
 *
 *   function foo () {}
 *   const foo = () => {}
 *   const foo = function () {}
 *
 * ⛔ Deliberately STRICTER than `dead-handlers`' `collectLocalCallables`,
 * which also adds every name destructured from a call. That looseness is
 * safe there because a finding additionally requires a `&&`/`||`/`?:`
 * structure around the name. Here `v-if="hasContent"` IS the whole finding,
 * so the same looseness is fatal: measured on this catalogue, importing
 * `collectLocalCallables` produced 30 findings, of which 30 were
 * `const { hasContent } = useProgress(props)`-style computed refs — a 100 %
 * false-positive rate.
 *
 * The cost is recall: a genuinely mis-used function that arrives via
 * destructuring from a composable is not seen. That trade is deliberate — a
 * guard nobody trusts gets disabled, and this one has to survive to catch
 * the sixth occurrence.
 */
export function collectLocalFunctionLiterals (scriptBody) {
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
        } else if (ts.isVariableDeclaration(node) && node.initializer && ts.isIdentifier(node.name)) {
            const init = node.initializer
            if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
                names.add(node.name.text)
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)

    return names
}

/** Unwrap parens / `as` / non-null assertions down to the underlying node. */
function unwrap (node) {
    while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) ||
        ts.isNonNullExpression(node))) {
        node = node.expression
    }
    return node
}

function calleeName (call) {
    const callee = unwrap(call.expression)
    if (ts.isIdentifier(callee)) return callee.text
    if (ts.isPropertyAccessExpression(callee)) return callee.name.text
    return null
}

/** Parse a template expression (or a script body) into a SourceFile. */
function parseExpression (text) {
    try {
        // Wrapped in parens so a bare object literal (`{ a: 1 }`) parses as an
        // expression, not as a block — the same reason `analyseVOnExpression`
        // in the sibling file parses statements rather than raw tokens.
        return ts.createSourceFile('expr.ts', text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return null
    }
}

/**
 * Every bare reference to `name` in `node` that is NOT the callee of a call
 * and NOT a property name — i.e. every position where the FUNCTION OBJECT,
 * not its result, is the value.
 */
function bareReferences (sf, node, localCallables) {
    const refs = []

    const visit = (n) => {
        if (ts.isIdentifier(n) && localCallables.has(n.text)) {
            const parent = n.parent
            const isCallee = parent && ts.isCallExpression(parent) && unwrap(parent.expression) === n
            const isPropertyName = parent && ts.isPropertyAccessExpression(parent) && parent.name === n
            const isBindingName = parent && (ts.isPropertyAssignment(parent) && parent.name === n)
            if (!isCallee && !isPropertyName && !isBindingName) {
                refs.push(n)
            }
        }
        ts.forEachChild(n, visit)
    }
    visit(node)

    return refs
}

/** Is `ref` an operand of a comparison, or an argument of a value-comparison
 *  helper? */
function comparisonContext (ref) {
    let node = ref
    let parent = node.parent

    while (parent && (ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent) ||
        ts.isNonNullExpression(parent))) {
        node = parent
        parent = parent.parent
    }

    if (parent && ts.isBinaryExpression(parent) && EQUALITY_OPERATORS.has(parent.operatorToken.kind)) {
        return 'comparison-operand'
    }
    if (parent && ts.isCallExpression(parent) && parent.arguments.includes(node)) {
        const name = calleeName(parent)
        if (name && VALUE_COMPARISON_CALLEES.has(name)) return `comparison-argument:${name}`
    }
    return null
}

/** Is `ref` consumed as a boolean — the whole expression, or an operand of
 *  `&&` / `||` / `??` / `!` / a ternary condition? */
function conditionContext (ref, rootExpression) {
    let node = ref
    let parent = node.parent

    while (parent && (ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent) ||
        ts.isNonNullExpression(parent))) {
        node = parent
        parent = parent.parent
    }

    if (node === rootExpression) return 'condition-root'
    if (parent && ts.isBinaryExpression(parent) && LOGICAL_OPERATORS.has(parent.operatorToken.kind)) {
        return 'condition-operand'
    }
    if (parent && ts.isPrefixUnaryExpression(parent) && parent.operator === ts.SyntaxKind.ExclamationToken) {
        return 'condition-negated'
    }
    if (parent && ts.isConditionalExpression(parent) && parent.condition === node) {
        return 'condition-ternary'
    }
    return null
}

/**
 * Collect the template expressions this guard judges, with their context.
 * `v-on` (owned by `dead-handlers`) and `v-bind` (callback props are
 * legitimate) are both excluded.
 */
export function collectJudgedExpressions (templateSource) {
    const out = []
    let ast
    try {
        ast = parseTemplate(templateSource, { onError: () => {} })
    } catch {
        return out
    }

    const walk = (node) => {
        if (node.type === NodeTypes.INTERPOLATION && node.content && node.content.content) {
            out.push({
                context: 'interpolation',
                text: node.content.content,
                line: node.content.loc.start.line
            })
        }
        if (node.type === NodeTypes.ELEMENT) {
            for (const prop of node.props || []) {
                if (prop.type !== NodeTypes.DIRECTIVE) continue
                if (!CONDITION_DIRECTIVES.has(prop.name)) continue
                if (!prop.exp || !prop.exp.content) continue
                out.push({
                    context: `v-${prop.name}`,
                    text: prop.exp.content,
                    line: prop.exp.loc.start.line
                })
            }
        }
        for (const child of node.children || []) walk(child)
    }
    walk(ast)

    return out
}

/**
 * Judge one template expression.
 *
 * @returns Array<{ kind: string, name: string }>
 */
export function analyseTemplateExpression (text, context, localCallables) {
    const sf = parseExpression(text)
    if (!sf) return []

    const statement = sf.statements[0]
    if (!statement || !ts.isExpressionStatement(statement)) return []

    const root = unwrap(statement.expression)
    const findings = []

    for (const ref of bareReferences(sf, statement.expression, localCallables)) {
        const comparison = comparisonContext(ref)
        if (comparison) {
            findings.push({ kind: comparison, name: ref.text })
            continue
        }
        if (context === 'interpolation') {
            // Anything left in an interpolation is stringified into the DOM.
            // A callback argument (`{{ items.map(render) }}`) is the one
            // legitimate shape — `bareReferences` cannot tell it apart, so
            // arguments of NON-comparison calls are skipped here.
            const parent = ref.parent
            const isCallArgument = parent && ts.isCallExpression(parent) && parent.arguments.includes(ref)
            if (!isCallArgument) findings.push({ kind: 'interpolation', name: ref.text })
            continue
        }
        const condition = conditionContext(ref, root)
        if (condition) findings.push({ kind: condition, name: ref.text })
    }

    return findings
}

/**
 * Judge a `<script setup>` body — shape 3 only (a function handed to a
 * value-comparison helper, or compared with `===`). Conditions and
 * interpolations have no meaning outside a template.
 */
export function analyseScriptBody (scriptBody, localCallables) {
    const findings = []
    if (!scriptBody) return findings

    let sf
    try {
        sf = ts.createSourceFile('script.ts', scriptBody, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    } catch {
        return findings
    }

    for (const ref of bareReferences(sf, sf, localCallables)) {
        const comparison = comparisonContext(ref)
        if (!comparison) continue
        findings.push({
            kind: comparison,
            name: ref.text,
            line: sf.getLineAndCharacterOfPosition(ref.getStart(sf)).line + 1,
            text: ref.parent.getText(sf).replace(/\s+/g, ' ').slice(0, 120)
        })
    }

    return findings
}

/**
 * Analyse one SFC source string end-to-end.
 *
 * @returns {{ findings: Array<{context:string, text:string, line:number, kind:string, name:string}> }}
 */
export function analyseSource (source, filename = 'component.vue') {
    const template = extractTemplate(source, filename)
    const script = extractScriptBody(source, filename)
    const localCallables = collectLocalFunctionLiterals(script.body)

    const findings = []

    if (template) {
        for (const expression of collectJudgedExpressions(template.body)) {
            for (const r of analyseTemplateExpression(expression.text, expression.context, localCallables)) {
                findings.push({
                    context: expression.context,
                    text: expression.text,
                    kind: r.kind,
                    name: r.name,
                    // `template.startLine` is the absolute line of the
                    // `<template>` tag; `expression.line` is 1-based from the
                    // start of the template CONTENT, which begins on that
                    // same line — so content line 1 maps to `startLine`.
                    line: template.startLine + expression.line - 1
                })
            }
        }
    }

    for (const f of analyseScriptBody(script.body, localCallables)) {
        findings.push({
            context: '(script)',
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
        console.log(`function-as-value found ... : ${withFindings.reduce((n, r) => n + r.findings.length, 0)} across ${withFindings.length} component(s)`)
        for (const r of withFindings) {
            console.log(`  ${r.pascalName}`)
            for (const f of r.findings) {
                console.log(`    ${r.relative}:${f.line}  ${f.context}="${f.text}"  [${f.kind}: ${f.name}]`)
            }
        }
    }
}
