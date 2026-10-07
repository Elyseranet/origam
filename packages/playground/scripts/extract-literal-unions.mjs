/*
 * SOURCE B — the LITERAL UNION members, resolved at build time.
 *
 * The question this script exists to answer. `variant?: TKbdVariant` compiles
 * to `type: String` in the runtime descriptor: the union's members are ERASED
 * at runtime, so Source A can say "this prop is a string" and never "this
 * prop is one of these three strings". A playground that cannot enumerate a
 * union cannot offer a picker for it, which is most of what a playground is.
 *
 * `vue-component-meta` is the purpose-built tool, built on the same
 * `@vue/language-core` that `vue-tsc` uses. It is version-locked to it:
 * `vue-component-meta@3.3.6` depends on `@vue/language-core@3.3.6` and
 * `@volar/typescript@2.4.28`, both of which this repo's `vue-tsc@3.3.6`
 * already pulled in — so adding it cost exactly ONE new package.
 *
 * ⛔ It runs a real TypeScript program over the SFCs. That is slow and it is
 * the reason this is a BUILD step whose output is committed/cached, never
 * something the playground does at runtime.
 *
 * Usage:
 *   pnpm -F @origam/playground meta:unions                 # all components
 *   pnpm -F @origam/playground meta:unions -- --only OrigamBtn,OrigamKbd
 */

import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createChecker } from 'vue-component-meta'

import { REPO_ROOT, componentNameOf, familyOf, listComponentFiles } from './lib/component-files.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const TSCONFIG = path.join(REPO_ROOT, 'packages/ds/tsconfig.json')

/*
 * Props every component inherits from Vue itself or from the DS's cross
 * cutting Commons interfaces are not interesting per component — they would
 * multiply the output by ~60 and bury the component's own surface. The
 * `global: false` option already drops Vue's; this set is only for reporting.
 */
const NOISE_PROPS = new Set(['key', 'ref', 'ref_for', 'ref_key', 'class', 'style'])

/**
 * `vue-component-meta` returns a `type` STRING for every prop — the
 * TypeScript type as the compiler prints it. A literal union prints as
 * `"'a' | 'b' | 'c'"`, possibly with `undefined` for an optional prop.
 * This parses that printed form back into members.
 *
 * ⛔ Parsed from the PRINTED type rather than walked structurally, because
 * the printer is what normalises an aliased union (`TKbdVariant`) into its
 * members in the first place. A `schema` walk is available and richer, but it
 * also expands object types recursively and blows up on the DS's deeper
 * props; the printed form is the cheap, bounded answer to the one question
 * asked here.
 */
function parseLiteralUnion (printed) {
    if (typeof printed !== 'string') return null

    const parts = printed.split('|').map(s => s.trim()).filter(Boolean)

    if (parts.length < 2) return null

    const members = []

    for (const part of parts) {
        if (part === 'undefined' || part === 'null') continue

        const quoted = /^(["'])(.*)\1$/.exec(part)

        if (quoted) { members.push(quoted[2]); continue }
        if (/^-?\d+(\.\d+)?$/.test(part)) { members.push(Number(part)); continue }
        if (part === 'true' || part === 'false') { members.push(part === 'true'); continue }

        // A non-literal member (an object type, `string`, `number`, a generic)
        // means this is not a pure literal union — a picker cannot enumerate
        // it, so it must NOT be reported as one.
        return null
    }

    return members.length >= 2 ? members : null
}

function parseOnly (argv) {
    const i = argv.indexOf('--only')

    return i === -1 ? null : new Set(argv[i + 1].split(',').map(s => s.trim()))
}

export function extractLiteralUnions ({ only = null } = {}) {
    const checker = createChecker(TSCONFIG, {
        forceUseTs: true,
        noDeclarations: false,
        printer: { newLine: 1 }
    })

    const files = listComponentFiles().filter(f => !only || only.has(componentNameOf(f)))
    const components = []

    for (const file of files) {
        const name = componentNameOf(file)
        const entry = { name, family: familyOf(file), file: path.relative(REPO_ROOT, file) }

        try {
            const meta = checker.getComponentMeta(file)
            const props = {}
            let unionCount = 0

            for (const prop of meta.props) {
                if (prop.global || NOISE_PROPS.has(prop.name)) continue

                const members = parseLiteralUnion(prop.type)

                if (members) unionCount += 1

                props[prop.name] = {
                    tsType: prop.type,
                    required: prop.required === true,
                    default: prop.default ?? null,
                    description: prop.description || null,
                    options: members
                }
            }

            components.push({
                ...entry,
                usable: true,
                propCount: Object.keys(props).length,
                unionCount,
                events: meta.events.map(e => ({ name: e.name, type: e.type, description: e.description || null })),
                slots: meta.slots.map(s => ({ name: s.name, type: s.type, description: s.description || null })),
                props
            })
        } catch (error) {
            components.push({
                ...entry,
                usable: false,
                reason: `checker threw: ${String(error && error.message).split('\n')[0].slice(0, 300)}`
            })
        }
    }

    return { source: 'vue-component-meta', version: '3.3.6', components }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const started = Date.now()
    const result = extractLiteralUnions({ only: parseOnly(process.argv) })
    const usable = result.components.filter(c => c.usable)
    const failed = result.components.filter(c => !c.usable)

    const out = path.join(HERE, '..', '.metadata', 'unions.json')

    mkdirSync(path.dirname(out), { recursive: true })
    writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`)

    console.log(`TOTAL=${result.components.length}`)
    console.log(`USABLE=${usable.length}`)
    console.log(`FAILED=${failed.length}`)
    console.log(`TOTAL_PROPS=${usable.reduce((n, c) => n + c.propCount, 0)}`)
    console.log(`PROPS_WITH_ENUMERABLE_OPTIONS=${usable.reduce((n, c) => n + c.unionCount, 0)}`)
    console.log(`TOTAL_EVENTS=${usable.reduce((n, c) => n + c.events.length, 0)}`)
    console.log(`TOTAL_SLOTS=${usable.reduce((n, c) => n + c.slots.length, 0)}`)
    console.log(`ELAPSED_S=${((Date.now() - started) / 1000).toFixed(1)}`)
    for (const c of failed) console.log(`FAILED\t${c.name}\t${c.reason}`)
    console.log(`\nwritten: ${path.relative(REPO_ROOT, out)}`)
}
