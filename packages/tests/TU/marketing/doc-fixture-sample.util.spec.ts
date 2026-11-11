// #1351 — import partiel déterministe des fixtures API-Reference.
// Épingle, sur les VRAIES fixtures committées : même sous-ensemble à chaque
// appel, ~20 %, directives complètes, aucun parent pendant ; et le parsing de
// la variable d'env (une faute de frappe ne doit pas importer n'importe quoi).
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { DOC_KINDS } from '~/consts/db.const'
import type { IFixtureRecord } from '~/interfaces/doc-fixture-sync.interface'
import {
    parseSamplePercent, resolveSamplePercent, sampleBucket, sampleFixtureRecords,
} from '~/utils/doc-fixture-sample.util'

const seedDir = path.resolve(__dirname, '../../../marketing/src/assets/seed')
const all: IFixtureRecord[] = DOC_KINDS.flatMap(kind =>
    JSON.parse(fs.readFileSync(path.join(seedDir, `${kind}.json`), 'utf-8')).entries)
const keyOf = (r: IFixtureRecord) => `${r.entry.kind}:${r.entry.slug}`

describe('sampleFixtureRecords', () => {
    const sample = sampleFixtureRecords(all, 20)
    const kept = new Set(sample.map(keyOf))

    it('est déterministe (même sous-ensemble, même ordre)', () => {
        expect(sampleFixtureRecords(all, 20).map(keyOf)).toEqual(sample.map(keyOf))
    })

    it('garde ~20 % des entrées', () => {
        const ratio = sample.length / all.length
        expect(ratio).toBeGreaterThan(0.15)
        expect(ratio).toBeLessThan(0.25)
    })

    it('garde toutes les directives', () => {
        const directives = all.filter(r => r.entry.kind === 'directive')
        expect(directives.length).toBeGreaterThan(0)
        for (const d of directives) expect(kept.has(keyOf(d))).toBe(true)
    })

    it('n\'introduit aucun parent pendant', () => {
        const full = new Set(all.map(keyOf))
        const dangling = sample.filter((r) => {
            const p = r.entry.parent_slug
            const k = `${r.entry.kind}:${p}`
            return typeof p === 'string' && p && full.has(k) && !kept.has(k)
        })
        expect(dangling).toEqual([])
    })

    it('100 % renvoie tout, inchangé', () => {
        expect(sampleFixtureRecords(all, 100)).toBe(all)
    })

    it('ferme la chaîne de parents même hors tirage, sans boucler sur un cycle', () => {
        const rec = (slug: string, parent: string | null): IFixtureRecord =>
            ({ entry: { kind: 'component', slug, parent_slug: parent } })
        // Le tirage est par hash : on cherche un enfant gardé à 1 % et un parent qui ne l'est pas.
        const child = Array.from({ length: 2000 }, (_, i) => `c${i}`).find(s => sampleBucket('component', s) < 1)!
        const parent = Array.from({ length: 2000 }, (_, i) => `p${i}`).find(s => sampleBucket('component', s) >= 1)!
        const out = sampleFixtureRecords([rec(child, parent), rec(parent, child)], 1)
        expect(out.map(r => r.entry.slug).sort()).toEqual([child, parent].sort())
    })
})

describe('parseSamplePercent / resolveSamplePercent', () => {
    it('vide ou absent → null', () => {
        expect(parseSamplePercent(undefined)).toBeNull()
        expect(parseSamplePercent('')).toBeNull()
    })

    it.each(['0', '101', '20.5', 'abc', '-5'])('rejette %s', (raw) => {
        expect(() => parseSamplePercent(raw)).toThrow()
    })

    it('env > doc_meta > 100', () => {
        expect(resolveSamplePercent('50', '20')).toBe(50)
        expect(resolveSamplePercent(undefined, '20')).toBe(20)
        expect(resolveSamplePercent(undefined, null)).toBe(100)
    })
})
