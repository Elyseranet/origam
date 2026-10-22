/**
 * doc-fixture-sync.ts — the ONE idempotent fixture→DB sync used by both the
 * boot-time bootstrap (server/plugins/00.db-bootstrap.ts) and the standalone
 * seed script (scripts/generate-api-docs.mjs). Extracted so the loop lives in
 * exactly one place (no duplication between runtime and tooling).
 *
 * `syncFixtures` UPSERTs a batch of dumped records via `ingestFull` (mask
 * 'all'): it creates new entries + children, refreshes [SRC] columns, NEVER
 * overwrites a row whose editorial lock (`edited_by_user`) is set, and flags
 * rows absent from the source as orphaned (never hard-deletes). It then
 * re-applies the lock flag carried by the fixture (ingestFull writes the
 * [ÉDIT] columns but never sets the lock itself).
 *
 * This module stays free of Nitro auto-imports (`useStorage`, …) so it is
 * importable both by the Nitro runtime bundle AND by the tsx-run script. Each
 * caller loads its fixtures its own way (fs vs useStorage) and passes the parsed
 * records in.
 *
 * `ingestFull` is imported directly from the ingestion lib — the reconciliation
 * logic is not duplicated. esbuild follows the import into the Nitro server
 * bundle (the lib is pure TypeORM EntityManager code, no decorators of its own).
 */

import { createHash } from 'node:crypto'

import type { EntityManager } from 'typeorm'

import { ingestFull } from '../../scripts/db-upsert'
import { DocEntry, DocMeta } from '../../server/db/entities'
import { DOC_KINDS } from '../consts/db.const'

/** Aggregate reconciliation counters returned by a sync run. */
export interface FixtureSyncCounts {
    created: number
    updated: number
    unchanged: number
    orphaned: number
}

/** A single dumped record (server/db/seed/<kind>.json `entries[i]`). */
export interface FixtureRecord {
    entry: { kind: string, slug: string, edited_by_user?: boolean, [k: string]: unknown }
    [collection: string]: unknown
}

const blank = (): FixtureSyncCounts => ({ created: 0, updated: 0, unchanged: 0, orphaned: 0 })

/**
 * Ingest a batch of dumped fixture records into the DB via `ingestFull`, then
 * restore the editorial lock for records that carry it. Runs against the caller's
 * EntityManager (wrap it in a transaction upstream). Returns aggregated counts.
 */
export async function syncFixtures (manager: EntityManager, records: FixtureRecord[]): Promise<FixtureSyncCounts> {
    const total = blank()

    for (const record of records) {
        const r = await ingestFull(manager, record)
        total.created += r.created
        total.updated += r.updated
        total.unchanged += r.unchanged
        total.orphaned += r.orphaned

        // Restore the editorial lock — ingestFull uses the 'all' mask but never
        // sets edited_by_user itself (it defaults to false on INSERT). Mirrors the
        // original runSeed fixture branch so behaviour stays identical.
        if (record.entry.edited_by_user) {
            await manager.update(
                DocEntry,
                { kind: record.entry.kind, slug: record.entry.slug },
                { edited_by_user: true },
            )
        }
    }

    return total
}

/**
 * Stable content hash (sha256, hex) of the bundled fixture files. Fed in the
 * canonical DOC_KINDS order so the digest is deterministic regardless of load
 * order. Missing kinds contribute their name only (so adding/removing a kind
 * still shifts the hash). Used as the fast-path gate in the bootstrap.
 */
export function fixtureHash (contentsByKind: Record<string, string | null | undefined>): string {
    const h = createHash('sha256')
    for (const kind of DOC_KINDS) {
        h.update(kind)
        h.update('\0')
        h.update(contentsByKind[kind] ?? '')
        h.update('\0')
    }
    return h.digest('hex')
}

/** Read a doc_meta value by key (null when the row is absent). */
export async function readMeta (manager: EntityManager, key: string): Promise<string | null> {
    const row = await manager.findOne(DocMeta, { where: { key } })
    return row ? row.value : null
}

/** Upsert a doc_meta key/value pair. */
export async function writeMeta (manager: EntityManager, key: string, value: string): Promise<void> {
    const existing = await manager.findOne(DocMeta, { where: { key } })
    if (existing) {
        await manager.update(DocMeta, { id: existing.id }, { value })
    } else {
        await manager.insert(DocMeta, { key, value })
    }
}
