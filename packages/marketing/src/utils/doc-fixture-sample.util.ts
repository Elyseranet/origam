/**
 * doc-fixture-sample.util.ts — deterministic partial seed of the API-Reference
 * fixtures (#1351). Pure: no DB, no Nitro auto-import, so it is shared by the
 * `docs:seed` script AND the boot-time bootstrap plugin (otherwise a dev server
 * boot would re-import 100 % over a sampled database).
 *
 * Selection, per entry: `sha1(kind:slug) % 100 < percent`. Stable across runs
 * and across fixture refreshes (adding an entry never reshuffles the others).
 * Always kept whole: `DOC_SAMPLE.FULL_KINDS`. Always pulled in: the
 * `parent_slug` closure (same kind), so no kept entry points to a missing
 * parent. Relations are NOT closed over — owner decision A3.
 */

import { createHash } from 'node:crypto'

import { DOC_SAMPLE } from '../consts/db.const'
import type { IFixtureRecord } from '../interfaces/doc-fixture-sync.interface'

/** Bucket 0..99 of an entry, from the sha1 of `kind:slug`. */
export function sampleBucket (kind: string, slug: string): number {
    return createHash('sha1').update(`${kind}:${slug}`).digest().readUInt32BE(0) % DOC_SAMPLE.BUCKETS
}

/**
 * Parse the sample percent from its raw env / doc_meta value.
 * Unset or empty → null (caller decides the default). Anything but an integer
 * in 1..100 throws: a typo must not silently import the wrong amount of data.
 */
export function parseSamplePercent (raw: string | null | undefined): number | null {
    if (raw == null || raw.trim() === '') return null
    const n = Number(raw)
    if (!Number.isInteger(n) || n < 1 || n > DOC_SAMPLE.FULL_PERCENT) {
        throw new Error(`Invalid seed sample percent "${raw}" — expected an integer between 1 and ${DOC_SAMPLE.FULL_PERCENT}.`)
    }
    return n
}

/**
 * Effective percent: the env var wins, else the percent the DB was last seeded
 * with (doc_meta), else full. The doc_meta fallback is what keeps a sampled dev
 * database sampled when the server boots without the env var.
 */
export function resolveSamplePercent (envRaw: string | null | undefined, storedRaw: string | null | undefined): number {
    return parseSamplePercent(envRaw) ?? parseSamplePercent(storedRaw) ?? DOC_SAMPLE.FULL_PERCENT
}

/** Keep ~`percent` % of the records (see header). Order is preserved. */
export function sampleFixtureRecords<T extends IFixtureRecord> (records: T[], percent: number): T[] {
    if (percent >= DOC_SAMPLE.FULL_PERCENT) return records

    const key = (kind: string, slug: string) => `${kind}:${slug}`
    const byKey = new Map(records.map(r => [key(r.entry.kind, r.entry.slug), r]))
    const kept = new Set<string>()

    for (const r of records) {
        const { kind, slug } = r.entry
        if (!DOC_SAMPLE.FULL_KINDS.includes(kind) && sampleBucket(kind, slug) >= percent) continue
        // Walk up the parent chain; `kept` doubles as the cycle guard.
        let k: string | null = key(kind, slug)
        while (k && byKey.has(k) && !kept.has(k)) {
            kept.add(k)
            const parent = byKey.get(k)!.entry.parent_slug
            k = typeof parent === 'string' && parent ? key(kind, parent) : null
        }
    }

    return records.filter(r => kept.has(key(r.entry.kind, r.entry.slug)))
}
