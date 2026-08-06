/**
 * db-upsert.ts — idempotent, non-destructive ingestion of a normalised doc
 * record (from doc-to-rows.ts) into the database via the TypeORM repository /
 * EntityManager API.
 *
 * Two masks enforce the ADR §3.3 boundary:
 *   - 'all'  (first seed): writes both [SRC] and [ÉDIT] columns, but NEVER
 *            overwrites a row whose `edited_by_user` lock is set.
 *   - 'src'  (re-sync):   writes ONLY [SRC] columns. [ÉDIT] is untouched by
 *            construction — they are never in the UPDATE set.
 *
 * Reconciliation per collection: match existing rows by their natural key,
 * insert new ones, update only changed (masked) columns, and flag rows whose
 * source counterpart vanished via `orphaned_at` (never hard-delete). Re-appearing
 * rows are un-orphaned. Everything runs inside the caller's transaction
 * (the EntityManager passed in by dataSource.transaction()).
 */

import type { EntityManager } from 'typeorm'

import {
    DocEntry, DocProp, DocValue, DocParam, DocReturn, DocEmit, DocSlot,
    DocExample, DocDirectiveArg, DocDirectiveModifier, DocRelation,
} from '../../server/db/entities/index.ts'

const NULL_KEY = ' null'

/** doc_entry column masks. */
const ENTRY_SRC = ['name', 'definition', 'signature', 'tag', 'value', 'source_file', 'parent_slug']
const ENTRY_EDIT = [
    'category', 'domain', 'icon', 'description_key', 'description_fallback',
    'package_note', 'note_key', 'note_fallback', 'story_url', 'doc_url', 'kind_extra',
    'svg_title_key', 'svg_title_fallback', 'svg_desc_key', 'svg_desc_fallback',
]

/**
 * Per-collection reconciliation spec.
 *   entity— the TypeORM entity class
 *   key   — natural-identity columns (matched across runs)
 *   src   — [SRC] columns (written by both seed and re-sync)
 *   edit  — [ÉDIT] columns (written only by seed, and only when unlocked)
 *   orphan— whether the table has an `orphaned_at` soft-delete column
 */
const CHILD_SPECS = {
    props: { entity: DocProp, key: ['name'], src: ['type_label', 'optional', 'required', 'position'], edit: ['type_slug', 'type_kind', 'default_value', 'description_key', 'description_fallback'], orphan: true },
    values: { entity: DocValue, key: ['value'], src: ['position'], edit: ['description_key', 'description_fallback'], orphan: true },
    params: { entity: DocParam, key: ['name'], src: ['type', 'required', 'default_value', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    returns: { entity: DocReturn, key: ['name'], src: ['type', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    emits: { entity: DocEmit, key: ['event'], src: ['payload_label', 'position'], edit: ['payload_slug', 'payload_kind', 'description_key', 'description_fallback'], orphan: true },
    slots: { entity: DocSlot, key: ['slot'], src: ['slot_props', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    examples: { entity: DocExample, key: ['position'], src: [], edit: ['title_key', 'title_fallback', 'code', 'lang'], orphan: false },
    directiveArgs: { entity: DocDirectiveArg, key: ['name'], src: ['type', 'required', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    directiveModifiers: { entity: DocDirectiveModifier, key: ['name'], src: ['type', 'required', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    relations: { entity: DocRelation, key: ['rel_type', 'to_kind', 'to_slug', 'to_name', 'prop_name'], src: ['position'], edit: ['description_key', 'description_fallback'], orphan: true },
}

/** All collections written by the first seed. */
const SEED_COLLECTIONS = Object.keys(CHILD_SPECS)
/** Collections refreshed by the re-sync (structural facts of the 4 DS families). */
const SRC_COLLECTIONS = ['props', 'values', 'params', 'returns']

const blankCounts = () => ({ created: 0, updated: 0, unchanged: 0, orphaned: 0 })

function bump (acc, c) {
    acc.created += c.created; acc.updated += c.updated
    acc.unchanged += c.unchanged; acc.orphaned += c.orphaned
}

/**
 * Stable, key-sorted JSON so jsonb round-trips (pg reorders keys) compare equal.
 * Mirrors JSON.stringify semantics: undefined-valued object keys are dropped,
 * undefined array elements become null.
 */
function stableStringify (v) {
    if (v === undefined) return undefined
    if (v === null || typeof v !== 'object') return JSON.stringify(v)
    if (Array.isArray(v)) {
        return '[' + v.map(x => { const s = stableStringify(x); return s === undefined ? 'null' : s }).join(',') + ']'
    }
    const parts = []
    for (const k of Object.keys(v).sort()) {
        const s = stableStringify(v[k])
        if (s !== undefined) parts.push(JSON.stringify(k) + ':' + s)
    }
    return '{' + parts.join(',') + '}'
}

/** jsonb is compared as a canonical (key-sorted) string. */
function norm (col, v) {
    if (v === undefined) return null
    if (col === 'kind_extra') return v === null ? null : stableStringify(v)
    return v
}

function keyOf (row, cols) {
    return cols.map(c => {
        const v = row[c]
        return (v === null || v === undefined) ? NULL_KEY : String(v)
    }).join('')
}

/** Build a patch of only the masked columns that actually differ. */
function diffPatch (row, existing, cols) {
    const patch = {}
    for (const col of cols) {
        if (norm(col, row[col]) !== norm(col, existing[col])) {
            patch[col] = row[col] === undefined ? null : row[col]
        }
    }
    return patch
}

/** Row payload for INSERT (entry_id + all key/src/edit columns the spec knows). */
function insertPayload (row, cols, entryId) {
    const out = { entry_id: entryId }
    for (const col of cols) out[col] = row[col] === undefined ? null : row[col]
    return out
}

/**
 * Upsert the doc_entry row. Returns { id, counts }.
 * On 'all' mask, a locked entry only gets its [SRC] columns refreshed.
 */
async function upsertEntry (manager, entry, mask) {
    const counts = blankCounts()
    const existing = await manager.findOne(DocEntry, { where: { kind: entry.kind, slug: entry.slug } })

    if (!existing) {
        const payload = { kind: entry.kind, slug: entry.slug }
        for (const col of [...ENTRY_SRC, ...ENTRY_EDIT]) payload[col] = entry[col] === undefined ? null : entry[col]
        const res = await manager.insert(DocEntry, payload)
        counts.created++
        return { id: res.identifiers[0].id, counts }
    }

    const locked = mask === 'all' && existing.edited_by_user
    const cols = (mask === 'src' || locked) ? ENTRY_SRC : [...ENTRY_SRC, ...ENTRY_EDIT]
    const patch = diffPatch(entry, existing, cols)
    if (existing.orphaned_at !== null) patch.orphaned_at = null

    if (Object.keys(patch).length) {
        await manager.update(DocEntry, { id: existing.id }, patch)
        counts.updated++
    } else {
        counts.unchanged++
    }
    return { id: existing.id, counts }
}

/**
 * Reconcile one child collection for an entry.
 * `relTypeScope` (relations only) restricts existing rows to one rel_type so a
 * re-sync that owns only `extends` edges never orphans curated used_by/related.
 */
async function reconcile (manager, specName, entryId, rows, mask, relTypeScope) {
    const spec = CHILD_SPECS[specName]
    const counts = blankCounts()
    const cols = [...spec.key, ...spec.src, ...spec.edit]

    const where = relTypeScope ? { entry_id: entryId, rel_type: relTypeScope } : { entry_id: entryId }
    const existingRows = await manager.find(spec.entity, { where })
    const existingByKey = new Map(existingRows.map(r => [keyOf(r, spec.key), r]))
    const seen = new Set()

    // Collapse rows that share a natural key (e.g. an interface that extends
    // Omit<…> twice → one 'Omit' edge). Keeping the first is non-lossy: the
    // colliding rows are indistinguishable by their identity columns.
    const deduped = []
    const dedupSeen = new Set()
    for (const row of rows) {
        const k = keyOf(row, spec.key)
        if (dedupSeen.has(k)) continue
        dedupSeen.add(k)
        deduped.push(row)
    }
    rows = deduped

    for (const row of rows) {
        const k = keyOf(row, spec.key)
        seen.add(k)
        const ex = existingByKey.get(k)
        if (!ex) {
            await manager.insert(spec.entity, insertPayload(row, cols, entryId))
            counts.created++
            continue
        }
        const locked = mask === 'all' && ex.edited_by_user
        const writable = (mask === 'src' || locked) ? spec.src : [...spec.src, ...spec.edit]
        const patch = diffPatch(row, ex, writable)
        if (spec.orphan && ex.orphaned_at !== null) patch.orphaned_at = null
        if (Object.keys(patch).length) {
            await manager.update(spec.entity, { id: ex.id }, patch)
            counts.updated++
        } else {
            counts.unchanged++
        }
    }

    // Rows present in DB but absent from the source → orphan (never delete).
    for (const [k, ex] of existingByKey) {
        if (seen.has(k)) continue
        if (spec.orphan && ex.orphaned_at === null) {
            await manager.update(spec.entity, { id: ex.id }, { orphaned_at: new Date() })
            counts.orphaned++
        }
    }
    return counts
}

/**
 * Ingest a full record (first seed): entry + every collection, mask 'all'.
 * Returns aggregated counts.
 */
export async function ingestFull (manager: EntityManager, record) {
    const total = blankCounts()
    const { id, counts } = await upsertEntry(manager, record.entry, 'all')
    bump(total, counts)
    for (const name of SEED_COLLECTIONS) {
        bump(total, await reconcile(manager, name, id, record[name] ?? [], 'all'))
    }
    return total
}

/**
 * Ingest structural facts only (re-sync): entry [SRC] + the [SRC] collections,
 * plus `extends` relation edges. Editorial collections are left untouched.
 */
export async function ingestSrc (manager: EntityManager, record) {
    const total = blankCounts()
    const { id, counts } = await upsertEntry(manager, record.entry, 'src')
    bump(total, counts)
    for (const name of SRC_COLLECTIONS) {
        bump(total, await reconcile(manager, name, id, record[name] ?? [], 'src'))
    }
    const extendsRels = (record.relations ?? []).filter(r => r.rel_type === 'extends')
    bump(total, await reconcile(manager, 'relations', id, extendsRels, 'src', 'extends'))
    return total
}
