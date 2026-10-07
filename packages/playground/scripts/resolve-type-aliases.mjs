/*
 * SOURCE B, stage 2 — resolve NAMED type aliases to their literal members.
 *
 * Why this stage exists, measured rather than assumed. `vue-component-meta`
 * prints a prop's type via the TypeScript printer, and the printer PRESERVES
 * an alias name whenever the type carries one. So a prop declared
 * `location?: TAnchor` prints as `"TAnchor | undefined"` — and stage 1
 * (`extract-literal-unions.mjs`) correctly refuses to guess at it, because a
 * name is not a member list.
 *
 * ⛔ That is NOT a uniform behaviour, which is exactly why it has to be
 * measured per alias instead of reasoned about. Two aliases of apparently the
 * same shape print differently:
 *
 *   TKbdVariant = `${KBD_VARIANT}`        -> printed EXPANDED, 3 members
 *   TDirectionBoth = TBlock | TInline     -> printed as the NAME, opaque
 *
 * A single template-literal type gets normalised into a literal union and the
 * printer has no alias to fall back on; a UNION of aliases keeps its own
 * alias symbol. Relying on the printed form alone therefore loses a picker on
 * a prop whose options are perfectly knowable.
 *
 * Measured on `develop` @ bcb9dc909, over the 28 bare `T*` aliases stage 1
 * left opaque: 13 ARE finite literal unions (TAnchor 18 members, TCols 14,
 * TGridPlaceContent 7, …) and 15 genuinely are not (`TColor` admits `string`,
 * `TIcon` admits a `Component`, `TElevation` is `number | string`). The 15
 * are not a gap — a playground renders a free-text or structured control for
 * them. The 13 were, and this stage closes them.
 *
 * Keyed by ALIAS rather than by prop on purpose: 74 distinct aliases carry
 * the surface that 1 561 prop entries reference, so the option lists are
 * written once and shared.
 *
 * Usage: pnpm -F @origam/playground meta:aliases
 */

import ts from 'typescript'
import path from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { REPO_ROOT } from './lib/component-files.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const META_DIR = path.join(HERE, '..', '.metadata')
const DS_TSCONFIG = path.join(REPO_ROOT, 'packages/ds/tsconfig.json')

/*
 * A file that does not exist on disk, injected into the compiler host below.
 * It sits inside `packages/ds/src` so the DS tsconfig's `include` covers it
 * and the relative import of the types barrel resolves.
 */
const VIRTUAL_FILE = path.join(REPO_ROOT, 'packages/ds/src/__playground_alias_probe__.ts')

/** Alias names referenced by a prop type that stage 1 could not enumerate. */
export function aliasNamesFromUnions (unions) {
    const names = new Set()

    for (const component of unions.components) {
        if (!component.usable) continue

        for (const prop of Object.values(component.props)) {
            if (prop.options) continue

            const bare = String(prop.tsType ?? '').replace(/ \| undefined$/, '').replace(/ \| null$/, '').trim()

            // Only a BARE alias reference can be looked up by name. A composite
            // (`string | IGradient`, `TIcon[]`) is not an alias to resolve.
            if (/^T[A-Z][A-Za-z0-9_]*$/.test(bare)) names.add(bare)
        }
    }

    return [...names].sort()
}

function buildProgram (names) {
    const members = names.map(n => `'${n}': All.${n}`).join('; ')
    const decls = names.map((n, i) => `declare const probe${i}: Probe['${n}']`).join('\n')
    const source = `import type * as All from './types/index'\ntype Probe = { ${members} }\n${decls}\n`

    const read = ts.readConfigFile(DS_TSCONFIG, ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, path.dirname(DS_TSCONFIG))
    const host = ts.createCompilerHost(parsed.options, true)
    const isVirtual = f => path.resolve(f) === path.resolve(VIRTUAL_FILE)

    const getSourceFile = host.getSourceFile.bind(host)
    const fileExists = host.fileExists.bind(host)
    const readFile = host.readFile.bind(host)

    host.getSourceFile = (fileName, languageVersion, ...rest) => (
        isVirtual(fileName)
            ? ts.createSourceFile(fileName, source, languageVersion, true)
            : getSourceFile(fileName, languageVersion, ...rest)
    )
    host.fileExists = fileName => (isVirtual(fileName) ? true : fileExists(fileName))
    host.readFile = fileName => (isVirtual(fileName) ? source : readFile(fileName))

    return ts.createProgram([VIRTUAL_FILE], parsed.options, host)
}

export function resolveTypeAliases (names) {
    if (names.length === 0) return {}

    const program = buildProgram(names)
    const checker = program.getTypeChecker()
    const sourceFile = program.getSourceFile(VIRTUAL_FILE)

    if (!sourceFile) throw new Error('the virtual probe file did not enter the program')

    /**
     * ⛔ `undefined` / `null` members are SKIPPED, not treated as blockers: an
     * optional prop's type always carries `undefined`, and counting it as a
     * non-literal member would make every optional union look unenumerable.
     */
    function literalOf (type) {
        if (type.isStringLiteral()) return { literal: true, value: type.value }
        if (type.isNumberLiteral()) return { literal: true, value: type.value }
        if (type.flags & ts.TypeFlags.BooleanLiteral) return { literal: true, value: checker.typeToString(type) === 'true' }
        if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) return { skip: true }

        return { literal: false, printed: checker.typeToString(type) }
    }

    function classify (type) {
        const printed = checker.typeToString(type)

        if (!type.isUnion()) return { printed, enumerable: false, reason: `not a union (${printed})` }

        const members = []
        const blockers = []

        for (const member of type.types) {
            const described = literalOf(member)

            if (described.skip) continue
            if (described.literal) members.push(described.value)
            else blockers.push(described.printed)
        }

        if (blockers.length > 0) {
            return {
                printed,
                enumerable: false,
                reason: `admits non-literal member(s): ${[...new Set(blockers)].slice(0, 3).join(', ').slice(0, 200)}`
            }
        }

        return { printed, enumerable: true, options: members }
    }

    const resolved = {}

    const visit = node => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const match = /^probe(\d+)$/.exec(node.name.text)

            if (match) {
                resolved[names[Number(match[1])]] = classify(checker.getTypeAtLocation(node.name))
            }
        }

        ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    return resolved
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const unionsFile = path.join(META_DIR, 'unions.json')

    if (!existsSync(unionsFile)) {
        console.error('missing .metadata/unions.json — run meta:unions first')
        process.exit(1)
    }

    const names = aliasNamesFromUnions(JSON.parse(readFileSync(unionsFile, 'utf8')))
    const started = Date.now()
    const resolved = resolveTypeAliases(names)

    const entries = Object.entries(resolved)
    const enumerable = entries.filter(([, r]) => r.enumerable)

    const out = path.join(META_DIR, 'aliases.json')

    mkdirSync(META_DIR, { recursive: true })
    writeFileSync(out, `${JSON.stringify({ source: 'typescript-alias-resolution', aliases: resolved }, null, 2)}\n`)

    console.log(`ALIASES_QUERIED=${names.length}`)
    console.log(`ALIASES_RESOLVED=${entries.length}`)
    console.log(`FINITE_LITERAL_UNION=${enumerable.length}`)
    console.log(`NOT_ENUMERABLE=${entries.length - enumerable.length}`)
    console.log(`ELAPSED_S=${((Date.now() - started) / 1000).toFixed(1)}`)
    console.log('\n--- enumerable (a picker is possible) ---')
    for (const [name, r] of enumerable) console.log(`${name}\t${r.options.length}\t${JSON.stringify(r.options).slice(0, 120)}`)
    console.log('\n--- not enumerable (free-form or structured control) ---')
    for (const [name, r] of entries.filter(([, r]) => !r.enumerable)) console.log(`${name}\t${r.reason}`)
    console.log(`\nwritten: ${path.relative(REPO_ROOT, out)}`)
}
