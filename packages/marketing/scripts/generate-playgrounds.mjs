#!/usr/bin/env node
/**
 * generate-playgrounds.mjs — generate playground controls for component doc entries
 * that do not yet have a playground in kind_extra.playground.
 *
 * For each component without a playground:
 *  1. Reads doc_prop rows (name, type_label, type_slug, type_kind, optional, required)
 *  2. Reads doc_slot rows to detect a "default" slot for defaultSlotContent
 *  3. Infers playground controls via type heuristics + DB-driven doc_value options
 *  4. UPSERTs kind_extra.playground (never overwrites existing curated playgrounds)
 *
 * After all updates the script:
 *  5. Re-dumps server/db/seed/component.json via dump-db-fixture.mjs
 *  6. Regenerates server/assets/db-seed.sql via pg_dump (filtered)
 *
 * Idempotent: re-running when all playgrounds exist produces 0 changes.
 *
 * USAGE
 *   pnpm -F @origam/marketing docs:playgrounds
 *   tsx --tsconfig ./tsconfig.typeorm.json scripts/generate-playgrounds.mjs
 *   tsx --tsconfig ./tsconfig.typeorm.json scripts/generate-playgrounds.mjs --dry-run
 *   tsx --tsconfig ./tsconfig.typeorm.json scripts/generate-playgrounds.mjs --verbose
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

import { REPO_ROOT } from './lib/extract.mjs'
import { getDb, closeDb } from './lib/db.ts'
import { regenerateDbSeedSql } from './lib/dump-sql.mjs'

// ─── CLI flags ────────────────────────────────────────────────────────────────

const ARGS        = process.argv.slice(2)
const DRY_RUN     = ARGS.includes('--dry-run')
const VERBOSE     = ARGS.includes('--verbose')

const MARKETING_DIR = path.join(REPO_ROOT, 'packages', 'marketing')
const DB_SEED_SQL   = path.join(MARKETING_DIR, 'server', 'assets', 'db-seed.sql')

// ─── Props never turned into playground controls ──────────────────────────────

const EXCLUDED_PROPS = new Set([
    'tag', 'to', 'href', 'target', 'rel', 'style', 'class', 'id',
    'ripple', 'eager', 'transition', 'reverseTransition',
    'ariaLabel', 'role', 'tabIndex', 'value',
])

// ─── Type slugs too complex for a generic control ─────────────────────────────

const SKIP_TYPE_SLUGS = new Set([
    'loading-value', 'route-location-raw', 'theme',
    'css-value', 'css-class',
])

// ─── Curated options for type slugs not derivable from doc_value ──────────────
// (TColor is too broad; TIcon has no discrete members — both need curation)

const CURATED_TYPE_OPTIONS = Object.freeze({
    color: {
        kind: 'select',
        options: [
            { label: '(none)', value: '' },
            { label: 'primary',   value: 'primary' },
            { label: 'secondary', value: 'secondary' },
            { label: 'success',   value: 'success' },
            { label: 'danger',    value: 'danger' },
            { label: 'warning',   value: 'warning' },
            { label: 'info',      value: 'info' },
        ],
        defaultValue: '',
    },
    icon: {
        kind: 'select',
        options: [
            { label: '(none)',        value: '' },
            { label: 'mdi-star',      value: 'mdi-star' },
            { label: 'mdi-account',   value: 'mdi-account' },
            { label: 'mdi-check',     value: 'mdi-check' },
            { label: 'mdi-home',      value: 'mdi-home' },
            { label: 'mdi-close',     value: 'mdi-close' },
        ],
        defaultValue: '',
    },
})

// ─── Control generation priority (lower = appears first; max 8 controls) ──────

const PROP_PRIORITY = Object.freeze({
    variant:      1,
    color:        2,
    bgColor:      3,
    size:         4,
    density:      5,
    status:       6,
    align:        7,
    justify:      8,
    position:     9,
    rounded:     10,
    elevation:   11,
    prependIcon: 12,
    appendIcon:  13,
    // boolean switches
    disabled:    20,
    loading:     21,
    readonly:    22,
    closable:    23,
    modelValue:  24,
    active:      25,
    block:       26,
    flat:        27,
    slim:        28,
    stacked:     29,
    // text inputs (lowest priority — added only if slots remain)
    title:       40,
    text:        41,
    label:       42,
    placeholder: 43,
    subtitle:    44,
})

// ─── Human-readable fallback labels ──────────────────────────────────────────

const PROP_LABELS = Object.freeze({
    variant:     'Variant',
    color:       'Color / Intent',
    bgColor:     'Background color',
    size:        'Size',
    density:     'Density',
    status:      'Status',
    rounded:     'Rounded',
    elevation:   'Elevation',
    prependIcon: 'Prepend icon',
    appendIcon:  'Append icon',
    disabled:    'Disabled',
    loading:     'Loading',
    readonly:    'Read-only',
    closable:    'Closable',
    modelValue:  'Value',
    active:      'Active',
    block:       'Block',
    flat:        'Flat',
    slim:        'Slim',
    stacked:     'Stacked',
    align:       'Align',
    justify:     'Justify',
    position:    'Position',
    title:       'Title',
    text:        'Text',
    label:       'Label',
    placeholder: 'Placeholder',
    subtitle:    'Subtitle',
})

// Simple string props worth exposing as a text control (low priority)
const TEXT_PROPS = new Set(['title', 'text', 'label', 'placeholder', 'subtitle'])

// ─── Helper utilities ─────────────────────────────────────────────────────────

/** camelCase → snake_case for i18n key segments. */
function toSnakeCase (str) {
    return str.replace(/([A-Z])/g, c => '_' + c.toLowerCase())
}

/** hyphen-slug → snake_case for i18n key segments. */
function slugToI18nSegment (slug) {
    return slug.replace(/-/g, '_')
}

/** Build the i18n labelKey for a playground control. */
function buildLabelKey (slug, prop) {
    return `components.${slugToI18nSegment(slug)}.playground.${toSnakeCase(prop)}`
}

/** Human-readable fallback label for a prop. */
function labelFallback (prop) {
    return PROP_LABELS[prop] ?? prop.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
}

/** True when the type_label is too complex to map to a single control. */
function isComplexType (typeLabel) {
    return typeLabel.includes('[]') ||
        typeLabel.includes('{')     ||
        typeLabel.includes('=>')    ||
        typeLabel.includes('Event') ||
        typeLabel === 'unknown'     ||
        typeLabel === 'never'       ||
        typeLabel === 'void'        ||
        /^I[A-Z]/.test(typeLabel)   ||
        typeLabel === 'StyleValue'  ||
        /^VNode/.test(typeLabel)    ||
        /^Component/.test(typeLabel)||
        typeLabel === 'RouteLocationRaw'
}

/**
 * Parse a pure string-literal union such as `'a' | 'b' | 'c'`.
 * Returns the string values or null when the label doesn't match.
 */
function parseUnionLiterals (typeLabel) {
    const t = typeLabel.trim()
    if (!/^['"][^'"]+['"](\s*\|\s*['"][^'"]+['"])*$/.test(t)) return null
    const m = t.match(/['"]([^'"]+)['"]/g)
    return m ? m.map(s => s.slice(1, -1)) : null
}

/**
 * Generic slot content for generated playgrounds.
 * Components that already have a curated playground are never processed here.
 */
function inferDefaultSlotContent (slug) {
    if (slug.includes('btn') || slug.includes('button')) return 'Click me'
    if (slug === 'title' || slug.endsWith('-title'))      return 'My title'
    if (slug.includes('chip'))                            return 'Chip'
    if (slug.includes('badge'))                           return '1'
    if (slug.includes('alert'))                           return 'Alert message'
    if (slug.includes('tooltip'))                         return 'Tooltip text'
    if (slug.includes('label'))                           return 'Label'
    if (slug.includes('tab') && !slug.includes('panel'))  return 'Tab'
    return 'Content'
}

// ─── Type options map ─────────────────────────────────────────────────────────

/**
 * Queries doc_entry + doc_value for every type/enum and builds
 * a slug → string[] map used to generate select options.
 * Only clean, short string values (≤ 30 chars, no brackets) are included.
 */
async function buildTypeOptionsMap (db) {
    const rows = await db.query(
        `SELECT de.slug, dv.value
         FROM   doc_entry de
         JOIN   doc_value dv ON dv.entry_id = de.id AND dv.orphaned_at IS NULL
         WHERE  de.kind IN ('type', 'enum') AND de.orphaned_at IS NULL
         ORDER  BY de.slug, dv.position`,
    )

    const map = new Map()
    for (const row of rows) {
        if (!map.has(row.slug)) map.set(row.slug, [])
        const val = row.value
        if (val && val.length <= 30 && !/[{}()\[\]]/.test(val)) {
            map.get(row.slug).push(val)
        }
    }
    return map
}

// ─── type_kind / type_slug recovery ──────────────────────────────────────────

/**
 * `TDensity` → `density`, `TChartLegendPosition` → `chart-legend-position`.
 * Mirrors how the ingestion slugifies a named type (verified against every
 * `doc_entry` row of kind `type`): strip the leading `T`, kebab-case the rest.
 */
function typeSlugFromLabel (typeLabel) {
    const m = typeLabel.trim().match(/^T([A-Z][A-Za-z0-9]*)$/)
    if (!m) return null
    return m[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Fill in `type_kind` / `type_slug` when the ingestion left them NULL.
 *
 * ⛔ MEASURED (#728): the 35 most recently ingested components carry
 * `type_kind = NULL` and `type_slug = NULL` on EVERY prop row. `inferControl`
 * branches exclusively on those two columns, so every prop fell through to
 * `return null` and the generator emitted ZERO playground for all 35 — it
 * reported "no playable props" for components that have dozens.
 *
 * `type_label` always survives, and it carries the same information, so we
 * recover the two columns from it rather than skipping the component. Rows that
 * already have `type_kind` are returned untouched — the behaviour for the 188
 * pre-existing playgrounds is unchanged.
 */
function withRecoveredTypeMeta (prop) {
    if (prop.type_kind) return prop
    const label = (prop.type_label ?? '').trim()
    if (!label) return prop

    const namedSlug = typeSlugFromLabel(label)
    if (namedSlug) return { ...prop, type_kind: 'type', type_slug: namedSlug }

    if (label === 'boolean' || label === 'string' || label === 'number') {
        return { ...prop, type_kind: 'primitive' }
    }
    if (parseUnionLiterals(label)) {
        return { ...prop, type_kind: 'primitive' }
    }
    return prop
}

// ─── Single-prop control inference ───────────────────────────────────────────

/**
 * Returns { kind, options?, defaultValue } or null when the prop is not playable.
 * prop, labelKey, labelFallback are added by the caller.
 */
function inferControl (rawProp, typeOptionsMap) {
    const prop = withRecoveredTypeMeta(rawProp)
    const { name, type_label, type_slug, type_kind, optional, required } = prop
    // The extractor serialises missing defaults as the string 'undefined' — normalise to null.
    const default_value = (prop.default_value == null || prop.default_value === 'undefined')
        ? null
        : prop.default_value

    if (EXCLUDED_PROPS.has(name)) return null
    if (!type_label || isComplexType(type_label)) return null

    // ── 1. Named type with a type_slug ─────────────────────────────────────
    if (type_kind === 'type' && type_slug) {
        if (SKIP_TYPE_SLUGS.has(type_slug)) return null

        if (CURATED_TYPE_OPTIONS[type_slug]) {
            const c = CURATED_TYPE_OPTIONS[type_slug]
            return { kind: c.kind, options: c.options, defaultValue: c.defaultValue }
        }

        const values = typeOptionsMap.get(type_slug)
        if (values && values.length > 0 && values.length <= 20) {
            const isOpt = !required || optional
            const options = [
                ...(isOpt ? [{ label: '(default)', value: '' }] : []),
                ...values.map(v => ({ label: v, value: v })),
            ]
            return { kind: 'select', options, defaultValue: isOpt ? '' : values[0] }
        }

        return null
    }

    // ── 2. Pure boolean primitive ───────────────────────────────────────────
    if (type_kind === 'primitive' && type_label === 'boolean') {
        return { kind: 'switch', defaultValue: default_value === 'true' }
    }

    // ── 3. String literal union: 'a' | 'b' | 'c' ──────────────────────────
    if (type_kind === 'primitive') {
        const literals = parseUnionLiterals(type_label)
        if (literals && literals.length >= 2 && literals.length <= 12) {
            const isOpt = !required || optional
            const options = [
                ...(isOpt ? [{ label: '(default)', value: '' }] : []),
                ...literals.map(v => ({ label: v, value: v })),
            ]
            return { kind: 'select', options, defaultValue: isOpt ? '' : literals[0] }
        }
    }

    // ── 4. Plain string — only for known demo-worthy prop names ────────────
    if (type_kind === 'primitive' && type_label === 'string' && TEXT_PROPS.has(name)) {
        return { kind: 'text', defaultValue: default_value ?? '' }
    }

    return null
}

// ─── Playground builder ───────────────────────────────────────────────────────

/**
 * Returns an IComponentPlayground object or null when no playable props exist.
 * Maximum 8 controls, ordered by PROP_PRIORITY.
 */
function generatePlayground (entry, props, slots, typeOptionsMap) {
    const rawControls = props
        .map(p => {
            const ctrl = inferControl(p, typeOptionsMap)
            if (!ctrl) return null
            return {
                prop:          p.name,
                kind:          ctrl.kind,
                labelKey:      buildLabelKey(entry.slug, p.name),
                labelFallback: labelFallback(p.name),
                ...(ctrl.options ? { options: ctrl.options } : {}),
                defaultValue:  ctrl.defaultValue,
                _priority:     PROP_PRIORITY[p.name] ?? 50,
            }
        })
        .filter(Boolean)
        .sort((a, b) => a._priority - b._priority)
        .slice(0, 8)

    if (rawControls.length === 0) return null

    const controls = rawControls.map(({ _priority, ...c }) => c)

    const playground = { controls }

    if (slots.some(s => s.slot === 'default')) {
        playground.defaultSlotContent = inferDefaultSlotContent(entry.slug)
    }

    return playground
}


// ─── Main ─────────────────────────────────────────────────────────────────────

async function run () {
    console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Generating component playgrounds ...\n`)

    const db = await getDb()

    // 1. Build type/enum options map
    const typeOptionsMap = await buildTypeOptionsMap(db)
    if (VERBOSE) console.log(`   Type/enum option map: ${typeOptionsMap.size} entries\n`)

    // 2. Query component entries that currently lack a playground
    const entries = await db.query(
        `SELECT id, slug, name
         FROM   doc_entry
         WHERE  kind = 'component'
           AND  orphaned_at IS NULL
           AND  (kind_extra IS NULL OR NOT (kind_extra ? 'playground'))
         ORDER  BY slug`,
    )

    if (entries.length === 0) {
        console.log('All components already have a playground — nothing to generate.')
        await closeDb()
        return
    }

    console.log(`Found ${entries.length} components without a playground.\n`)

    const entryIds = entries.map(e => e.id)

    // 3. Bulk-fetch props + slots for all matching entries
    const [allProps, allSlots] = await Promise.all([
        db.query(
            `SELECT entry_id, name, type_label, type_slug, type_kind,
                    optional, required, default_value, position
             FROM   doc_prop
             WHERE  entry_id = ANY($1::uuid[]) AND orphaned_at IS NULL
             ORDER  BY entry_id, position`,
            [entryIds],
        ),
        db.query(
            `SELECT entry_id, slot, position
             FROM   doc_slot
             WHERE  entry_id = ANY($1::uuid[]) AND orphaned_at IS NULL
             ORDER  BY entry_id, position`,
            [entryIds],
        ),
    ])

    const propsByEntry = new Map()
    for (const p of allProps) {
        if (!propsByEntry.has(p.entry_id)) propsByEntry.set(p.entry_id, [])
        propsByEntry.get(p.entry_id).push(p)
    }
    const slotsByEntry = new Map()
    for (const s of allSlots) {
        if (!slotsByEntry.has(s.entry_id)) slotsByEntry.set(s.entry_id, [])
        slotsByEntry.get(s.entry_id).push(s)
    }

    // 4. Generate playground per entry, UPSERT to DB
    let generatedCount = 0
    let skippedCount   = 0

    for (const entry of entries) {
        const props = propsByEntry.get(entry.id) || []
        const slots = slotsByEntry.get(entry.id) || []

        const playground = generatePlayground(entry, props, slots, typeOptionsMap)

        if (!playground) {
            if (VERBOSE) console.log(`  [skip] ${entry.slug} — no playable props`)
            skippedCount++
            continue
        }

        if (VERBOSE || DRY_RUN) {
            console.log(
                `  [gen ] ${entry.slug.padEnd(36)} ${playground.controls.length} controls: ` +
                playground.controls.map(c => c.prop).join(', '),
            )
        }

        if (!DRY_RUN) {
            await db.query(
                `UPDATE doc_entry
                 SET    kind_extra  = COALESCE(kind_extra, '{}'::jsonb) ||
                                      jsonb_build_object('playground', $1::jsonb),
                        updated_at  = NOW()
                 WHERE  id = $2
                   AND  (kind_extra IS NULL OR NOT (kind_extra ? 'playground'))`,
                [JSON.stringify(playground), entry.id],
            )
        }

        generatedCount++
    }

    console.log('\n── Playground generation ───────────────────────────────────')
    console.log(`   Generated : ${generatedCount}`)
    console.log(`   Skipped   : ${skippedCount} (no playable props)`)
    console.log(`   Total     : ${entries.length}`)

    await closeDb()

    if (DRY_RUN) {
        console.log('\n[DRY RUN] No DB changes written.')
        return
    }

    if (generatedCount === 0) {
        console.log('\nNo new playgrounds — skipping fixture and SQL regeneration.')
        return
    }

    // 5. Regenerate server/db/seed/component.json
    console.log('\n→ Regenerating server/db/seed/component.json ...')
    execSync(
        'tsx --tsconfig ./tsconfig.typeorm.json scripts/dump-db-fixture.mjs --domain=component',
        { cwd: MARKETING_DIR, stdio: 'inherit', env: process.env },
    )

    // 6. Regenerate server/assets/db-seed.sql
    try {
        regenerateDbSeedSql()
    } catch (err) {
        console.warn(`\n[warn] db-seed.sql regeneration failed: ${err.message}`)
        console.warn('       Regenerate manually:')
        console.warn("       pg_dump --data-only --column-inserts --no-owner --no-acl \\")
        console.warn("         --exclude-table='*migrations*' $DATABASE_URL \\")
        console.warn("         > server/assets/db-seed.sql")
    }

    console.log('\nDone.')
}

run().catch(async (err) => {
    console.error(err)
    await closeDb().catch(() => {})
    process.exit(2)
})
