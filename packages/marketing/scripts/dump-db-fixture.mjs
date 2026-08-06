#!/usr/bin/env node
/**
 * dump-db-fixture.mjs — snapshot the full API-Reference doc store to versioned
 * JSON fixtures under server/db/seed/{kind}.json.
 *
 * Run ONCE before removing the 1758 .const.ts source files (ticket F). The
 * resulting fixture files become the new canonical seed source: `docs:seed`
 * reads them automatically when the legacy src/consts/ directories are absent.
 *
 * Only non-orphaned rows are exported. The editorial lock flag (edited_by_user)
 * is preserved on entry records so that `docs:seed --fixture` can re-apply it.
 *
 * USAGE
 *   pnpm -F @origam/marketing docs:dump
 *   tsx --tsconfig ./tsconfig.typeorm.json scripts/dump-db-fixture.mjs
 *   tsx --tsconfig ./tsconfig.typeorm.json scripts/dump-db-fixture.mjs --domain=component
 *
 * OUTPUT
 *   packages/marketing/server/db/seed/component.json
 *   packages/marketing/server/db/seed/composable.json
 *   packages/marketing/server/db/seed/const.json
 *   packages/marketing/server/db/seed/directive.json
 *   packages/marketing/server/db/seed/enum.json
 *   packages/marketing/server/db/seed/interface.json
 *   packages/marketing/server/db/seed/type.json
 *   packages/marketing/server/db/seed/util.json
 */

import fs from 'node:fs'
import path from 'node:path'

import { DOC_KINDS } from '../server/db/db.const.mjs'
import { REPO_ROOT } from './lib/extract.mjs'
import { getDb, closeDb, sourceCommit } from './lib/db.ts'

const ARGS = process.argv.slice(2)
const DOMAIN_ARG = (ARGS.find(a => a.startsWith('--domain=')) || '').split('=')[1]
const SEED_DIR = path.join(REPO_ROOT, 'packages', 'marketing', 'server', 'db', 'seed')

// ─── Helpers to project a DB row to the fixture shape ────────────────────────

function entryShape (e) {
    return {
        kind: e.kind,
        slug: e.slug,
        name: e.name,
        category: e.category,
        domain: e.domain,
        icon: e.icon,
        description_key: e.description_key,
        description_fallback: e.description_fallback,
        definition: e.definition,
        signature: e.signature,
        tag: e.tag,
        value: e.value,
        source_file: e.source_file,
        package_note: e.package_note,
        note_key: e.note_key,
        note_fallback: e.note_fallback,
        story_url: e.story_url,
        doc_url: e.doc_url,
        parent_slug: e.parent_slug,
        kind_extra: e.kind_extra,
        svg_title_key: e.svg_title_key,
        svg_title_fallback: e.svg_title_fallback,
        svg_desc_key: e.svg_desc_key,
        svg_desc_fallback: e.svg_desc_fallback,
        edited_by_user: e.edited_by_user === true || e.edited_by_user === 't',
    }
}

const propShape = (p) => ({
    name: p.name, type_label: p.type_label, type_slug: p.type_slug, type_kind: p.type_kind,
    optional: p.optional === true || p.optional === 't', required: p.required === true || p.required === 't',
    position: Number(p.position), default_value: p.default_value,
    description_key: p.description_key, description_fallback: p.description_fallback,
})

const valueShape = (v) => ({
    value: v.value, position: Number(v.position),
    description_key: v.description_key, description_fallback: v.description_fallback,
})

const paramShape = (p) => ({
    name: p.name, type: p.type, required: p.required === true || p.required === 't',
    default_value: p.default_value, position: Number(p.position),
    description_key: p.description_key, description_fallback: p.description_fallback,
})

const returnShape = (r) => ({
    name: r.name, type: r.type, position: Number(r.position),
    description_key: r.description_key, description_fallback: r.description_fallback,
})

const emitShape = (e) => ({
    event: e.event, payload_label: e.payload_label, payload_slug: e.payload_slug,
    payload_kind: e.payload_kind, position: Number(e.position),
    description_key: e.description_key, description_fallback: e.description_fallback,
})

const slotShape = (s) => ({
    slot: s.slot, slot_props: s.slot_props, position: Number(s.position),
    description_key: s.description_key, description_fallback: s.description_fallback,
})

const exampleShape = (e) => ({
    position: Number(e.position), title_key: e.title_key, title_fallback: e.title_fallback,
    code: e.code, lang: e.lang,
})

const dArgShape = (a) => ({
    name: a.name, type: a.type, required: a.required === true || a.required === 't',
    position: Number(a.position),
    description_key: a.description_key, description_fallback: a.description_fallback,
})

const dModShape = (m) => ({
    name: m.name, type: m.type, required: m.required === true || m.required === 't',
    position: Number(m.position),
    description_key: m.description_key, description_fallback: m.description_fallback,
})

const relationShape = (r) => ({
    rel_type: r.rel_type, to_kind: r.to_kind, to_slug: r.to_slug, to_name: r.to_name,
    prop_name: r.prop_name, position: Number(r.position),
    description_key: r.description_key, description_fallback: r.description_fallback,
})

// ─── Group child rows by entry_id ────────────────────────────────────────────

function byEntry (rows) {
    const m = new Map()
    for (const r of rows) {
        if (!m.has(r.entry_id)) m.set(r.entry_id, [])
        m.get(r.entry_id).push(r)
    }
    return m
}

// ─── Bulk child query (PostgreSQL ANY array, orphaned rows excluded) ──────────

async function queryChildren (db, table, entryIds, hasOrphanedAt = true) {
    if (!entryIds.length) return []
    const orphanFilter = hasOrphanedAt ? 'AND orphaned_at IS NULL' : ''
    return db.query(
        `SELECT * FROM ${table} WHERE entry_id = ANY($1::uuid[]) ${orphanFilter} ORDER BY entry_id, position`,
        [entryIds],
    )
}

// ─── Dump one kind ────────────────────────────────────────────────────────────

async function dumpKind (db, kind) {
    const entries = await db.query(
        'SELECT * FROM doc_entry WHERE kind = $1 AND orphaned_at IS NULL ORDER BY slug',
        [kind],
    )
    if (!entries.length) {
        console.log(`[${kind}] 0 entries — writing empty fixture`)
        const fixture = { kind, exportedAt: new Date().toISOString(), sourceCommit: sourceCommit(), entryCount: 0, entries: [] }
        fs.writeFileSync(path.join(SEED_DIR, `${kind}.json`), JSON.stringify(fixture, null, 2) + '\n', 'utf-8')
        return 0
    }

    const ids = entries.map(e => e.id)

    const [props, values, params, returns_, emits, slots, examples, dArgs, dMods, relations] = await Promise.all([
        queryChildren(db, 'doc_prop', ids),
        queryChildren(db, 'doc_value', ids),
        queryChildren(db, 'doc_param', ids),
        queryChildren(db, 'doc_return', ids),
        queryChildren(db, 'doc_emit', ids),
        queryChildren(db, 'doc_slot', ids),
        queryChildren(db, 'doc_example', ids, false),
        queryChildren(db, 'doc_directive_arg', ids),
        queryChildren(db, 'doc_directive_modifier', ids),
        queryChildren(db, 'doc_relation', ids),
    ])

    const propsByEntry     = byEntry(props)
    const valuesByEntry    = byEntry(values)
    const paramsByEntry    = byEntry(params)
    const returnsByEntry   = byEntry(returns_)
    const emitsByEntry     = byEntry(emits)
    const slotsByEntry     = byEntry(slots)
    const examplesByEntry  = byEntry(examples)
    const dArgsByEntry     = byEntry(dArgs)
    const dModsByEntry     = byEntry(dMods)
    const relationsByEntry = byEntry(relations)

    const records = entries.map(e => ({
        entry: entryShape(e),
        props:             (propsByEntry.get(e.id)     || []).map(propShape),
        values:            (valuesByEntry.get(e.id)    || []).map(valueShape),
        params:            (paramsByEntry.get(e.id)    || []).map(paramShape),
        returns:           (returnsByEntry.get(e.id)   || []).map(returnShape),
        emits:             (emitsByEntry.get(e.id)     || []).map(emitShape),
        slots:             (slotsByEntry.get(e.id)     || []).map(slotShape),
        examples:          (examplesByEntry.get(e.id)  || []).map(exampleShape),
        directiveArgs:     (dArgsByEntry.get(e.id)     || []).map(dArgShape),
        directiveModifiers:(dModsByEntry.get(e.id)     || []).map(dModShape),
        relations:         (relationsByEntry.get(e.id) || []).map(relationShape),
    }))

    const fixture = {
        kind,
        exportedAt: new Date().toISOString(),
        sourceCommit: sourceCommit(),
        entryCount: records.length,
        entries: records,
    }

    const outPath = path.join(SEED_DIR, `${kind}.json`)
    fs.writeFileSync(outPath, JSON.stringify(fixture, null, 2) + '\n', 'utf-8')
    console.log(`[${kind}] exported ${records.length} entries → ${outPath}`)
    return records.length
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run () {
    fs.mkdirSync(SEED_DIR, { recursive: true })

    const db = await getDb()
    const kinds = DOMAIN_ARG ? [DOMAIN_ARG] : [...DOC_KINDS]
    let total = 0

    for (const kind of kinds) {
        total += await dumpKind(db, kind)
    }

    await closeDb()
    console.log(`\nDUMP complete — ${total} entries across ${kinds.length} kind(s)`)
    console.log(`Fixture directory: ${SEED_DIR}`)
}

run().catch(async (e) => { console.error(e); await closeDb().catch(() => {}); process.exit(2) })
