/*
 * Generates the standalone host's demo catalogue from REAL runtime
 * metadata — never hand-typed prop lists.
 *
 * ⛔ Unlike `meta:runtime` / `meta:unions`, this script's OUTPUT IS COMMITTED
 * (`src/host/catalogSeed.const.ts`), not written to the gitignored
 * `.metadata/` directory. It is authoring-time tooling for lot 2's demo
 * host, not part of the build pipeline any guard walks — the standalone app
 * needs a non-empty IComponentDefinition[] to open without first running
 * the full metadata chain (`meta:runtime` requires a Vite SSR pipeline,
 * ~20s; the host must be openable from a cold checkout).
 *
 * Source A only (runtime descriptor): prop NAMES, `runtimeType`, `required`,
 * `defaultValue` / `hasFactoryDefault`, emit NAMES. No literal union members
 * (`meta:unions` was not run for this seed) — `tsType` stays `null` and
 * `options` stays absent for every prop, honestly: this lot's inspector is
 * read-only and does not need them to render a type + a value.
 *
 * Usage: pnpm -F @origam/playground meta:host-seed
 * Prerequisite: pnpm -F @origam/playground meta:runtime (produces the input)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const RUNTIME_JSON = path.join(HERE, '../.metadata/runtime.json')
const OUT_FILE = path.join(HERE, '../src/host/catalogSeed.const.ts')

/*
 * Six components, hand-picked for variety: a props-heavy leaf (Btn, 106), the
 * worst-case prop count in the catalogue measured in the lot's own PR
 * (Select, 161), and four more spanning different categories so the
 * catalogue drawer's category filter has something to filter.
 */
const PICK = [
    { name: 'OrigamBtn', category: 'Form & Input' },
    { name: 'OrigamSelect', category: 'Form & Input' },
    { name: 'OrigamSwitch', category: 'Form & Input' },
    { name: 'OrigamAlert', category: 'Feedback & Status' },
    { name: 'OrigamCard', category: 'Layout & Structure' },
    { name: 'OrigamChip', category: 'Data Display' }
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
 * `IPropDefinition.runtimeType` is `string | string[] | null` — a plain
 * array of constructor names. The RAW extractor can emit a `null` ENTRY
 * inside that array (`describeRuntimeType` returns `null` for an absent
 * constructor in a multi-type Vue prop declaration, e.g. `style`'s
 * `["String","Array","Object","Boolean",null]`), which is not valid against
 * that type. Filtered out here rather than widening lot 1's interface for
 * this seed alone — a `null` entry carries no information a `string[]`
 * display needs.
 */
function runtimeTypeLiteral (runtimeType) {
    if (runtimeType === null) return 'null'
    if (Array.isArray(runtimeType)) return JSON.stringify(runtimeType.filter(entry => entry !== null))
    return JSON.stringify(runtimeType)
}

function propLiteral (name, entry) {
    const { defaultValue, hasFactoryDefault } = describeDefault(entry)
    const lines = [
        '        {',
        `            name: ${JSON.stringify(name)},`,
        `            label: ${JSON.stringify(name)},`,
        '            tsType: null,',
        `            runtimeType: ${runtimeTypeLiteral(entry.runtimeType)},`,
        `            required: ${entry.required},`
    ]
    if (defaultValue !== undefined) lines.push(`            defaultValue: ${JSON.stringify(defaultValue)},`)
    lines.push(`            hasFactoryDefault: ${hasFactoryDefault},`)
    lines.push('            control: CONTROL_KIND.TEXT,')
    lines.push('            source: METADATA_SOURCE.RUNTIME')
    lines.push('        }')
    return lines.join('\n')
}

function eventLiteral (name) {
    return [
        '        {',
        `            name: ${JSON.stringify(name)},`,
        `            label: ${JSON.stringify(name)},`,
        '            payloadType: null,',
        '            source: METADATA_SOURCE.RUNTIME',
        '        }'
    ].join('\n')
}

function componentLiteral (definition, category) {
    const propNames = Object.keys(definition.props)
    const props = propNames.map(name => propLiteral(name, definition.props[name])).join(',\n')
    const events = (definition.emits ?? []).map(eventLiteral).join(',\n')
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
        '        slots: [],',
        '        snippets: [],',
        '        requiresParent: false',
        '    }'
    ].join('\n')
}

function toKebabTag (name) {
    return name
        .replace(/^Origam/, 'origam')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
}

function main () {
    const raw = JSON.parse(readFileSync(RUNTIME_JSON, 'utf8'))
    const byName = new Map(raw.components.map(c => [c.name, c]))

    const entries = PICK.map(({ name, category }) => {
        const definition = byName.get(name)
        if (!definition) throw new Error(`generate-host-seed: ${name} absent de ${RUNTIME_JSON} — relancer meta:runtime`)
        return componentLiteral(definition, category)
    })

    const header = `/*
 * GENERATED — pnpm -F @origam/playground meta:host-seed
 *
 * Demo catalogue for the standalone host (src/host/main.ts), built from
 * REAL runtime metadata captured from \`origam\` @ develop ${raw.source?.sha ?? ''}.
 * Source A only (the runtime props descriptor) — no literal union members,
 * no slots (the runtime descriptor cannot see them), no snippets. Prop
 * counts are real: OrigamBtn 106, OrigamSelect 161 (the catalogue's largest
 * prop surface), OrigamSwitch 114, OrigamCard 97, OrigamChip 92, OrigamAlert 93.
 *
 * Do not hand-edit — re-run the generator after \`meta:runtime\`.
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
    console.log(PICK.map(({ name }) => `${name}:${Object.keys(byName.get(name).props).length}`).join(' '))
}

main()
