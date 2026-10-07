/*
 * SOURCE A — the RUNTIME props descriptor.
 *
 * What it measures, and why this source exists at all. The Vue SFC compiler
 * turns `defineProps<IXxxProps>()` into a runtime props options descriptor
 * whose keys are the interface's resolved property set with the whole
 * `extends` chain FLATTENED. Reading `Component.props` is therefore a direct
 * observation of the real prop surface — immune to where an `Omit` is
 * written, what it is named, and how many files it crosses. That is the
 * argument `packages/tests/TU/components/Bracket/bracket-logical-side-restriction.spec.ts`
 * already makes for one component; this script makes it for all of them.
 *
 * ⛔ What this source CANNOT give, by construction: the members of a literal
 * union. `variant?: TKbdVariant` compiles to `type: String` — the seven
 * values are erased at runtime and no amount of descriptor reading brings
 * them back. That is Source B's job (`extract-literal-unions.mjs`).
 *
 * The SFCs are loaded through a real Vite SSR pipeline rather than parsed as
 * text, for the same reason the Bracket spec reads the descriptor rather than
 * grepping for `Omit`: a grep over source text cannot answer a question about
 * a resolved type.
 *
 * Usage: pnpm -F @origam/playground meta:runtime [-- --out <file>]
 */

import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

import { REPO_ROOT, componentNameOf, familyOf, listComponentFiles } from './lib/component-files.mjs'

const DS_SRC = path.join(REPO_ROOT, 'packages/ds/src')

/*
 * Mirrors the alias set `packages/tests/vitest.config.ts` uses, so a
 * component resolves here exactly as it does under the unit suite. The
 * `origam/<subpath>` entries matter: DS source imports those published
 * specifiers in places, and they would otherwise resolve through
 * package.json `exports` to `dist/` — a build artefact this script must not
 * require.
 */
/*
 * ⛔ `vue` must be loaded by NODE, not inlined by Vite, and the three obvious
 * routes all fail — each measured here, each producing an identical, total
 * 218/218 "failure" that reads exactly like a catastrophic DS defect:
 *
 *   1. Letting Vite INLINE it -> `module is not defined`. vue's `index.mjs`
 *      is one line, `export * from './index.js'`, and `index.js` is CJS
 *      (`module.exports = require('./dist/vue.cjs.js')`).
 *   2. `ssr: { external: ['vue'] }` with the Vite root at the REPO root ->
 *      `Cannot find module 'vue'`. Vite resolves SSR externals from its root,
 *      and pnpm's isolated layout puts NO `node_modules/vue` at the workspace
 *      root: vue is a dependency of the packages, never of the root.
 *   3. Aliasing `vue` to an absolute path -> back to case 1, since an
 *      absolute path no longer matches the external list.
 *
 * What works is rooting Vite at THIS package, which declares vue 3.5.39 and
 * therefore has the symlink, and externalising it there. `server.fs.allow`
 * then has to be widened back to the repo root, because the components being
 * loaded live outside that root.
 */
const PLAYGROUND_ROOT = path.resolve(HERE, '..')

const ALIASES = {
    '@origam': DS_SRC,
    'origam/enums': path.join(DS_SRC, 'enums/index.ts'),
    'origam/utils': path.join(DS_SRC, 'utils/index.ts'),
    'origam/consts': path.join(DS_SRC, 'consts/index.ts'),
    'origam/types': path.join(DS_SRC, 'types/index.ts'),
    'origam/interfaces': path.join(DS_SRC, 'interfaces/index.ts')
}

/**
 * A runtime `type` entry is a constructor, an array of them, or absent.
 * Reduced to its name(s) so the result is serialisable and diffable.
 */
function describeRuntimeType (type) {
    if (type == null) return null
    if (Array.isArray(type)) return type.map(describeRuntimeType)
    if (typeof type === 'function') return type.name || 'anonymous'

    return String(type)
}

/**
 * ⛔ A `default` that is a FUNCTION is ambiguous in the descriptor and cannot
 * be disambiguated from outside: for an Object/Array-typed prop Vue treats it
 * as a FACTORY (call it to get the value), for a Function-typed prop it IS
 * the value. We record which case applies rather than calling it — invoking a
 * factory here would execute component code outside any component instance.
 */
function describeDefault (descriptor) {
    if (!descriptor || typeof descriptor !== 'object' || !('default' in descriptor)) {
        return { kind: 'absent' }
    }

    const value = descriptor.default

    if (typeof value === 'function') {
        return { kind: 'function', note: 'factory for Object/Array props, literal value for Function props — not invoked here' }
    }

    return { kind: typeof value, value }
}

export async function extractRuntimeMetadata () {
    const files = listComponentFiles()

    const server = await createServer({
        configFile: false,
        root: PLAYGROUND_ROOT,
        logLevel: 'error',
        plugins: [vue()],
        resolve: { alias: ALIASES },
        ssr: { external: ['vue'] },
        server: { middlewareMode: true, watch: null, fs: { allow: [REPO_ROOT] } }
    })

    const components = []

    for (const file of files) {
        const name = componentNameOf(file)
        const entry = {
            name,
            family: familyOf(file),
            file: path.relative(REPO_ROOT, file)
        }

        try {
            const loaded = await server.ssrLoadModule(file)
            const component = loaded.default

            if (!component) {
                components.push({ ...entry, usable: false, reason: 'module has no default export' })
                continue
            }

            const declared = component.props

            if (declared === undefined) {
                components.push({ ...entry, usable: false, reason: 'Component.props is undefined — no defineProps' })
                continue
            }

            /*
             * The array form (`defineProps(['a','b'])`) carries names and
             * nothing else. It is still usable for a registry, just poorer,
             * so it is recorded as its own shape rather than lumped in.
             */
            if (Array.isArray(declared)) {
                components.push({
                    ...entry,
                    usable: true,
                    shape: 'array',
                    propCount: declared.length,
                    props: Object.fromEntries(declared.map(key => [key, { runtimeType: null, required: false, default: { kind: 'absent' } }]))
                })
                continue
            }

            const props = {}

            for (const [key, raw] of Object.entries(declared)) {
                const descriptor = raw && typeof raw === 'object' && !Array.isArray(raw) && typeof raw !== 'function'
                    ? raw
                    : { type: raw }

                props[key] = {
                    runtimeType: describeRuntimeType(descriptor.type),
                    required: descriptor.required === true,
                    default: describeDefault(descriptor),
                    hasValidator: typeof descriptor.validator === 'function'
                }
            }

            components.push({
                ...entry,
                usable: true,
                shape: 'object',
                propCount: Object.keys(props).length,
                emits: component.emits
                    ? (Array.isArray(component.emits) ? [...component.emits] : Object.keys(component.emits))
                    : null,
                inheritAttrs: component.inheritAttrs ?? null,
                props
            })
        } catch (error) {
            components.push({
                ...entry,
                usable: false,
                reason: `load threw: ${String(error && error.message).split('\n')[0].slice(0, 300)}`
            })
        }
    }

    await server.close()

    return { source: 'runtime-props-descriptor', vue: '3.5.39', components }
}

function parseOut (argv) {
    const i = argv.indexOf('--out')

    return i === -1 ? null : argv[i + 1]
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
    const result = await extractRuntimeMetadata()
    const usable = result.components.filter(c => c.usable)
    const failed = result.components.filter(c => !c.usable)
    const empty = usable.filter(c => c.propCount === 0)

    const out = parseOut(process.argv) ?? path.join(REPO_ROOT, 'packages/playground/.metadata/runtime.json')

    mkdirSync(path.dirname(out), { recursive: true })
    writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`)

    console.log(`TOTAL=${result.components.length}`)
    console.log(`USABLE=${usable.length}`)
    console.log(`FAILED=${failed.length}`)
    console.log(`USABLE_BUT_ZERO_PROPS=${empty.length}`)
    console.log(`TOTAL_PROP_ENTRIES=${usable.reduce((n, c) => n + c.propCount, 0)}`)
    console.log(`REQUIRED_PROPS=${usable.reduce((n, c) => n + Object.values(c.props).filter(p => p.required).length, 0)}`)
    console.log(`\n--- FAILED (${failed.length}) ---`)
    for (const c of failed) console.log(`${c.name}\t${c.reason}`)
    console.log(`\n--- ZERO-PROP (${empty.length}) ---`)
    for (const c of empty) console.log(c.name)
    console.log(`\nwritten: ${path.relative(REPO_ROOT, out)}`)
}
