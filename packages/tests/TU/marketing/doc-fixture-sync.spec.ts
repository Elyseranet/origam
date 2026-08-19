/********************************************************
 *  DOC SYNC — BOOT-TIME FIXTURE BOOTSTRAP
 *
 *  @description
 *  `server/utils/doc-fixture-sync.ts` is the loop the Nitro server runs on every
 *  deploy (`server/plugins/00.db-bootstrap.ts`) and that `docs:seed` reuses, so
 *  it is the only sync path that ever touches a PRODUCTION database.
 *  Until this file existed no spec referenced it either.
 *  The tests run the real `syncFixtures` / `fixtureHash` / `readMeta` /
 *  `writeMeta` against the in-memory `EntityManager` of `doc-sync-harness.ts`.
 *
 *  @description ⛔ CHARACTERISED — `it.fails`
 *  The bootstrap plugin's own header states it "orpheline (jamais delete) les
 *  disparus". That holds for child rows and NOT for `doc_entry`: `syncFixtures`
 *  iterates the fixture records and `ingestFull` matches on `{kind, slug}`, so
 *  an entry deleted from the fixture is never visited on a populated database.
 *  The consequence is the one worth remembering: deleting an entry by hand in a
 *  fixture LOOKS like it works in CI — the ephemeral database is rebuilt from
 *  that same fixture — while production, which only ever upserts, keeps serving
 *  the row forever.
 *  ⚠️ When this turns RED the defect is fixed — delete the `it.fails` case and
 *  write the behavioural test in its place. Fixing it also means correcting the
 *  plugin comment, which currently documents a behaviour the code does not have.
 ********************************************************/

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
    fixtureHash, readMeta, syncFixtures, writeMeta,
} from '../../../marketing/server/utils/doc-fixture-sync'
import { DOC_KINDS } from '../../../marketing/server/db/db.const.mjs'
import { DocEntry, DocValue } from '../../../marketing/server/db/entities'
import { createDocSyncHarness, docRecord, valueRow } from './doc-sync-harness'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')

describe('syncFixtures — upsert loop', () => {
    it('PINNED — creates the entries a fresh database is missing', async () => {
        const h = createDocSyncHarness()

        const counts = await syncFixtures(h.manager as never, [
            docRecord({ slug: 'alpha' }) as never,
            docRecord({ slug: 'beta' }) as never,
        ])

        expect(counts.created).toBe(2)
        expect(h.rows(DocEntry).map(r => r.slug)).toEqual(['alpha', 'beta'])
    })

    it('PINNED — a second run with the same fixture writes nothing', async () => {
        const h = createDocSyncHarness()
        const records = [docRecord({ slug: 'alpha' }), docRecord({ slug: 'beta' })]
        await syncFixtures(h.manager as never, records as never)
        h.ops.length = 0

        const counts = await syncFixtures(h.manager as never, records as never)

        expect(counts).toMatchObject({ created: 0, updated: 0, unchanged: 2, orphaned: 0 })
        expect(h.ops).toEqual([])
    })

    it('PINNED — restores the editorial lock the fixture carries', async () => {
        const h = createDocSyncHarness()

        await syncFixtures(h.manager as never, [
            docRecord({ slug: 'locked', edited_by_user: true }) as never,
            docRecord({ slug: 'free' }) as never,
        ])

        expect(h.rows(DocEntry).find(r => r.slug === 'locked')!.edited_by_user).toBe(true)
        expect(h.rows(DocEntry).find(r => r.slug === 'free')!.edited_by_user).toBe(false)
    })

    it('PINNED — a locked entry keeps its prose when the fixture disagrees', async () => {
        const h = createDocSyncHarness()
        await syncFixtures(h.manager as never, [
            docRecord({ slug: 'locked', edited_by_user: true, description_fallback: 'Admin edit.' }) as never,
        ])

        await syncFixtures(h.manager as never, [
            docRecord({ slug: 'locked', description_fallback: 'Fixture prose.' }) as never,
        ])

        expect(h.rows(DocEntry)[0].description_fallback).toBe('Admin edit.')
    })

    it('PINNED — a child row dropped from a fixture record IS orphaned', async () => {
        const h = createDocSyncHarness()
        await syncFixtures(h.manager as never, [
            docRecord({}, { values: [valueRow(0, 'DEMO.A'), valueRow(1, 'DEMO.B')] }) as never,
        ])

        const counts = await syncFixtures(h.manager as never, [
            docRecord({}, { values: [valueRow(0, 'DEMO.A')] }) as never,
        ])

        expect(counts.orphaned).toBe(1)
        expect(h.rows(DocValue).find(r => r.value === 'DEMO.B')!.orphaned_at).toBeInstanceOf(Date)
    })

    it.fails('an entry dropped from the fixture is orphaned on the next bootstrap', async () => {
        const h = createDocSyncHarness()
        await syncFixtures(h.manager as never, [
            docRecord({ slug: 'chart-bullet-orientation' }) as never,
            docRecord({ slug: 'still-documented' }) as never,
        ])

        // Next deploy, the fixture no longer lists the first slug.
        await syncFixtures(h.manager as never, [docRecord({ slug: 'still-documented' }) as never])

        // Currently null — the row is never visited, so the public API keeps
        // serving it indefinitely (`e.orphaned_at IS NULL` matches).
        expect(h.rows(DocEntry).find(r => r.slug === 'chart-bullet-orientation')!.orphaned_at)
            .toBeInstanceOf(Date)
    })
})

describe('fixtureHash — the bootstrap fast-path gate', () => {
    const texts = (over: Record<string, string> = {}) =>
        Object.fromEntries(DOC_KINDS.map(k => [k, `${k}-content`])) as Record<string, string> & typeof over

    it('PINNED — same content, same digest', () => {
        expect(fixtureHash(texts())).toBe(fixtureHash(texts()))
    })

    it('PINNED — insensitive to the key order of the input object', () => {
        const forward = texts()
        const reversed = Object.fromEntries(Object.entries(forward).reverse())
        expect(fixtureHash(reversed)).toBe(fixtureHash(forward))
    })

    it('PINNED — a one-character content change moves the digest', () => {
        const changed = { ...texts(), enum: 'enum-content ' }
        expect(fixtureHash(changed)).not.toBe(fixtureHash(texts()))
    })

    it('PINNED — a missing kind moves the digest instead of being ignored', () => {
        const missing = { ...texts(), directive: null }
        expect(fixtureHash(missing)).not.toBe(fixtureHash(texts()))
        expect(fixtureHash(missing)).toBe(fixtureHash({ ...texts(), directive: '' }))
    })

    it('PINNED — content cannot migrate between kinds without moving the digest', () => {
        // The NUL separators are what stop `{a:'xy', b:''}` and `{a:'x', b:'y'}`
        // from hashing alike; this is the assertion that keeps them there.
        const base = Object.fromEntries(DOC_KINDS.map(k => [k, ''])) as Record<string, string>
        const left = { ...base, component: 'xy' }
        const right = { ...base, component: 'x', composable: 'y' }
        expect(fixtureHash(left)).not.toBe(fixtureHash(right))
    })
})

describe('syncFixtures — blast radius of a future fix', () => {
    /*
     * Three call sites share this loop, so the sweep the entry-level defect
     * needs would take effect on all three at once — including one that a
     * logged-in admin can trigger against production on demand. Enumerated here
     * so whoever writes that sweep sees the surface before writing it.
     */
    const read = (rel: string) => readFileSync(resolve(REPO_ROOT, rel), 'utf-8')

    it.each([
        ['server/plugins/00.db-bootstrap.ts', 'every deploy, automatically'],
        ['server/api/admin/reference/sync.post.ts', 'an admin POST, on demand'],
        ['scripts/generate-api-docs.mjs', 'the docs:seed CLI'],
    ])('PINNED — %s calls syncFixtures (%s)', (rel) => {
        expect(read(`packages/marketing/${rel}`)).toContain('syncFixtures(')
    })
})

describe('doc_meta — hash bookkeeping', () => {
    it('PINNED — readMeta returns null for an unknown key', async () => {
        const h = createDocSyncHarness()
        expect(await readMeta(h.manager as never, 'seed_fixture_hash')).toBeNull()
    })

    it('PINNED — writeMeta inserts once then updates in place', async () => {
        const h = createDocSyncHarness()

        await writeMeta(h.manager as never, 'seed_fixture_hash', 'aaa')
        await writeMeta(h.manager as never, 'seed_fixture_hash', 'bbb')

        expect(await readMeta(h.manager as never, 'seed_fixture_hash')).toBe('bbb')
        expect(h.ops).toEqual(['INSERT DocMeta', 'UPDATE DocMeta value'])
    })
})
