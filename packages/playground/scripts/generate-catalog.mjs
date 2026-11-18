/*
 * Generates the FULL component catalogue (one `IComponentDefinition` per DS
 * component, 219 measured on develop @ 7c3f0b1fb) from REAL metadata, for a
 * host that needs every component rather than the standalone demo's 14
 * (`src/host/catalogSeed.const.ts`).
 *
 * Output: `src/assets/catalog/{OrigamName}.json`, one file per component.
 *
 * ⛔ ONE FILE PER COMPONENT, and committed — lot E (#1145).
 *   - Per component, because a host shows one or a handful at a time: the
 *     whole catalogue is 2.78 MB of JSON (176 KB gzip, median 16 KB per
 *     component), and `utils/Commons/catalog.util.ts` loads a definition
 *     only when asked, as its own chunk.
 *   - Committed, because every host build (the marketing Docker image, the
 *     `build-marketing` and `test-e2e-marketing` CI jobs, `nuxt dev`) would
 *     otherwise have to run the whole metadata chain first, and forgetting it
 *     yields an EMPTY playground that reads exactly like a product defect.
 *     Drift is caught by `meta:catalog:check`, run in the `playground` CI job.
 *
 * ⛔ The files carry no SHA and no timestamp: they must be byte-identical
 * when the DS has not changed, or `--check` would fail on every commit.
 *
 * Same two sources, same derivations for every component — the
 * helpers live in `lib/definition.mjs`, never re-implemented: source A for names,
 * `required`, defaults; source B for `tsType`, options, emit payloads, slots.
 *
 * `snippets: []` and `requiresParent: false` everywhere: neither is
 * measurable (#1048 § 3.4); a host merges both with `attachSnippets`.
 * `category` is absent: it is an editorial judgement a host supplies.
 *
 * Usage:
 *   pnpm -F @origam/playground meta:catalog          # write
 *   pnpm -F @origam/playground meta:catalog:check    # exit 1 on drift
 * Prerequisite: meta:runtime, meta:unions, meta:aliases.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describeDefault, deriveControlKind, describeTypes, toKebabTag } from './lib/definition.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const RUNTIME_JSON = path.join(HERE, '../.metadata/runtime.json')
const UNIONS_JSON = path.join(HERE, '../.metadata/unions.json')
const ALIASES_JSON = path.join(HERE, '../.metadata/aliases.json')
const OUT_DIR = path.join(HERE, '../src/assets/catalog')
/*
 * The index (name / tag / family / label of every component) lives BESIDE the
 * catalogue directory, not in it: `catalog.util.ts` globs `catalog/*.json` as
 * one chunk per component, and the index must be the one file a host reads
 * synchronously to know a family's members without loading any definition.
 */
const INDEX_FILE = path.join(HERE, '../src/assets/catalog-index.json')

/* `CONTROL_KIND` / `METADATA_SOURCE` member name -> the enum's string value. */
const CONTROL_VALUE = { SELECT: 'select', SWITCH: 'switch', TEXT: 'text', NUMBER: 'number', JSON: 'json' }
const SOURCE_VALUE = { RUNTIME: 'runtime', TYPES: 'types', ALIAS: 'alias', AUTHORED: 'authored' }

function runtimeTypeOf (runtimeType) {
    if (Array.isArray(runtimeType)) return runtimeType.filter(entry => entry !== null)
    return runtimeType ?? null
}

function buildProp (name, entry, typesEntry, aliases) {
    const { defaultValue, hasFactoryDefault } = describeDefault(entry)
    const types = describeTypes(typesEntry, aliases)
    const prop = {
        name,
        label: name,
        tsType: types.tsType,
        runtimeType: runtimeTypeOf(entry.runtimeType),
        required: entry.required
    }
    if (defaultValue !== undefined) prop.defaultValue = defaultValue
    prop.hasFactoryDefault = hasFactoryDefault
    if (types.options) prop.options = types.options
    prop.control = CONTROL_VALUE[deriveControlKind(entry.runtimeType, types.options)]
    if (types.description) prop.description = types.description
    prop.source = SOURCE_VALUE[types.source]
    return prop
}

function buildEvent (name, typesEvent) {
    const event = { name, label: name, payloadType: typesEvent?.type ?? null }
    if (typesEvent?.description) event.description = typesEvent.description
    event.source = typesEvent ? SOURCE_VALUE.TYPES : SOURCE_VALUE.RUNTIME
    return event
}

function buildSlot (slot) {
    const out = { name: slot.name, label: slot.name, slotPropsType: slot.type ?? null }
    if (slot.description) out.description = slot.description
    out.source = SOURCE_VALUE.TYPES
    return out
}

export function buildDefinition (definition, typesDefinition, aliases) {
    const typesProps = typesDefinition.props ?? {}
    const typesEvents = new Map((typesDefinition.events ?? []).map(event => [event.name, event]))
    const eventNames = [...new Set([...typesEvents.keys(), ...(definition.emits ?? [])])]

    return {
        name: definition.name,
        tag: toKebabTag(definition.name),
        family: definition.family,
        label: definition.name.replace(/^Origam/, ''),
        props: Object.keys(definition.props).map(name => buildProp(name, definition.props[name], typesProps[name], aliases)),
        events: eventNames.map(name => buildEvent(name, typesEvents.get(name))),
        slots: (typesDefinition.slots ?? []).map(buildSlot),
        snippets: [],
        requiresParent: false
    }
}

function render () {
    const raw = JSON.parse(readFileSync(RUNTIME_JSON, 'utf8'))
    const unions = JSON.parse(readFileSync(UNIONS_JSON, 'utf8'))
    const { aliases } = JSON.parse(readFileSync(ALIASES_JSON, 'utf8'))
    const typesByName = new Map(unions.components.map(c => [c.name, c]))
    const files = new Map()
    const index = []

    for (const definition of raw.components) {
        const typesDefinition = typesByName.get(definition.name)
        if (!typesDefinition) throw new Error(`generate-catalog: ${definition.name} absent de ${UNIONS_JSON} — relancer meta:unions`)
        const built = buildDefinition(definition, typesDefinition, aliases)
        files.set(`${definition.name}.json`, JSON.stringify(built, null, 2) + '\n')
        index.push({ name: built.name, tag: built.tag, family: built.family, label: built.label })
    }

    index.sort((a, b) => a.name.localeCompare(b.name))

    return { files, index: JSON.stringify(index, null, 2) + '\n' }
}

function main () {
    const check = process.argv.includes('--check')
    const { files, index } = render()
    const existing = existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter(file => file.endsWith('.json')) : []

    if (check) {
        const drift = []
        for (const [file, content] of files) {
            const target = path.join(OUT_DIR, file)
            if (!existsSync(target)) drift.push(`missing  ${file}`)
            else if (readFileSync(target, 'utf8') !== content) drift.push(`changed  ${file}`)
        }
        for (const file of existing) if (!files.has(file)) drift.push(`orphan   ${file}`)
        if (!existsSync(INDEX_FILE) || readFileSync(INDEX_FILE, 'utf8') !== index) drift.push(`changed  ${path.basename(INDEX_FILE)}`)

        if (drift.length) {
            console.error(`catalog drift (${drift.length}) — run \`pnpm -F @origam/playground meta:catalog\`:\n  ${drift.join('\n  ')}`)
            process.exit(1)
        }
        console.log(`catalog up to date: ${files.size} components`)
        return
    }

    mkdirSync(OUT_DIR, { recursive: true })
    for (const file of existing) if (!files.has(file)) rmSync(path.join(OUT_DIR, file))
    for (const [file, content] of files) writeFileSync(path.join(OUT_DIR, file), content)
    writeFileSync(INDEX_FILE, index)
    console.log(`written: ${files.size} components -> ${path.relative(process.cwd(), OUT_DIR)}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
