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
    DOMAINS, SLUG_STYLE, TS_DOMAINS, createProgram, extractFile, listSourceFiles, toSlug,
} from '../../../marketing/scripts/lib/extract.mjs'
import { extractComponents } from '../../../marketing/scripts/lib/extract-vue.mjs'
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
    // TS_DOMAINS, not every domain: `components` holds `.vue` files, which have
    // no `export { X as Y }` to find and which `extractFile` does not read.
    for (const domain of TS_DOMAINS) {
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

describe('DOMAINS — the eight families, all extracted', () => {
    it('every DOC_KINDS family is refreshed from the design-system source', () => {
        // Was `it.fails` while four of the eight had no extractor at all: a
        // `source_file` on a component / composable / directive / type row was
        // frozen at whatever the fixture carried, and no run of `docs:sync`
        // could correct it. The four were added; this is now the behaviour.
        expect(EXTRACTED_KINDS).toEqual([...DOC_KINDS].sort())
        expect(FIXTURE_ONLY_KINDS).toEqual([])
    })

    it('PINNED — one domain per family, and only `components` reads .vue', () => {
        expect(Object.keys(DOMAINS)).toEqual([
            'enums', 'interfaces', 'consts', 'utils',
            'composables', 'types', 'directives', 'components',
        ])
        expect(Object.keys(DOMAINS).filter(k => DOMAINS[k].vue)).toEqual(['components'])
        expect(TS_DOMAINS).not.toContain('components')
    })

    it('every family the catalogue documents is also reachable from the source', () => {
        for (const kind of DOC_KINDS) {
            expect(fixtureSlugs(kind).size, `${kind}.json is populated`).toBeGreaterThan(0)
        }
    })
})

/*
 * The four families added to the re-sync, each pinned by the trap that its
 * extraction had to survive. Every number below was measured against the
 * committed fixtures, which is what CI loads before syncing.
 */
describe('component — the living `.vue` API', () => {
    const { program, checker } = createProgram()
    const live = extractComponents(program, checker)
    const liveSlugs = new Set(live.map(c => c.slug))
    const catalogue = fixtureSlugs('component')

    it('no macro names an interface the resolver cannot find', () => {
        // A silent resolution failure looks exactly like a component with no
        // props — the one failure mode a catalogue must never render as clean.
        expect(live.flatMap(c => c.unresolved.map(u => `${c.slug}: ${u}`))).toEqual([])
    })

    it('the five entries deleted from the design system are no longer live', () => {
        // `grids`, `item`, `media`, `rich-toolbar` and `slide` are catalogued
        // and gone. They are what `orphanEntries` flags on a re-sync.
        const ghosts = [...catalogue].filter(s => !liveSlugs.has(s)).sort()
        expect(ghosts).toEqual(['grids', 'item', 'media', 'rich-toolbar', 'slide'])
    })

    it('the catalogue is missing components the design system ships', () => {
        // The gap this extractor exists to close. Asserted as "non-empty" and
        // spot-checked, not pinned to a count: the design system keeps growing,
        // and a test that fails on every new component teaches nothing.
        const missing = [...liveSlugs].filter(s => !catalogue.has(s))
        expect(missing.length).toBeGreaterThan(0)
        expect(missing).toEqual(expect.arrayContaining([
            'chart-radar', 'chart-sankey', 'chart-treemap', 'list-children',
        ]))
    })

    it('POSITIVE CONTROL — a known prop, emit and slot are actually found', () => {
        // A silent scan and a clean catalogue are indistinguishable from the
        // outside. This asserts the extractor CAN see, before any absence it
        // reports is believed.
        const img = live.find(c => c.slug === 'img')!
        expect(img.props.map(p => p.name)).toEqual(expect.arrayContaining(['src', 'alt', 'cover']))
        // The label is what the AUTHOR wrote, not the checker's expansion —
        // `string | ISrcObject`, the union named in `IImgProps`.
        expect(img.props.find(p => p.name === 'src')?.type.label).toBe('string | ISrcObject')
        expect(img.emits.map(e => e.event).sort()).toEqual(['error', 'load', 'loadstart'])
        expect(img.slots.map(s => s.slot).sort()).toEqual(['default', 'error', 'placeholder'])
    })

    it('an inherited prop survives the `Omit<>` / `Pick<>` chain', () => {
        // Ticket #700: a resolver that does not traverse utility types reports
        // an inherited prop as undeclared. `ICarouselItemProps` reaches `src`
        // and `cover` through `IImgProps`, five interfaces away.
        const item = live.find(c => c.slug === 'carousel-item')!
        expect(item.props.map(p => p.name)).toEqual(expect.arrayContaining(['src', 'cover', 'rounded']))
    })

    it('`inline` is gone from Responsive, Img and CarouselItem', () => {
        // Removed from `IResponsiveProps` in 2.17.0 — it reached `IImgProps`
        // and `ICarouselItemProps` through it. The three must not declare it.
        for (const slug of ['responsive', 'img', 'carousel-item']) {
            const cmp = live.find(c => c.slug === slug)!
            expect(cmp.props.map(p => p.name), `${slug}.inline`).not.toContain('inline')
        }
    })

    it('`inline` is still declared where the design system still declares it', () => {
        // The other half of the same assertion: the prop was removed from ONE
        // interface, not from the design system. A re-sync that dropped these
        // would be destroying live API, not cleaning stale rows.
        for (const slug of ['badge', 'grid', 'field', 'selection-control']) {
            const cmp = live.find(c => c.slug === slug)!
            expect(cmp.props.map(p => p.name), `${slug}.inline`).toContain('inline')
        }
    })
})

describe('directive / composable / type — the three identity conventions', () => {
    const { program, checker } = createProgram()
    const extract = (domain: string) => {
        const out: Array<{ slug: string, name: string, values?: Array<{ value: string }> }> = []
        for (const f of listSourceFiles(domain)) out.push(...extractFile(domain, f, program, checker))
        return out
    }

    it('directive — identity comes from the directory, so `v-contrast` is found', () => {
        // `Contrast` is the only directive with no named export: it declares
        // `const vContrast` and leaves through `export default`. A scan keyed on
        // named exports finds five of six and flags the live `v-contrast` dead.
        const slugs = extract('directives').map(d => d.slug).sort()
        expect(slugs).toEqual(['click-outside', 'contrast', 'hover', 'intersect', 'ripple', 'touch'])
        expect(extract('directives').find(d => d.slug === 'contrast')?.name).toBe('v-contrast')
        expect(slugs).toEqual([...fixtureSlugs('directive')].sort())
    })

    it('composable — the slug comes from the FILE, the name from the function', () => {
        // `aspect.composable.ts` exports `useAspectRatio` and is catalogued
        // `use-aspect`; `filters.composable.ts` exports `useFilter` and is
        // catalogued `use-filters`. Indexing by function name declared eleven
        // live composables dead.
        const live = extract('composables')
        const aspect = live.find(c => c.slug === 'use-aspect')
        expect(aspect?.name).toBe('useAspectRatio')
        expect(live.find(c => c.slug === 'use-filters')?.name).toBe('useFilter')
        expect(fixtureSlugs('composable').has('use-aspect')).toBe(true)
    })

    it('composable — helper and test-only exports stay out of the catalogue', () => {
        // `composables/` also exports `createDate`, `provideDefaults`,
        // `_resetCssSupportCache`, `resetCodeHighlighterForTesting`… Announcing
        // a test hook as public API is the failure mode here.
        for (const c of extract('composables')) expect(c.name).toMatch(/^use[A-Z]/)
    })

    it('type — values are the checker expansion, not the terms the author typed', () => {
        // `TAlways = boolean | 'always'` is catalogued as true / false / always.
        // Reading the syntax tree gives `boolean` and `'always'`, which matches
        // 18 of the 327 curated value rows instead of 305.
        const always = extract('types').find(t => t.slug === 'always')
        expect(always?.values?.map(v => v.value).sort()).toEqual(['always', 'false', 'true'])
    })

    it('type — a template literal over an enum expands to the enum values', () => {
        const loop = extract('types').find(t => t.slug === 'audio-loop-mode')
        expect(loop?.values?.map(v => v.value).sort()).toEqual(['all', 'none', 'one'])
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
