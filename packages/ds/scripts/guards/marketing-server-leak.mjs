#!/usr/bin/env node
/**
 * Guard 32 — no marketing CLIENT file may reach SERVER-ONLY code (#1255).
 *
 * RULE: since #1255 the marketing server utilities live FLAT in
 * `packages/marketing/src/{utils,consts,interfaces,types}` instead of
 * `server/utils`. That is the owner's layout, and it removes the folder that
 * used to say "this is server code" — nothing but a convention stops a page
 * from importing `db.util` and dragging TypeORM into the browser bundle. This
 * guard is that stop.
 *
 * WHAT IS SERVER-ONLY (a "seed")
 *   a. every file under `packages/marketing/src/server/` and `…/scripts/`;
 *   b. every file with a RUNTIME import of a server package (`typeorm`, `pg`,
 *      `reflect-metadata`, `ioredis`, `nodemailer`, `h3`, `nitropack`) or of a
 *      Node builtin (`node:*`);
 *   c. the files listed in `SERVER_ONLY_FILES` — the former `server/utils/`
 *      modules. They are listed on purpose: `reference-cache` and
 *      `reference-mappers` import nothing server-side, so (a) and (b) cannot
 *      see them, yet they only make sense inside Nitro.
 *
 * WHAT IS CLIENT (a "root")
 *   `src/pages`, `src/components`, `src/composables`, `src/layouts`,
 *   `src/middleware`, `src/plugins` (except `*.server.ts`), `src/services`,
 *   `src/app.vue`, `src/error.vue`.
 *
 * HOW IT DECIDES
 *   It follows RUNTIME imports transitively from every root. A leak is any
 *   chain root → … → seed. Reporting the chain matters: the offender is often
 *   a shared const or util two hops away, not the file the author touched.
 *   `import type` / `export type` / all-`type` specifier lists are erased by the
 *   compiler and can never put code in a bundle, so they are not followed.
 *
 * ⛔ Files are enumerated through the GIT INDEX (`listRepoFiles`), never
 * `readdirSync` — see `lib/git-files.mjs` (issue #966): a disk walk measures
 * the machine that runs it, not the repository.
 *
 * Run: `node packages/ds/scripts/guards/marketing-server-leak.mjs`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSFC } from 'vue/compiler-sfc'
import ts from 'typescript'
import { report } from './lib/baseline.mjs'
import { listRepoFiles } from './lib/git-files.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')
const MARKETING_DIR = path.join(REPO_ROOT, 'packages/marketing')
const BASELINE_PATH = path.join(__dirname, 'baseline/marketing-server-leak.json')

/** Client roots, relative to `packages/marketing`. A trailing `/` is a directory prefix. */
export const CLIENT_ROOTS = [
    'src/pages/', 'src/components/', 'src/composables/', 'src/layouts/',
    'src/middleware/', 'src/plugins/', 'src/services/', 'src/app.vue', 'src/error.vue'
]

/** Packages whose runtime import makes a file server-only. */
export const SERVER_PACKAGES = /^(?:typeorm(?:-naming-strategies)?|reflect-metadata|pg(?:-[\w-]+)?|ioredis|nodemailer|h3|nitropack(?:\/.*)?|node:.+)$/

/** Server utilities that no import-based rule can see (see header, rule c). */
export const SERVER_ONLY_FILES = [
    'src/utils/admin-auth.util.ts',
    'src/utils/admin-mappers.util.ts',
    'src/utils/catalog-neighbours.util.ts',
    'src/utils/catalog-queries.util.ts',
    'src/utils/db.util.ts',
    'src/utils/devtools-plugin-queue.util.ts',
    'src/utils/doc-fixture-sync.util.ts',
    'src/utils/reference-cache.util.ts',
    'src/utils/reference-locale.util.ts',
    'src/utils/reference-mappers.util.ts',
    'src/utils/reference-validation.util.ts'
]

const SOURCE_RE = /\.(?:ts|mjs|js|vue)$/
const RESOLVE_SUFFIXES = ['', '.ts', '.mjs', '.js', '.vue', '/index.ts']

export const isClientRoot = (rel) =>
    !/\.server\.(?:ts|mjs|js)$/.test(rel) &&
    CLIENT_ROOTS.some(r => (r.endsWith('/') ? rel.startsWith(r) : rel === r))

/**
 * Runtime import specifiers of one file. `import type`, `export type` and
 * import lists made only of `type` specifiers are erased by the compiler and
 * are skipped.
 */
export function runtimeImports (rel, content) {
    let code = content
    if (rel.endsWith('.vue')) {
        const { descriptor } = parseSFC(content, { filename: rel })
        code = [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n')
    }
    const sf = ts.createSourceFile(rel.replace(/\.vue$/, '.ts'), code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const specs = []
    const visit = (node) => {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            const clause = node.importClause
            const named = clause?.namedBindings
            const onlyTypes = clause && (clause.isTypeOnly ||
                (!clause.name && named && ts.isNamedImports(named) && named.elements.length > 0 && named.elements.every(e => e.isTypeOnly)))
            if (!onlyTypes) specs.push(node.moduleSpecifier.text)
        } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            if (!node.isTypeOnly) specs.push(node.moduleSpecifier.text)
        } else if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]) &&
            (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
            specs.push(node.arguments[0].text)
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
    return specs
}

function resolveSpec (spec, fromRel, files) {
    let base
    if (spec.startsWith('~/') || spec.startsWith('@/')) base = 'src/' + spec.slice(2)
    else if (spec.startsWith('~~/') || spec.startsWith('@@/')) base = spec.slice(3)
    else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec))
    else return null
    for (const suffix of RESOLVE_SUFFIXES) {
        if (files.has(base + suffix)) return base + suffix
    }
    return null
}

/**
 * Pure core (no disk access) so the self-test can feed fixtures.
 *
 * @param files Map<path relative to packages/marketing, source text>
 * @returns Map<id, detail> — id is `<client file>::<server file>`
 */
export function findServerLeaks (files) {
    const graph = new Map()
    const seeds = new Map()

    for (const [rel, content] of files) {
        if (!SOURCE_RE.test(rel)) continue
        const edges = []
        let reason = null
        if (rel.startsWith('src/server/') || rel.startsWith('scripts/')) reason = 'lives under src/server/ or scripts/'
        else if (SERVER_ONLY_FILES.includes(rel)) reason = 'listed in SERVER_ONLY_FILES'
        for (const spec of runtimeImports(rel, content)) {
            const target = resolveSpec(spec, rel, files)
            if (target) edges.push(target)
            else if (SERVER_PACKAGES.test(spec) && !reason) reason = `imports \`${spec}\``
        }
        graph.set(rel, edges)
        if (reason) seeds.set(rel, reason)
    }

    const violations = new Map()
    for (const root of graph.keys()) {
        if (!isClientRoot(root)) continue
        const parent = new Map([[root, null]])
        const queue = [root]
        while (queue.length) {
            const current = queue.shift()
            if (seeds.has(current)) {
                const chain = []
                for (let n = current; n !== null; n = parent.get(n)) chain.unshift(n)
                violations.set(`${root}::${current}`, `${chain.join(' → ')}  (${current} is server-only: ${seeds.get(current)})`)
                continue
            }
            for (const next of graph.get(current) ?? []) {
                if (!parent.has(next)) {
                    parent.set(next, current)
                    queue.push(next)
                }
            }
        }
    }
    return violations
}

function run () {
    const files = new Map()
    for (const abs of listRepoFiles(MARKETING_DIR, REPO_ROOT)) {
        const rel = path.relative(MARKETING_DIR, abs).split(path.sep).join('/')
        if (!SOURCE_RE.test(rel) || !/^(?:src|server|scripts)\//.test(rel)) continue
        files.set(rel, readFileSync(abs, 'utf8'))
    }
    const clientRoots = [...files.keys()].filter(isClientRoot).length

    const violations = findServerLeaks(files)
    const exitCode = report({
        guardName: 'marketing-server-leak (no client file may reach server-only code)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Move the shared part to a util/const that does not import TypeORM, pg, node:* or a server util, or call the server through an /api route and a src/services/*.service.ts.',
        coverageNote: `Scanned ${files.size} marketing source file(s), ${clientRoots} client root(s), ${SERVER_ONLY_FILES.length} listed server util(s).`
    })
    process.exit(exitCode)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    run()
}
