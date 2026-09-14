#!/usr/bin/env node
/**
 * generate-api-docs.mjs — keep the marketing API-Reference doc in sync with the
 * design-system source. (ADR 0001 — ticket B.)
 *
 * Its write target was REORIENTED from per-slug `.const.ts` files to the
 * PostgreSQL doc store. Three pipelines share the same libs (extract / merge /
 * read-existing) — no logic is duplicated:
 *
 *   --seed     First load. Reads the 1758 existing src/consts/**.const.ts `_DOC`
 *              objects (curated prose, all 8 families) and UPSERTs them into the
 *              DB without loss. Idempotent; respects the editorial lock.
 *
 *   (default)  Re-sync. Re-extracts STRUCTURAL facts from packages/ds/src for
 *              ALL 8 families and UPSERTs ONLY the [SRC] columns each family can
 *              honestly derive (RESYNC_POLICY below). Editorial fields are never
 *              touched.
 *
 *              Four of the eight — component, composable, directive, type — had
 *              no extractor at all until then: they were loaded once from the
 *              `server/db/seed/<kind>.json` fixtures by `--seed`, and NOTHING
 *              refreshed them afterwards. At the time this was fixed the
 *              catalogue announced 193 components against 218 in the design
 *              system, and still listed five deleted ones (`grids`, `item`,
 *              `media`, `rich-toolbar`, `slide`).
 *
 *   --files    Legacy file writer (the original behaviour, unchanged). Kept until
 *              the pages are rebranched on the API and the const files are removed
 *              (ticket F). Lets the transition stay non-destructive.
 *
 *   --backfill-keys
 *              ADR 325 (task 1). Generates a deterministic i18n key for every
 *              row that has real curated `*_fallback` prose but an EMPTY
 *              `*_key` (3 763 rows: doc_entry, doc_prop, doc_param, doc_return,
 *              doc_example), backfills the two new `svg_title_key`/`svg_desc_key`
 *              columns from the component anatomy diagrams, and fixes the
 *              `enum.` → `enums.` namespace typo. See lib/key-convention.mjs
 *              for the naming convention (audited against the 14 498 keys that
 *              already exist) and lib/key-backfill.ts for the DB orchestration.
 *
 * Every DB run is wrapped in a single transaction and recorded in doc_sync_run.
 * `--check` is a dry-run drift gate (rolls back, exits 1 if anything would change).
 *
 * USAGE
 *   node scripts/generate-api-docs.mjs --seed [--check] [--domain=<kind>] [--verbose]
 *   node scripts/generate-api-docs.mjs        [--check] [--domain=<dir>]  [--verbose]
 *   node scripts/generate-api-docs.mjs --files [--check] [--domain=<dir>] [--limit=N]
 *   node scripts/generate-api-docs.mjs --backfill-keys [--check]
 *
 * VERACITY
 *   No prose is invented. [ÉDIT] content always comes from the curated files
 *   (seed) or is left as-is in the DB (re-sync). [SRC] always comes from the DS.
 *   `--backfill-keys` never touches a `*_fallback` value — it only generates
 *   the missing `*_key` from structural facts already on the row.
 */

import fs from 'node:fs'
import path from 'node:path'

import {
    DOMAINS, TS_DOMAINS, listSourceFiles, extractFile, createProgram, REPO_ROOT,
} from './lib/extract.mjs'
import { extractComponents } from './lib/extract-vue.mjs'
import { MERGERS } from './lib/merge.mjs'
import { serialize } from './lib/serialize.mjs'
import { readExistingDoc } from './lib/read-existing.mjs'
import { mapDoc } from './lib/doc-to-rows.ts'
import { ingestFull, ingestSrc, orphanMissingEntries } from './lib/db-upsert.ts'
import { getDb, closeDb, sourceCommit } from './lib/db.ts'
import { backfillKeys, backfillSvgKeys } from './lib/key-backfill.ts'
import { DOC_KIND_DIRS } from '../server/db/db.const.mjs'
import { DocEntry, DocSyncRun } from '../server/db/entities/index.ts'
import { syncFixtures } from '../server/utils/doc-fixture-sync.ts'

const ARGS = process.argv.slice(2)
const CHECK = ARGS.includes('--check')
const VERBOSE = ARGS.includes('--verbose')
const SEED = ARGS.includes('--seed')
const FILES = ARGS.includes('--files')
const BACKFILL_KEYS = ARGS.includes('--backfill-keys')
const NEW_ONLY = ARGS.includes('--new-only')
const DOMAIN_ARG = (ARGS.find(a => a.startsWith('--domain=')) || '').split('=')[1]
const LIMIT = Number((ARGS.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0

const MKT_CONSTS = path.join(REPO_ROOT, 'packages', 'marketing', 'src', 'consts')
const MKT_SEED   = path.join(REPO_ROOT, 'packages', 'marketing', 'server', 'db', 'seed')
const ROLLBACK = '__ROLLBACK_CHECK__'

const blank = () => ({ created: 0, updated: 0, unchanged: 0, orphaned: 0 })
const add = (a, b) => { a.created += b.created; a.updated += b.updated; a.unchanged += b.unchanged; a.orphaned += b.orphaned }

// ─── DB seed: ingest the existing curated files (all 8 families) ────────────
//
// Strategy:
//   1. If the legacy src/consts/<dir>/ directory exists, read the .const.ts
//      files as before (backward-compatible path, used before ticket F).
//   2. If the directory is gone (ticket F removed it), fall back to the JSON
//      fixture at server/db/seed/<kind>.json produced by dump-db-fixture.mjs.
//      Restores the full content, including the editorial lock flag.
//
async function runSeed (manager) {
    const total = blank()
    const kinds = DOMAIN_ARG ? [DOMAIN_ARG] : Object.keys(DOC_KIND_DIRS)

    for (const kind of kinds) {
        const dir = DOC_KIND_DIRS[kind]
        if (!dir) { console.error(`Unknown kind: ${kind}`); continue }
        const dirPath = path.join(MKT_CONSTS, dir)
        const c = blank()

        if (fs.existsSync(dirPath)) {
            // ── Legacy path: read from .const.ts files (pre-ticket-F) ────────
            let files = fs.readdirSync(dirPath).filter(f => f.endsWith('.const.ts')).sort()
            if (LIMIT) files = files.slice(0, LIMIT)

            for (const file of files) {
                const existing = await readExistingDoc(path.join(dirPath, file))
                if (!existing?.doc) { console.error(`  ! no _DOC in ${dir}/${file}`); continue }
                const record = mapDoc(kind, existing.doc)
                const r = await ingestFull(manager, record)
                add(c, r); add(total, r)
                if (VERBOSE) console.log(`  ${kind}/${record.entry.slug}: +${r.created} ~${r.updated} =${r.unchanged} ⌀${r.orphaned}`)
            }
            console.log(`[${kind}] files=${files.length} created=${c.created} updated=${c.updated} unchanged=${c.unchanged} orphaned=${c.orphaned}`)
        } else {
            // ── Fixture path: read from server/db/seed/<kind>.json ─────────
            const fixturePath = path.join(MKT_SEED, `${kind}.json`)
            if (!fs.existsSync(fixturePath)) {
                console.error(`  ! [${kind}] no const dir and no fixture at ${fixturePath} — skipping`)
                continue
            }
            const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
            let records = fixture.entries ?? []
            if (LIMIT) records = records.slice(0, LIMIT)

            // Reuse the shared boot-time sync loop (ingestFull + lock restore) so
            // the runtime bootstrap and this script never drift apart.
            const r = await syncFixtures(manager, records)
            add(c, r); add(total, r)
            console.log(`[${kind}] fixture=${records.length} created=${c.created} updated=${c.updated} unchanged=${c.unchanged} orphaned=${c.orphaned}`)
        }
    }
    return total
}

/*
 * ─── What each family's re-sync is allowed to claim ──────────────────────────
 *
 * A re-sync writes [SRC] columns. But "[SRC]" was calibrated on the four
 * families that were auto-derivable from day one; it does not hold column for
 * column on the four added here, and applying it blindly DESTROYS curated
 * content. Three cases, all measured against the catalogue:
 *
 *   • `doc_entry.signature` is [SRC], and for a DIRECTIVE it holds hand-written
 *     usage forms (`v-ripple.center`, `v-hover.callback="fn"`) that no
 *     declaration contains. A derived signature would overwrite all six.
 *   • `doc_entry.definition` is [SRC], and for a TYPE it is often the source
 *     line PLUS a hand-added expansion of the enum it interpolates
 *     (`TAudioLoopMode` carries the whole `AUDIO_LOOP_MODE` body). Re-deriving
 *     it strips that.
 *   • `doc_entry.parent_slug` is [SRC], and for a COMPONENT it is an editorial
 *     family grouping: it disagrees with the directory on 3 of the 188 live
 *     curated components (see `parentSlugOf` in extract-vue.mjs).
 *
 * So each family declares the columns and collections it can honestly derive.
 * Anything omitted is left exactly as the catalogue has it.
 *
 * `orphanEntries` is only set for families whose extractor enumerates the WHOLE
 * family from the filesystem, so "not seen" really does mean "deleted".
 */
const RESYNC_POLICY = {
    // ── the four historical families: behaviour unchanged (defaults) ─────────
    enums: {},
    interfaces: {},
    consts: {},
    utils: {},

    // ── the four added here ──────────────────────────────────────────────────
    components: {
        entryCols: ['name', 'tag', 'source_file'],
        collections: ['props', 'emits', 'slots'],
        relations: false,
        orphanEntries: true,
    },
    /*
     * ⛔ `returns` is deliberately NOT claimed here, on measurement.
     *
     * A composable's curated `returns[]` lists what a consumer destructures.
     * The checker's properties-of-the-return-type is a DIFFERENT question, and
     * on the composables that hand back a foreign object the two diverge hard:
     * `useRouter` came out at 20 created / 10 orphaned (the members of vue-router's
     * `Router`, not the composable's own surface), `useDate` at 43 created,
     * `useInstalledThemes` at 35. Measured on the family: claiming `returns`
     * gives 804 created / 83 orphaned; leaving it alone gives 221 / 35.
     *
     * Claiming a column means being right about it. `params` is read from the
     * declaration and matches the curated rows; `returns` needs a model of what
     * the composable EXPOSES, which this extractor does not have. Left curated.
     *
     * The 35 parameter rows that still orphan are real disagreements between
     * the declaration and the hand-written doc, not extraction failures:
     * `useRouter`, `useHeaders` and `usePagination` take NO parameter at all
     * yet carry 4 curated rows each; `useGoTo` documents `options.duration`,
     * `options.easing`, … as separate rows under a single `_options` parameter.
     * They are soft-flagged, never deleted.
     */
    composables: {
        entryCols: ['name', 'source_file'],
        collections: ['params'],
        relations: false,
        orphanEntries: false,
    },
    directives: {
        entryCols: ['name', 'source_file'],
        collections: [],
        relations: false,
        orphanEntries: true,
    },
    types: {
        entryCols: ['name', 'source_file'],
        collections: ['values'],
        relations: false,
        orphanEntries: true,
    },
}

/** Symbols of one domain, in the `_DOC` shape `mapDoc` consumes. */
function extractDomain (domainKey, program, checker) {
    const domain = DOMAINS[domainKey]

    if (domain.vue) {
        const cmps = extractComponents(program, checker)
        for (const c of cmps) {
            if (c.unresolved.length) {
                console.error(`  ! [components] ${c.slug}: unresolved ${c.unresolved.join(', ')}`)
            }
        }
        return cmps
    }

    const out = []
    for (const f of listSourceFiles(domainKey)) out.push(...extractFile(domainKey, f, program, checker))
    return out
}

// ─── DB re-sync: structural [SRC] facts from the DS source (8 families) ──────
async function runResync (manager) {
    const total = blank()
    const { program, checker } = createProgram()
    const domains = DOMAIN_ARG ? [DOMAIN_ARG] : Object.keys(DOMAINS)

    for (const domainKey of domains) {
        if (!DOMAINS[domainKey]) { console.error(`Unknown domain: ${domainKey}`); continue }
        const kind = DOMAINS[domainKey].kind
        const policy = RESYNC_POLICY[domainKey] ?? {}
        let symbols = extractDomain(domainKey, program, checker)

        /*
         * Two symbols that slug the same collapse into one catalogue entry, and
         * the loser is dropped in SILENCE — which is how a dead entry and a
         * shadowed one look identical from the outside. The de-duplication is
         * unchanged (first wins, source order); it now says so.
         *
         * Known and pre-existing in the composable family, where the slug comes
         * from the file name: `Commons/group.composable.ts` and
         * `DataTable/group.composable.ts` both claim `use-group`, likewise
         * `items`. The catalogue documents the `Commons/` one in both cases, and
         * `Commons` sorts first, so the winner is the documented one.
         */
        const seen = new Set()
        symbols = symbols.filter(s => {
            if (!seen.has(s.slug)) { seen.add(s.slug); return true }
            console.error(`  ! [${domainKey}] slug collision on '${s.slug}' — '${s.name}' shadowed`)
            return false
        })
        if (LIMIT) symbols = symbols.slice(0, LIMIT)

        const c = blank()
        for (const src of symbols) {
            // util: extract exposes `returnType`; normalise to the _DOC `returns` shape.
            // A composable already carries a NAMED `returns[]` — leave it alone.
            const doc = kind === 'util' ? { ...src, returns: { type: src.returnType } } : src
            const record = mapDoc(kind, doc)
            const r = await ingestSrc(manager, record, policy)
            add(c, r); add(total, r)
            if (VERBOSE) console.log(`  ${kind}/${record.entry.slug}: +${r.created} ~${r.updated} =${r.unchanged} ⌀${r.orphaned}`)
        }

        // Entries the DS no longer has — soft-flagged, never deleted.
        let deadEntries = 0
        if (policy.orphanEntries && !LIMIT) {
            deadEntries = await orphanMissingEntries(manager, kind, seen)
            c.orphaned += deadEntries; total.orphaned += deadEntries
        }

        console.log(
            `[${domainKey}] symbols=${symbols.length} created=${c.created} updated=${c.updated} ` +
            `unchanged=${c.unchanged} orphaned=${c.orphaned}` +
            (policy.orphanEntries ? ` (dead entries: ${deadEntries})` : '')
        )
    }
    return total
}

async function recordRun (db, { domain, counts, status, error }) {
    await db.getRepository(DocSyncRun).insert({
        finished_at: new Date(),
        domain: domain ?? null,
        created_count: counts.created,
        updated_count: counts.updated,
        unchanged_count: counts.unchanged,
        orphaned_count: counts.orphaned,
        source_commit: sourceCommit(),
        status,
        error: error ?? null,
    })
}

async function reportKindCounts (db) {
    const rows = await db.getRepository(DocEntry)
        .createQueryBuilder('e')
        .select('e.kind', 'kind').addSelect('COUNT(*)', 'n')
        .groupBy('e.kind').orderBy('e.kind')
        .getRawMany()
    console.log('\ndoc_entry by kind:')
    let total = 0
    for (const r of rows) { console.log(`  ${r.kind.padEnd(12)} ${r.n}`); total += Number(r.n) }
    console.log(`  ${'TOTAL'.padEnd(12)} ${total}`)
}

async function runDb () {
    const db = await getDb()
    const mode = SEED ? 'seed' : 'resync'
    let counts = blank()

    try {
        await db.transaction(async (manager) => {
            counts = SEED ? await runSeed(manager) : await runResync(manager)
            if (CHECK) throw new Error(ROLLBACK)
        })
    } catch (e) {
        if (e.message !== ROLLBACK) {
            if (!CHECK) await recordRun(db, { domain: DOMAIN_ARG, counts, status: 'failed', error: String(e.message) }).catch(() => {})
            throw e
        }
    }

    const drift = counts.created + counts.updated + counts.orphaned
    console.log(
        `\n${CHECK ? 'CHECK' : mode.toUpperCase()} summary — created: ${counts.created}, ` +
        `updated: ${counts.updated}, unchanged: ${counts.unchanged}, orphaned: ${counts.orphaned}`
    )

    if (!CHECK) {
        await recordRun(db, { domain: DOMAIN_ARG, counts, status: 'success' })
        await reportKindCounts(db)
    }
    if (CHECK && drift > 0) {
        console.log('\n--check: the database WOULD change. Run without --check to apply.')
        await closeDb()
        process.exit(1)
    }
    await closeDb()
}

// ─── Legacy file writer (unchanged original behaviour, kept for transition) ──
const norm = (s) => s.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()

/**
 * The legacy file writer only ever knew the four original families — it has a
 * `MERGERS` entry and a `serialize` shape for each of them and for nothing
 * else. It is frozen on that set: the four families added to `DOMAINS` for the
 * DB re-sync are deliberately out of its reach, not silently half-supported.
 */
const FILE_DOMAINS = ['enums', 'interfaces', 'consts', 'utils']

async function runFiles () {
    const { program, checker } = createProgram()
    const domains = DOMAIN_ARG ? [DOMAIN_ARG] : FILE_DOMAINS
    for (const d of domains) {
        if (!FILE_DOMAINS.includes(d)) { console.error(`--files does not support domain: ${d}`); process.exit(2) }
    }
    let totalChanged = 0, totalNew = 0, totalSame = 0, totalWritten = 0, totalErrors = 0

    for (const domainKey of domains) {
        if (!DOMAINS[domainKey]) { console.error(`Unknown domain: ${domainKey}`); totalErrors++; continue }
        const files = listSourceFiles(domainKey)
        const targetDir = path.join(MKT_CONSTS, domainKey)
        fs.mkdirSync(targetDir, { recursive: true })

        let symbols = []
        for (const f of files) symbols.push(...extractFile(domainKey, f, program, checker))
        const seen = new Set()
        symbols = symbols.filter(s => (seen.has(s.slug) ? false : (seen.add(s.slug), true)))
        if (LIMIT) symbols = symbols.slice(0, LIMIT)

        let changed = 0, created = 0, same = 0, written = 0
        const merger = MERGERS[domainKey === 'enums' ? 'enum' : domainKey === 'interfaces' ? 'interface' : domainKey === 'consts' ? 'const' : 'util']
        const kind = DOMAINS[domainKey].kind

        for (const src of symbols) {
            const target = path.join(targetDir, `${src.slug}.const.ts`)
            const exists = fs.existsSync(target)
            if (NEW_ONLY && exists) continue

            let existing = null
            if (exists) {
                try { existing = await readExistingDoc(target) }
                catch (e) { console.error(`  ! failed to read existing ${src.slug}: ${e.message}`); totalErrors++ }
            }

            const merged = merger(src, existing)
            const output = serialize(kind, merged)
            const current = exists ? fs.readFileSync(target, 'utf-8') : null
            const isSame = current !== null && norm(current) === norm(output)

            if (!exists) { created++; if (!CHECK) { fs.writeFileSync(target, output); written++ } }
            else if (!isSame) { changed++; if (!CHECK) { fs.writeFileSync(target, output); written++ } }
            else { same++ }
        }

        console.log(`[${domainKey}] symbols=${symbols.length} new=${created} changed=${changed} unchanged=${same}` + (CHECK ? '' : ` written=${written}`))
        totalChanged += changed; totalNew += created; totalSame += same; totalWritten += written
    }

    console.log(`\n${CHECK ? 'CHECK' : 'WRITE'} summary — new: ${totalNew}, changed: ${totalChanged}, unchanged: ${totalSame}` + (CHECK ? '' : `, written: ${totalWritten}`) + (totalErrors ? `, errors: ${totalErrors}` : ''))
    if (CHECK && (totalNew + totalChanged) > 0) { console.log('\n--check: files WOULD change.'); process.exit(1) }
    if (totalErrors) process.exit(2)
}

// ─── Key backfill (ADR 325, task 1) ──────────────────────────────────────────
async function runBackfillKeys () {
    const db = await getDb()
    let counts = null
    let svgCount = 0

    try {
        await db.transaction(async (manager) => {
            counts = await backfillKeys(manager)
            svgCount = await backfillSvgKeys(manager)
            if (CHECK) throw new Error(ROLLBACK)
        })
    } catch (e) {
        if (e.message !== ROLLBACK) throw e
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0) + svgCount
    console.log(`\n${CHECK ? 'CHECK' : 'BACKFILL'} summary`)
    console.log(`  doc_entry.description_key : ${counts.entryDescription}`)
    console.log(`  doc_entry.note_key        : ${counts.entryNote}`)
    console.log(`  doc_prop.description_key  : ${counts.props}`)
    console.log(`  doc_param.description_key : ${counts.params}`)
    console.log(`  doc_return.description_key: ${counts.returns}`)
    console.log(`  doc_example.title_key     : ${counts.examples}`)
    console.log(`  enum. -> enums. namespace : ${counts.enumNamespace}`)
    console.log(`  doc_entry.svg_*_key       : ${svgCount}`)
    console.log(`  TOTAL                     : ${total}`)

    if (CHECK && total > 0) {
        console.log('\n--check: the database WOULD change. Run without --check to apply.')
        await closeDb()
        process.exit(1)
    }
    await closeDb()
}

async function run () {
    if (FILES) return runFiles()
    if (BACKFILL_KEYS) return runBackfillKeys()
    return runDb()
}

run().catch(async (e) => { console.error(e); await closeDb().catch(() => {}); process.exit(2) })
