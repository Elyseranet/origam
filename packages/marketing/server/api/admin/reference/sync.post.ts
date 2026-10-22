/**
 * POST /api/admin/reference/sync
 *
 * Re-applies the bundled fixtures (server/db/seed/*.json, embedded as server
 * assets) to the database — the same idempotent upsert used by the boot-time
 * bootstrap (server/plugins/00.db-bootstrap.ts). Works in the deployed
 * container (.output) where DS source files and scripts/ are absent.
 *
 * Behaviour:
 *   - Loads the 8 fixture JSON files via useStorage('assets:db-seed').
 *   - Calls syncFixtures inside a transaction: creates new entries, refreshes
 *     [SRC] columns, preserves [ÉDIT] / editorial locks, orphans removed rows.
 *   - Updates doc_meta.seed_fixture_hash so the bootstrap skips the next boot.
 *   - Inserts a DocSyncRun audit row (status success / failed + counts).
 *   - Returns 200 with the aggregated counts and status (IAdminSyncResult shape).
 *
 * Authentication: handled by server/middleware/admin.ts — every /api/admin/**
 * request is already guarded before this handler runs.
 *
 * Idempotent: a second sync with unchanged fixtures produces created=0
 * updated=0 (syncFixtures only writes rows that actually changed).
 */

import { DocSyncRun } from '../../../db/entities'
import { DOC_KINDS, DOC_META_KEYS } from '../../../../src/consts/db.const'
import { fixtureHash, syncFixtures, writeMeta } from '../../../../src/utils/doc-fixture-sync.util'

import { useDb } from '../../../../src/utils/db.util'
/** Normalise a raw server-asset value (string | Buffer | Uint8Array) to string. */
function toText (raw: unknown): string | null {
    if (raw == null) return null
    if (typeof raw === 'string') return raw
    if (raw instanceof Uint8Array) return Buffer.from(raw).toString('utf-8')
    return String(raw)
}

export default defineEventHandler(async () => {
    const db = await useDb()
    const storage = useStorage('assets:db-seed')

    // Load every bundled fixture text, keyed by kind — same as the bootstrap.
    const texts: Record<string, string | null> = {}
    for (const kind of DOC_KINDS) {
        texts[kind] = toText(await storage.getItemRaw(`${kind}.json`))
    }

    // Parse all entries across kinds into a flat records list.
    const records = []
    for (const kind of DOC_KINDS) {
        const text = texts[kind]
        if (!text) continue
        const fixture = JSON.parse(text)
        for (const rec of (fixture.entries ?? [])) records.push(rec)
    }

    let counts = { created: 0, updated: 0, unchanged: 0, orphaned: 0 }
    let runStatus: 'success' | 'failed' = 'success'
    let runError: string | null = null

    try {
        counts = await db.transaction(manager => syncFixtures(manager, records))
        // Keep the hash in sync so the next boot takes the fast path.
        await writeMeta(db.manager, DOC_META_KEYS.SEED_FIXTURE_HASH, fixtureHash(texts))
    } catch (err) {
        runStatus = 'failed'
        runError = err instanceof Error ? err.message : String(err)
    }

    await db.getRepository(DocSyncRun).insert({
        finished_at: new Date(),
        domain: null,
        created_count: counts.created,
        updated_count: counts.updated,
        unchanged_count: counts.unchanged,
        orphaned_count: counts.orphaned,
        source_commit: process.env.NUXT_DOCS_SOURCE_COMMIT ?? null,
        status: runStatus,
        error: runError,
    })

    if (runStatus === 'failed') {
        throw createError({ statusCode: 500, statusMessage: `Sync failed: ${runError}` })
    }

    return {
        created: counts.created,
        updated: counts.updated,
        unchanged: counts.unchanged,
        orphaned: counts.orphaned,
        status: runStatus,
        error: null,
    }
})
