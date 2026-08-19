/********************************************************
 *  DOC SYNC — INGESTION (`scripts/lib/db-upsert.ts`)
 *
 *  @description
 *  This module reconciles the marketing documentation catalogue — 1 985 rows
 *  behind the public `/api/reference` endpoints — and until this file existed
 *  no spec anywhere referenced it.
 *  Every behaviour below was established by driving the real `ingestFull` /
 *  `ingestSrc` against the in-memory `EntityManager` of `doc-sync-harness.ts`:
 *  no stub of the module under test, no database, no Docker daemon.
 *  The suite mixes two kinds of test and labels each one, because they age in
 *  opposite directions.
 *
 *  @description PINNED — assertions that hold and must keep holding
 *  `ingestSrc` rewrites `source_file` when a symbol moves file.
 *  `ingestSrc` leaves every editorial column alone.
 *  `ingestFull` honours the `edited_by_user` lock.
 *  Child rows whose source counterpart vanished are flagged `orphaned_at`.
 *  A child row that reappears is un-orphaned.
 *
 *  @description ⛔ CHARACTERISED — `it.fails`, one known defect each
 *  A `doc_entry` whose symbol disappeared from the design system is never
 *  flagged, because the resync loop is driven by the SOURCE: `runResync`
 *  iterates extracted symbols and `upsertEntry` matches on `{kind, slug}`, so a
 *  row whose slug is never emitted is never visited.
 *  `doc_entry.orphaned_at` has no writer at all: the sole automatic setter is
 *  `reconcile()`, restricted to `CHILD_SPECS`, and `doc_entry` is not one.
 *  Both are READ by the public API (`e.orphaned_at IS NULL` gates
 *  `server/api/reference/[kind].get.ts`), so the column filters on a value
 *  nothing can ever set.
 *  ⚠️ When one of these turns RED the defect is fixed — delete the `it.fails`
 *  case and write the behavioural test in its place.
 *
 *  @description What this file deliberately does NOT do
 *  It does not implement the missing sweep. Orphaning entries has a production
 *  blast radius (rows hidden from the public API on the next deploy) and needs
 *  the maintainer's call — see issue #362.
 ********************************************************/

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ingestFull, ingestSrc } from '../../../marketing/scripts/lib/db-upsert'
import { DocEntry, DocValue } from '../../../marketing/server/db/entities'
import { createDocSyncHarness, docRecord, valueRow } from './doc-sync-harness'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const OLD_PATH = 'packages/ds/src/enums/Old/demo.enum.ts'
const NEW_PATH = 'packages/ds/src/enums/New/demo.enum.ts'

describe('ingestSrc — structural [SRC] columns', () => {
    it('PINNED — rewrites source_file when the symbol moved file', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord())
        h.ops.length = 0

        const counts = await ingestSrc(h.manager as never, docRecord({ source_file: NEW_PATH }))

        expect(counts.updated).toBe(1)
        expect(h.ops).toContain('UPDATE DocEntry source_file')
        expect(h.rows(DocEntry)[0].source_file).toBe(NEW_PATH)
    })

    it('PINNED — control: an unchanged symbol produces no write at all', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord())
        h.ops.length = 0

        const counts = await ingestSrc(h.manager as never, docRecord())

        expect(counts).toMatchObject({ created: 0, updated: 0, unchanged: 1, orphaned: 0 })
        expect(h.ops).toEqual([])
        expect(h.rows(DocEntry)[0].source_file).toBe(OLD_PATH)
    })

    it('PINNED — leaves every editorial column untouched', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({
            description_fallback: 'Curated prose, written by a human.',
            description_key: 'enums.detail.demo',
            icon: 'mdi-alpha-d-box',
        }))
        h.ops.length = 0

        await ingestSrc(h.manager as never, docRecord({
            source_file: NEW_PATH,
            description_fallback: 'Machine noise that must never land.',
            description_key: null,
            icon: null,
        }))

        const row = h.rows(DocEntry)[0]
        expect(row.description_fallback).toBe('Curated prose, written by a human.')
        expect(row.description_key).toBe('enums.detail.demo')
        expect(row.icon).toBe('mdi-alpha-d-box')
        expect(h.ops).toEqual(['UPDATE DocEntry source_file'])
    })
})

describe('ingestFull — editorial lock', () => {
    it('PINNED — a locked row keeps its editorial columns and still tracks the source', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({ description_fallback: 'Human prose.' }))
        h.rows(DocEntry)[0].edited_by_user = true
        h.ops.length = 0

        await ingestFull(h.manager as never, docRecord({
            source_file: NEW_PATH,
            description_fallback: 'Overwrite attempt.',
        }))

        const row = h.rows(DocEntry)[0]
        expect(row.description_fallback).toBe('Human prose.')
        expect(row.source_file).toBe(NEW_PATH)
    })
})

describe('reconcile — child collections DO get orphaned', () => {
    it('PINNED — an enum member removed from the source is flagged, never deleted', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({}, {
            values: [valueRow(0, 'DEMO.A'), valueRow(1, 'DEMO.B')],
        }))

        const counts = await ingestSrc(h.manager as never, docRecord({}, {
            values: [valueRow(0, 'DEMO.A')],
        }))

        expect(counts.orphaned).toBe(1)
        expect(h.rows(DocValue)).toHaveLength(2)
        expect(h.rows(DocValue).find(r => r.value === 'DEMO.A')!.orphaned_at).toBeNull()
        expect(h.rows(DocValue).find(r => r.value === 'DEMO.B')!.orphaned_at).toBeInstanceOf(Date)
    })

    it('PINNED — a member that reappears is un-orphaned', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({}, {
            values: [valueRow(0, 'DEMO.A'), valueRow(1, 'DEMO.B')],
        }))
        await ingestSrc(h.manager as never, docRecord({}, { values: [valueRow(0, 'DEMO.A')] }))
        expect(h.rows(DocValue).find(r => r.value === 'DEMO.B')!.orphaned_at).toBeInstanceOf(Date)

        await ingestSrc(h.manager as never, docRecord({}, {
            values: [valueRow(0, 'DEMO.A'), valueRow(1, 'DEMO.B')],
        }))

        expect(h.rows(DocValue).find(r => r.value === 'DEMO.B')!.orphaned_at).toBeNull()
    })
})

describe('⛔ doc_entry orphaning — CHARACTERISED DEFECTS', () => {
    /*
     * `runResync` (generate-api-docs.mjs:153) is exactly this loop: for each
     * symbol the extractor emitted, call `ingestSrc`. Nothing else runs. A row
     * whose slug is absent from `symbols` is therefore never read, never
     * compared and never written — which is what the assertion below states.
     */
    async function resyncLoop (harness: ReturnType<typeof createDocSyncHarness>, slugs: string[]) {
        for (const slug of slugs) await ingestSrc(harness.manager as never, docRecord({ slug }))
    }

    it('PINNED — the surviving entries of the same run are still reconciled', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({ slug: 'deleted-from-ds' }))
        await ingestFull(h.manager as never, docRecord({ slug: 'still-in-ds' }))
        h.ops.length = 0

        await resyncLoop(h, ['still-in-ds'])

        expect(h.rows(DocEntry).find(r => r.slug === 'still-in-ds')!.orphaned_at).toBeNull()
        expect(h.ops).toEqual([])
    })

    it.fails('a doc_entry absent from the resynced source is flagged orphaned', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({ slug: 'deleted-from-ds' }))
        await ingestFull(h.manager as never, docRecord({ slug: 'still-in-ds' }))

        await resyncLoop(h, ['still-in-ds'])

        // Currently null: the loop is source-driven, so this row is never visited.
        expect(h.rows(DocEntry).find(r => r.slug === 'deleted-from-ds')!.orphaned_at)
            .toBeInstanceOf(Date)
    })

    it.fails('some ingestion path can write doc_entry.orphaned_at at all', async () => {
        const h = createDocSyncHarness()
        await ingestFull(h.manager as never, docRecord({}, {
            values: [valueRow(0, 'DEMO.A')],
        }))
        // Every shape that would orphan a CHILD row, applied to the entry itself.
        await ingestSrc(h.manager as never, docRecord({}, { values: [] }))
        await ingestFull(h.manager as never, docRecord({}, { values: [] }))

        // `upsertEntry` only ever CLEARS the column (db-upsert.ts:139); the sole
        // setter is `reconcile` (line 203), scoped to CHILD_SPECS, and doc_entry
        // is not one of them.
        expect(h.ops.some(op => op.startsWith('UPDATE DocEntry') && op.includes('orphaned_at')))
            .toBe(true)
    })
})

describe('⛔ doc_entry orphaning — the manual escape hatch is closed too', () => {
    /*
     * Static counterpart to the runtime cases above. It reads the sources rather
     * than executing them so the claim covers the WHOLE marketing package, not
     * just the two functions a spec can call. Treat it as a canary: if a new
     * writer appears, this list stops matching and the test says so.
     */
    const read = (rel: string) => readFileSync(resolve(REPO_ROOT, rel), 'utf-8')

    it('PINNED — the only automatic orphan setter is reconcile(), scoped to CHILD_SPECS', () => {
        const source = read('packages/marketing/scripts/lib/db-upsert.ts')
        const setters = source.split('\n')
            .map((line, i) => ({ line: line.trim(), n: i + 1 }))
            .filter(l => /orphaned_at:\s*new Date\(\)/.test(l.line))

        expect(setters).toHaveLength(1)
        expect(setters[0].line).toContain('manager.update(spec.entity')
        expect(source).toMatch(/const CHILD_SPECS = \{/)
        expect(source.slice(source.indexOf('const CHILD_SPECS'), source.indexOf('const SEED_COLLECTIONS')))
            .not.toContain('DocEntry')
    })

    it('PINNED — runResync is a source-driven loop with no database-side sweep', () => {
        // This is what `resyncLoop` above models, and the reason it is faithful.
        // If a sweep ever lands here, this test fails first and says so.
        const source = read('packages/marketing/scripts/generate-api-docs.mjs')
        const body = source.slice(
            source.indexOf('async function runResync'),
            source.indexOf('async function recordRun'),
        )
        expect(body).toContain('for (const src of symbols)')
        expect(body).toContain('await ingestSrc(manager, record)')
        expect(body).not.toContain('orphaned_at')
        expect(body).not.toContain('manager.find')
        expect(body).not.toContain('manager.update')
        expect(body).not.toContain('DocEntry')

        // …and `ingestSrc` has exactly one caller, so there is no second path.
        expect(source.match(/ingestSrc\(/g)).toHaveLength(1)
    })

    it('PINNED — the admin API rejects orphanedAt in a PATCH body', () => {
        const source = read('packages/marketing/server/utils/admin-mappers.ts')
        const guard = source.slice(source.indexOf('export const ENTRY_SRC_CAMEL'))
        expect(guard).toContain('\'orphanedAt\'')
        expect(guard).toContain('\'orphaned_at\'')
    })

    it('PINNED — the public API nonetheless filters doc_entry rows on that column', () => {
        expect(read('packages/marketing/server/api/reference/[kind].get.ts'))
            .toContain('e.orphaned_at IS NULL')
    })
})
