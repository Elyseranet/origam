/*
 * Generates the standalone host's demo catalogue from REAL metadata — never
 * hand-typed prop lists.
 *
 * ⛔ Unlike `meta:runtime` / `meta:unions`, this script's OUTPUT IS COMMITTED
 * (`src/host/catalogSeed.const.ts`), not written to the gitignored
 * `.metadata/` directory. It is authoring-time tooling for the demo host, not
 * part of the build pipeline any guard walks — the standalone app needs a
 * non-empty IComponentDefinition[] to open without first running the full
 * metadata chain (`meta:runtime` requires a Vite SSR pipeline, ~20s; the host
 * must be openable from a cold checkout).
 *
 * Both sources, each for what it alone can give (see README):
 *
 *   - Source A (`runtime.json`): prop NAMES, `runtimeType`, `required`,
 *     `defaultValue` / `hasFactoryDefault`. The ONLY source of defaults.
 *   - Source B1 (`unions.json`): `tsType`, literal union `options`, JSDoc,
 *     emit payload types. Its own `default` field is NEVER read — it is the
 *     source TEXT of the expression (`SIZES.DEFAULT`), not a value.
 *   - Source B2 (`aliases.json`): the members of a union the TS printer kept
 *     behind an alias NAME (`location?: TAnchor`).
 *
 * `control` is DERIVED here by `deriveControlKind` (exported, pinned by
 * `packages/tests/TU/playground/derive-control-kind.spec.ts`), never written
 * by hand.
 *
 * Usage: pnpm -F @origam/playground meta:host-seed
 * Prerequisite: meta:runtime, meta:unions, meta:aliases (produce the inputs)
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const RUNTIME_JSON = path.join(HERE, '../.metadata/runtime.json')
const UNIONS_JSON = path.join(HERE, '../.metadata/unions.json')
const ALIASES_JSON = path.join(HERE, '../.metadata/aliases.json')
const OUT_FILE = path.join(HERE, '../src/host/catalogSeed.const.ts')

/*
 * Hand-picked for variety: a props-heavy leaf (Btn), the
 * worst-case prop count in the catalogue (Select, 161), and four more spanning
 * different categories so the catalogue drawer has something to filter.
 */
const PICK = [
    { name: 'OrigamBtn', category: 'Form & Input' },
    { name: 'OrigamSelect', category: 'Form & Input' },
    { name: 'OrigamSwitch', category: 'Form & Input' },
    { name: 'OrigamAlert', category: 'Feedback & Status' },
    { name: 'OrigamCard', category: 'Layout & Structure' },
    { name: 'OrigamChip', category: 'Data Display' },
    /*
     * Lot D (#1144) — the families that render an EMPTY BOX without data or
     * children, each paired with the sub-components its snippet nests. The
     * categories are the curated ones of `packages/marketing`'s catalogue
     * (`server/db/seed/component.json`), never inferred from the name.
     */
    { name: 'OrigamDataTable', category: 'Data Display' },
    { name: 'OrigamChart', category: 'Data Visualization' },
    { name: 'OrigamTabs', category: 'Navigation' },
    { name: 'OrigamTab', category: 'Navigation' },
    { name: 'OrigamWindow', category: 'Navigation' },
    { name: 'OrigamWindowItem', category: 'Layout & Structure' },
    { name: 'OrigamList', category: 'Data Display' },
    { name: 'OrigamListItem', category: 'Data Display' }
]

function describeDefault (entry) {
    switch (entry.default.kind) {
        case 'string':
        case 'boolean':
        case 'number':
            return { defaultValue: entry.default.value, hasFactoryDefault: false }
        case 'function':
            return { defaultValue: undefined, hasFactoryDefault: true }
        default:
            return { defaultValue: undefined, hasFactoryDefault: false }
    }
}

/*
 * `IPropDefinition.runtimeType` is `string | string[] | null`. The RAW
 * extractor can emit a `null` ENTRY inside that array (`style`'s
 * `["String","Array","Object","Boolean",null]`), filtered out here.
 */
function runtimeTypeLiteral (runtimeType) {
    if (runtimeType === null) return 'null'
    if (Array.isArray(runtimeType)) return JSON.stringify(runtimeType.filter(entry => entry !== null))
    return JSON.stringify(runtimeType)
}

/*
 * The control a prop needs, from what the two sources measured. Returns the
 * `CONTROL_KIND` MEMBER NAME (the generated file references the enum).
 *
 * ⛔ Order is the whole function:
 *   1. a finite literal union (source B) wins — the only case where the
 *      accepted values are KNOWN;
 *   2. otherwise only a runtime type naming exactly ONE constructor is
 *      trusted. `['Boolean', 'Number', 'String']` (4 653 props) is what the
 *      SFC compiler emits when it could NOT narrow — an absence of
 *      information, never a reason to render a checkbox. It falls to TEXT,
 *      where the playground coerces EXPLICITLY (`prop-control.util.ts`).
 */
export function deriveControlKind (runtimeType, options) {
    if (Array.isArray(options) && options.length > 0) return 'SELECT'

    let single = runtimeType
    if (Array.isArray(runtimeType)) {
        const named = runtimeType.filter(entry => entry !== null)
        single = named.length === 1 ? named[0] : null
    }

    switch (single) {
        case 'Boolean':
            return 'SWITCH'
        case 'Number':
            return 'NUMBER'
        case 'Object':
        case 'Array':
            return 'JSON'
        default:
            return 'TEXT'
    }
}

/*
 * `TAnchor | undefined` -> `TAnchor`; `All.TCommandPaletteHotkey` -> its bare
 * name. Anything that is not then a bare identifier is not an alias reference.
 */
export function aliasNameOf (tsType) {
    if (typeof tsType !== 'string') return null

    const bare = tsType.split('|').map(part => part.trim()).filter(part => part !== 'undefined' && part !== 'null')
    if (bare.length !== 1) return null

    const name = bare[0].replace(/^All\./, '')
    return /^[A-Za-z_$][\w$]*$/.test(name) ? name : null
}

/*
 * Source B for one prop: the printed type, the union members (from the
 * printed union, or from the alias pass when the printer kept a name), and
 * which stage established them (`METADATA_SOURCE` member name).
 */
export function describeTypes (typesEntry, aliases) {
    if (!typesEntry) return { tsType: null, options: undefined, description: undefined, source: 'RUNTIME' }

    const description = typesEntry.description ?? undefined

    if (Array.isArray(typesEntry.options) && typesEntry.options.length > 0) {
        return { tsType: typesEntry.tsType ?? null, options: typesEntry.options, description, source: 'TYPES' }
    }

    const alias = aliases[aliasNameOf(typesEntry.tsType) ?? '']
    if (alias?.enumerable && Array.isArray(alias.options) && alias.options.length > 0) {
        return { tsType: typesEntry.tsType ?? null, options: alias.options, description, source: 'ALIAS' }
    }

    return { tsType: typesEntry.tsType ?? null, options: undefined, description, source: 'TYPES' }
}

function propLiteral (name, entry, typesEntry, aliases) {
    const { defaultValue, hasFactoryDefault } = describeDefault(entry)
    const types = describeTypes(typesEntry, aliases)
    const lines = [
        '        {',
        `            name: ${JSON.stringify(name)},`,
        `            label: ${JSON.stringify(name)},`,
        `            tsType: ${JSON.stringify(types.tsType)},`,
        `            runtimeType: ${runtimeTypeLiteral(entry.runtimeType)},`,
        `            required: ${entry.required},`
    ]
    if (defaultValue !== undefined) lines.push(`            defaultValue: ${JSON.stringify(defaultValue)},`)
    lines.push(`            hasFactoryDefault: ${hasFactoryDefault},`)
    if (types.options) lines.push(`            options: ${JSON.stringify(types.options)},`)
    lines.push(`            control: CONTROL_KIND.${deriveControlKind(entry.runtimeType, types.options)},`)
    if (types.description) lines.push(`            description: ${JSON.stringify(types.description)},`)
    lines.push(`            source: METADATA_SOURCE.${types.source}`)
    lines.push('        }')
    return lines.join('\n')
}

function eventLiteral (name, typesEvent) {
    const lines = [
        '        {',
        `            name: ${JSON.stringify(name)},`,
        `            label: ${JSON.stringify(name)},`,
        `            payloadType: ${JSON.stringify(typesEvent?.type ?? null)},`
    ]
    if (typesEvent?.description) lines.push(`            description: ${JSON.stringify(typesEvent.description)},`)
    lines.push(`            source: METADATA_SOURCE.${typesEvent ? 'TYPES' : 'RUNTIME'}`)
    lines.push('        }')
    return lines.join('\n')
}

/*
 * Source B only — the runtime descriptor has no slot list at all (README).
 * `type` is the printed slot-props signature; `null` for a slot without props.
 */
function slotLiteral (slot) {
    const lines = [
        '        {',
        `            name: ${JSON.stringify(slot.name)},`,
        `            label: ${JSON.stringify(slot.name)},`,
        `            slotPropsType: ${JSON.stringify(slot.type ?? null)},`
    ]
    if (slot.description) lines.push(`            description: ${JSON.stringify(slot.description)},`)
    lines.push('            source: METADATA_SOURCE.TYPES')
    lines.push('        }')
    return lines.join('\n')
}

function componentLiteral (definition, category, typesDefinition, aliases) {
    const propNames = Object.keys(definition.props)
    const typesProps = typesDefinition.props ?? {}
    const props = propNames.map(name => propLiteral(name, definition.props[name], typesProps[name], aliases)).join(',\n')
    const typesEvents = new Map((typesDefinition.events ?? []).map(event => [event.name, event]))
    const eventNames = [...new Set([...typesEvents.keys(), ...(definition.emits ?? [])])]
    const events = eventNames.map(name => eventLiteral(name, typesEvents.get(name))).join(',\n')
    const label = definition.name.replace(/^Origam/, '')

    return [
        '    {',
        `        name: ${JSON.stringify(definition.name)},`,
        `        tag: ${JSON.stringify(toKebabTag(definition.name))},`,
        `        family: ${JSON.stringify(definition.family)},`,
        `        label: ${JSON.stringify(label)},`,
        `        category: ${JSON.stringify(category)},`,
        '        props: [\n' + props + '\n        ],',
        '        events: [\n' + events + '\n        ],',
        '        slots: [\n' + (typesDefinition.slots ?? []).map(slotLiteral).join(',\n') + '\n        ],',
        '        snippets: [],',
        '        requiresParent: false',
        '    }'
    ].join('\n')
}

/* The tree the metadata was extracted from — named, never "develop" by assumption. */
function headSha () {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: HERE, encoding: 'utf8' }).trim()
}

function toKebabTag (name) {
    return name
        .replace(/^Origam/, 'origam')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
}

function main () {
    const raw = JSON.parse(readFileSync(RUNTIME_JSON, 'utf8'))
    const unions = JSON.parse(readFileSync(UNIONS_JSON, 'utf8'))
    const { aliases } = JSON.parse(readFileSync(ALIASES_JSON, 'utf8'))
    const byName = new Map(raw.components.map(c => [c.name, c]))
    const typesByName = new Map(unions.components.map(c => [c.name, c]))

    const entries = PICK.map(({ name, category }) => {
        const definition = byName.get(name)
        if (!definition) throw new Error(`generate-host-seed: ${name} absent de ${RUNTIME_JSON} — relancer meta:runtime`)
        const typesDefinition = typesByName.get(name)
        if (!typesDefinition) throw new Error(`generate-host-seed: ${name} absent de ${UNIONS_JSON} — relancer meta:unions`)
        return componentLiteral(definition, category, typesDefinition, aliases)
    })
    const counts = PICK.map(({ name }) => `${name} ${Object.keys(byName.get(name).props).length}`).join(', ')

    const header = `/*
 * GENERATED — pnpm -F @origam/playground meta:host-seed
 *
 * Demo catalogue for the standalone host (src/host/main.ts), built from
 * REAL metadata captured from \`origam\` @ ${headSha()}.
 * Source A (runtime descriptor: names, defaults) merged with source B
 * (literal unions + resolved aliases: options, tsType, emit payloads, slots).
 * No snippets and \`requiresParent: false\` everywhere: neither is measurable
 * by the chain — both are AUTHORED, in \`consts/Commons/snippets.const.ts\`.
 * Prop counts: ${counts}.
 *
 * Do not hand-edit — re-run the generator after \`meta:runtime\`,
 * \`meta:unions\` and \`meta:aliases\`.
 */
import { CONTROL_KIND } from '../enums/Commons/control-kind.enum'
import { METADATA_SOURCE } from '../enums/Commons/metadata-source.enum'
import type { IComponentDefinition } from '../interfaces/Catalog/component-definition.interface'

export const HOST_CATALOG_SEED: IComponentDefinition[] = [
${entries.join(',\n')}
]
`

    writeFileSync(OUT_FILE, header)
    console.log(`written: ${path.relative(process.cwd(), OUT_FILE)}`)
    console.log(counts)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
