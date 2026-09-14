/********************************************************
 *  DOC SYNC — WHAT THE EXTRACTOR ACTUALLY COVERS
 *
 *  @description
 *  `docs:sync` is routinely described as "the design system is the source of
 *  truth for the catalogue". It is true of half the catalogue.
 *  `DOMAINS` (`scripts/lib/extract.mjs:33`) lists four directories; `DOC_KINDS`
 *  (`server/db/db.const.mjs`) lists eight families. The gap is written down in
 *  one README paragraph and nowhere else — nothing says it at runtime, and it
 *  is the direct source of the "the dump is not a source" confusion recorded on
 *  issue #362.
 *  This file makes the asymmetry executable, and does the same for the second
 *  blind spot of the same extractor: an aliased re-export.
 *  Everything below drives the REAL `createProgram` / `extractFile` over the
 *  REAL `packages/ds/src`, and compares against the committed seed fixtures —
 *  which is what CI loads into its ephemeral database before syncing, so they
 *  are the closest observable stand-in for the catalogue.
 *
 *  @description ⛔ CHARACTERISED — `it.fails`, one known defect each
 *  Four of the eight documented families have no extractor, so their
 *  `source_file` can only ever be whatever the fixture says.
 *  An `export { X as Y }` is an `ExportDeclaration`; `extractFile` matches only
 *  `ts.isEnumDeclaration` and friends, so the alias is invisible to it while the
 *  catalogue entry created for the alias lives on beside the declaration's own —
 *  the same enum documented twice, under two slugs, with two `source_file`
 *  values.
 *  ⚠️ When one of these turns RED the defect is fixed — delete the `it.fails`
 *  case and write the behavioural test in its place.
 ********************************************************/

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
    DOMAINS, SLUG_STYLE, createProgram, extractFile, listSourceFiles, toSlug,
} from '../../../marketing/scripts/lib/extract.mjs'
import { DOC_KINDS } from '../../../marketing/server/db/db.const.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')
const SEED_DIR = resolve(REPO_ROOT, 'packages/marketing/server/db/seed')

/** An `export { X as Y }` re-export — the shape the extractor cannot see. */
const ALIASED_REEXPORT = /export\s*\{\s*([A-Za-z0-9_$]+)\s+as\s+([A-Za-z0-9_$]+)\s*\}/g

const EXTRACTED_KINDS = Object.values(DOMAINS).map(d => d.kind).sort()
const FIXTURE_ONLY_KINDS = DOC_KINDS.filter(k => !EXTRACTED_KINDS.includes(k))

const fixtureSlugs = (kind: string): Set<string> => {
    const fixture = JSON.parse(readFileSync(resolve(SEED_DIR, `${kind}.json`), 'utf-8'))
    return new Set<string>(fixture.entries.map((e: { entry: { slug: string } }) => e.entry.slug))
}

/** Every `{ from, to }` alias declared in the sources the extractor walks. */
function aliasedReexports () {
    const found: Array<{ domain: string, kind: string, file: string, from: string, to: string }> = []
    for (const domain of Object.keys(DOMAINS)) {
        for (const file of listSourceFiles(domain)) {
            if (file.endsWith('/index.ts')) continue
            const source = readFileSync(file, 'utf-8')
            for (const m of source.matchAll(ALIASED_REEXPORT)) {
                found.push({ domain, kind: DOMAINS[domain].kind, file, from: m[1], to: m[2] })
            }
        }
    }
    return found
}

describe('DOMAINS — four families of eight', () => {
    it('PINNED — the extractor covers exactly enum, interface, const and util', () => {
        expect(EXTRACTED_KINDS).toEqual(['const', 'enum', 'interface', 'util'])
        expect(Object.keys(DOMAINS)).toEqual(['enums', 'interfaces', 'consts', 'utils'])
    })

    it('PINNED — component, composable, directive and type have no extractor', () => {
        expect(FIXTURE_ONLY_KINDS).toEqual(['component', 'composable', 'directive', 'type'])
    })

    it('PINNED — those four are documented anyway, so the fixture is their only channel', () => {
        for (const kind of FIXTURE_ONLY_KINDS) {
            expect(fixtureSlugs(kind).size, `${kind}.json is populated`).toBeGreaterThan(0)
        }
    })

    it.fails('every DOC_KINDS family is refreshed from the design-system source', () => {
        // Currently four of eight. A `source_file` on a component / composable /
        // directive / type row is frozen at whatever the fixture carries: no run
        // of `docs:sync` can ever correct it.
        expect(EXTRACTED_KINDS).toEqual([...DOC_KINDS].sort())
    })
})

describe('aliased re-exports — the same symbol documented twice', () => {
    const aliases = aliasedReexports()
    const { program, checker } = createProgram()

    const emittedNames = (domain: string) => {
        const names = new Set<string>()
        for (const file of listSourceFiles(domain)) {
            for (const s of extractFile(domain, file, program, checker)) names.add(s.name)
        }
        return names
    }

    it('PINNED — the design system does declare aliased re-exports', () => {
        // Two today. The generic scan keeps this honest as the DS evolves; the
        // assertions below hold for however many there are.
        expect(aliases.length).toBeGreaterThan(0)
        expect(aliases.map(a => `${a.from} as ${a.to}`).sort())
            .toEqual(['COLOR_MODE as CODE_THEME', 'INLINE as COVER_POSITION'])
    })

    it('PINNED — extractFile emits the declaration and ignores the alias', () => {
        for (const alias of aliases) {
            const names = emittedNames(alias.domain)
            expect(names.has(alias.from), `${alias.from} is a real declaration`).toBe(true)
            expect(names.has(alias.to), `${alias.to} is only an ExportDeclaration`).toBe(false)
        }
    })

    it('PINNED — the catalogue nevertheless carries a row for the alias too', () => {
        for (const alias of aliases) {
            const style = SLUG_STYLE[alias.domain]
            const slugs = fixtureSlugs(alias.kind)
            expect(slugs.has(toSlug(alias.from, style)), `${alias.from} row`).toBe(true)
            expect(slugs.has(toSlug(alias.to, style)), `${alias.to} row`).toBe(true)
        }
    })

    it('PINNED — the alias rows are the entire surplus of the enum catalogue', () => {
        // Quantifies the drift: the committed enum catalogue is exactly the set
        // of declarations the extractor emits, plus one row per alias. Nothing
        // else is unaccounted for, in either direction.
        const emitted = new Set<string>()
        for (const file of listSourceFiles('enums')) {
            for (const s of extractFile('enums', file, program, checker)) emitted.add(s.slug)
        }
        const catalogue = fixtureSlugs('enum')
        const aliasSlugs = aliases
            .filter(a => a.domain === 'enums')
            .map(a => toSlug(a.to, SLUG_STYLE.enums))
            .sort()

        expect([...emitted].filter(s => !catalogue.has(s))).toEqual([])
        expect([...catalogue].filter(s => !emitted.has(s)).sort()).toEqual(aliasSlugs)
    })

    it.fails('no declaration is documented under two slugs', () => {
        // `COLOR_MODE` is catalogued as both `color-mode`
        // (packages/ds/src/enums/Commons/theme.enum.ts) and `code-theme`
        // (packages/ds/src/enums/Code/code.enum.ts); `INLINE` as both `inline`
        // and `cover-position`. Two rows, one enum, two source_file values.
        const duplicated = aliases.filter(a => {
            const slugs = fixtureSlugs(a.kind)
            return slugs.has(toSlug(a.from, SLUG_STYLE[a.domain]))
                && slugs.has(toSlug(a.to, SLUG_STYLE[a.domain]))
        })
        expect(duplicated.map(a => `${a.from}/${a.to}`)).toEqual([])
    })
})
