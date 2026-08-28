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

import { readFileSync, readdirSync, statSync } from 'node:fs'
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
    const { eager, transitive } = collectEagerReads({
        sf, root: sf, atRisk, lineAt: node => lineOf(source, block.start + node.getStart(sf))
    })

    return { propsVars: [...propsVars], callsUseDefaults, resolvedPropsVar, eager, transitive }
}

/*********************************************************
 * collectEagerReads — le coeur partagé
 *
 * @description
 * Le même parcours sert deux racines différentes. Dans un composant, la
 * profondeur 0 est le corps de `setup()`. Dans un COMPOSABLE, c'est le corps
 * de la fonction exportée — puisqu'elle est appelée DEPUIS `setup()`, tout
 * ce qui s'y trouve à profondeur 0 s'exécute pendant `setup()`, donc avant
 * que le résolveur ADR-005 n'écrive. La règle est identique ; seule la
 * racine et la variable à risque changent.
 ********************************************************/
function collectEagerReads ({ sf, root, atRisk, lineAt }) {
    const eager = []
    const transitive = []

    const record = (kind, prop, text, node) => {
        eager.push({ kind, prop, text, line: lineAt(node) })
    }

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
                            transitive.push({ callee, text: `${callee}(${arg.text})`, line: lineAt(node) })
                        }
                    }
                }
            }
        }

        ts.forEachChild(node, c => walk(c, nextDepth))
    }

    // The root itself is the depth-0 frame: its own children start at 0, and a
    // nested function among them takes them to 1.
    ts.forEachChild(root, c => walk(c, 0))

    return { eager, transitive }
}

/*********************************************************
 * analyseComposableSource — #504
 *
 * @description
 * Le scanner ne regardait que les `Origam*.vue` : `getRealComponents()`
 * filtre sur l'extension `.vue` ET le préfixe `Origam`, donc AUCUN fichier de
 * `src/composables/` n'a jamais été analysé. Or c'est là que le défaut
 * ADR-005 mord le plus fort, parce qu'un composable est partagé : `useLink`
 * figeait `tag` dans une chaîne et `useVModel` amorçait sa ref au setup, ce
 * qui a cassé les props thématisées de 16 composants à elles deux.
 *
 * @description
 * La règle est la même, la racine change. Un composable est APPELÉ depuis
 * `setup()` : tout ce qui se trouve à profondeur de fonction 0 dans son corps
 * s'exécute donc pendant `setup()`, avant que le résolveur n'écrive. La
 * variable à risque n'est plus le retour de `withDefaults()` mais le
 * PARAMÈTRE qui reçoit l'objet props de l'appelant.
 *
 * @description
 * ⛔ Un paramètre nommé `props` ne suffit pas à conclure. Il n'est à risque
 * que si l'appelant lui passe vraiment l'objet réactif du composant, ce que
 * ce détecteur ne vérifie pas — il rapporte donc des CANDIDATS, et chacun se
 * tranche en regardant si la valeur lue est ensuite figée (un local, un
 * argument évalué) ou relue à chaque accès.
 ********************************************************/
const PROPS_PARAM_NAMES = new Set(['props', 'properties'])

export function analyseComposableSource (source, filename = 'composable.ts') {
    const sf = ts.createSourceFile(filename, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const fns = []

    const isExported = node => node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)

    const visit = (node) => {
        let name = null
        let fn = null

        if (ts.isFunctionDeclaration(node) && node.name && isExported(node)) {
            name = node.name.text
            fn = node
        } else if (ts.isVariableStatement(node) && isExported(node)) {
            for (const decl of node.declarationList.declarations) {
                if (ts.isIdentifier(decl.name) && decl.initializer &&
                    (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                    name = decl.name.text
                    fn = decl.initializer
                }
            }
        }

        if (name && fn?.body) {
            const propsParam = fn.parameters.find(
                p => ts.isIdentifier(p.name) && PROPS_PARAM_NAMES.has(p.name.text)
            )
            if (propsParam) {
                const atRisk = new Set([propsParam.name.text])
                const { eager, transitive } = collectEagerReads({
                    sf, root: fn.body, atRisk, lineAt: n => lineOf(source, n.getStart(sf))
                })
                fns.push({ fn: name, param: propsParam.name.text, eager, transitive })
            } else {
                fns.push({ fn: name, param: null, eager: [], transitive: [] })
            }
        }

        ts.forEachChild(node, visit)
    }
    visit(sf)

    return fns
}

/** Analyse every composable under `src/composables`. */
export function analyseComposables () {
    const dir = path.join(DS_ROOT, 'src/composables')
    const out = []
    const walkDir = (d) => {
        for (const entry of readdirSync(d)) {
            const full = path.join(d, entry)
            if (statSync(full).isDirectory()) { walkDir(full); continue }
            if (!full.endsWith('.ts') || full.endsWith('index.ts')) continue
            for (const row of analyseComposableSource(readFileSync(full, 'utf8'), path.basename(full))) {
                out.push({ ...row, relative: path.relative(DS_ROOT, full) })
            }
        }
    }
    walkDir(dir)
    return out
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

        /*
         * #504 — la moitié qui manquait. Aucun fichier de src/composables
         * n'était analysé, alors que c'est là que le défaut porte le plus
         * loin : un composable est partagé par des dizaines de composants.
         */
        const fns = analyseComposables()
        const candidates = fns.filter(r => r.param)
        const offenders = candidates.filter(r => r.eager.length)
        console.log('')
        console.log(`exported use*() in src/composables: ${fns.length}`)
        console.log(`  taking a props parameter ....... ${candidates.length}`)
        console.log(`eager reads of that parameter: ${offenders.length}`)
        for (const r of offenders) {
            const props = [...new Set(r.eager.map(e => e.prop))].join(', ')
            console.log(`  ${r.fn.padEnd(24)} ${String(r.eager.length).padStart(2)}  [${props}]  ${r.relative}`)
        }
    }
}
