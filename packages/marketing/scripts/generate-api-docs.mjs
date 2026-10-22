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
 *              `src/assets/seed/<kind>.json` fixtures by `--seed`, and NOTHING
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
 *              `enum.` → `enums.` namespace typo. See key-convention.mjs
 *              for the naming convention (audited against the 14 498 keys that
 *              already exist) and key-backfill.ts for the DB orchestration.
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
    listSourceFiles, extractFile, createProgram, repoRoot,
} from './extract.mjs'
import { extractComponents } from './extract-vue.mjs'
import { DOMAINS, TS_DOMAINS } from '../src/consts/doc-extract.const.ts'
import { mergers } from './merge.mjs'
import { serialize } from './serialize.mjs'
import { readExistingDoc } from './read-existing.mjs'
import { mapDoc } from './doc-to-rows.ts'
import { ingestFull, ingestSrc, orphanMissingEntries } from './db-upsert.ts'
import { getDb, closeDb, sourceCommit } from './db.ts'
import { backfillKeys, backfillSvgKeys } from './key-backfill.ts'
import { DOC_KIND_DIRS } from '../src/consts/db.const.ts'
import { DocEntry, DocSyncRun } from '../src/server/db/entities/index.ts'
import { syncFixtures } from '../src/utils/doc-fixture-sync.util.ts'
import { ROLLBACK, RESYNC_POLICY, FILE_DOMAINS } from '../src/consts/doc-sync.const.ts'

const argv = process.argv.slice(2)
const checkFlag = argv.includes('--check')
const verboseFlag = argv.includes('--verbose')
const seedFlag = argv.includes('--seed')
const filesFlag = argv.includes('--files')
const backfillKeysFlag = argv.includes('--backfill-keys')
const newOnlyFlag = argv.includes('--new-only')
const domainArg = (argv.find(a => a.startsWith('--domain=')) || '').split('=')[1]
const limitArg = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0

const mktConsts = path.join(repoRoot, 'packages', 'marketing', 'src', 'consts')
const mktSeed   = path.join(repoRoot, 'packages', 'marketing', 'src', 'assets', 'seed')

const blank = () => ({ created: 0, updated: 0, unchanged: 0, orphaned: 0 })
const add = (a, b) => { a.created += b.created; a.updated += b.updated; a.unchanged += b.unchanged; a.orphaned += b.orphaned }

// ─── DB seed: ingest the existing curated files (all 8 families) ────────────
//
// Strategy:
//   1. If the legacy src/consts/<dir>/ directory exists, read the .const.ts
//      files as before (backward-compatible path, used before ticket F).
//   2. If the directory is gone (ticket F removed it), fall back to the JSON
//      fixture at src/assets/seed/<kind>.json produced by dump-db-fixture.mjs.
//      Restores the full content, including the editorial lock flag.
//
async function runSeed (manager) {
    const total = blank()
    const kinds = domainArg ? [DOMAIN_ARG] : Object.keys(DOC_KIND_DIRS)

    for (const kind of kinds) {
        const dir = DOC_KIND_DIRS[kind]
        if (!dir) { console.error(`Unknown kind: ${kind}`); continue }
        const dirPath = path.join(mktConsts, dir)
        const c = blank()

        if (fs.existsSync(dirPath)) {
            // ── Legacy path: read from .const.ts files (pre-ticket-F) ────────
            let files = fs.readdirSync(dirPath).filter(f => f.endsWith('.const.ts')).sort()
            if (limitArg) files = files.slice(0, limitArg)

            for (const file of files) {
                const existing = await readExistingDoc(path.join(dirPath, file))
                if (!existing?.doc) { console.error(`  ! no _DOC in ${dir}/${file}`); continue }
                const record = mapDoc(kind, existing.doc)
                const r = await ingestFull(manager, record)
                add(c, r); add(total, r)
                if (verboseFlag) console.log(`  ${kind}/${record.entry.slug}: +${r.created} ~${r.updated} =${r.unchanged} ⌀${r.orphaned}`)
            }
            console.log(`[${kind}] files=${files.length} created=${c.created} updated=${c.updated} unchanged=${c.unchanged} orphaned=${c.orphaned}`)
        } else {
            // ── Fixture path: read from src/assets/seed/<kind>.json ─────────
            const fixturePath = path.join(mktSeed, `${kind}.json`)
            if (!fs.existsSync(fixturePath)) {
                console.error(`  ! [${kind}] no const dir and no fixture at ${fixturePath} — skipping`)
                continue
            }
            const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))
            let records = fixture.entries ?? []
            if (limitArg) records = records.slice(0, limitArg)

            // Reuse the shared boot-time sync loop (ingestFull + lock restore) so
            // the runtime bootstrap and this script never drift apart.
            const r = await syncFixtures(manager, records)
            add(c, r); add(total, r)
            console.log(`[${kind}] fixture=${records.length} created=${c.created} updated=${c.updated} unchanged=${c.unchanged} orphaned=${c.orphaned}`)
        }
    }
    return total
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
    const domains = domainArg ? [DOMAIN_ARG] : Object.keys(DOMAINS)

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
        if (limitArg) symbols = symbols.slice(0, limitArg)

        const c = blank()
        for (const src of symbols) {
            // util: extract exposes `returnType`; normalise to the _DOC `returns` shape.
            // A composable already carries a NAMED `returns[]` — leave it alone.
            const doc = kind === 'util' ? { ...src, returns: { type: src.returnType } } : src
            const record = mapDoc(kind, doc)
            const r = await ingestSrc(manager, record, policy)
            add(c, r); add(total, r)
            if (verboseFlag) console.log(`  ${kind}/${record.entry.slug}: +${r.created} ~${r.updated} =${r.unchanged} ⌀${r.orphaned}`)
        }

        // Entries the DS no longer has — soft-flagged, never deleted.
        let deadEntries = 0
        if (policy.orphanEntries && !limitArg) {
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
    const mode = seedFlag ? 'seed' : 'resync'
    let counts = blank()

    try {
        await db.transaction(async (manager) => {
            counts = seedFlag ? await runSeed(manager) : await runResync(manager)
            if (checkFlag) throw new Error(ROLLBACK)
        })
    } catch (e) {
        if (e.message !== ROLLBACK) {
            if (!checkFlag) await recordRun(db, { domain: domainArg, counts, status: 'failed', error: String(e.message) }).catch(() => {})
            throw e
        }
    }

    const drift = counts.created + counts.updated + counts.orphaned
    console.log(
        `\n${checkFlag ? 'CHECK' : mode.toUpperCase()} summary — created: ${counts.created}, ` +
        `updated: ${counts.updated}, unchanged: ${counts.unchanged}, orphaned: ${counts.orphaned}`
    )

    if (!checkFlag) {
        await recordRun(db, { domain: domainArg, counts, status: 'success' })
        await reportKindCounts(db)
    }
    if (checkFlag && drift > 0) {
        console.log('\n--check: the database WOULD change. Run without --check to apply.')
        await closeDb()
        process.exit(1)
    }
    await closeDb()
}

// ─── Legacy file writer (unchanged original behaviour, kept for transition) ──
const norm = (s) => s.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()

async function runFiles () {
    const { program, checker } = createProgram()
    const domains = domainArg ? [DOMAIN_ARG] : FILE_DOMAINS
    for (const d of domains) {
        if (!FILE_DOMAINS.includes(d)) { console.error(`--files does not support domain: ${d}`); process.exit(2) }
    }
    let totalChanged = 0, totalNew = 0, totalSame = 0, totalWritten = 0, totalErrors = 0

    for (const domainKey of domains) {
        if (!DOMAINS[domainKey]) { console.error(`Unknown domain: ${domainKey}`); totalErrors++; continue }
        const files = listSourceFiles(domainKey)
        const targetDir = path.join(mktConsts, domainKey)
        fs.mkdirSync(targetDir, { recursive: true })

        let symbols = []
        for (const f of files) symbols.push(...extractFile(domainKey, f, program, checker))
        const seen = new Set()
        symbols = symbols.filter(s => (seen.has(s.slug) ? false : (seen.add(s.slug), true)))
        if (limitArg) symbols = symbols.slice(0, limitArg)

        let changed = 0, created = 0, same = 0, written = 0
        const merger = mergers[domainKey === 'enums' ? 'enum' : domainKey === 'interfaces' ? 'interface' : domainKey === 'consts' ? 'const' : 'util']
        const kind = DOMAINS[domainKey].kind

        for (const src of symbols) {
            const target = path.join(targetDir, `${src.slug}.const.ts`)
            const exists = fs.existsSync(target)
            if (newOnlyFlag && exists) continue

            let existing = null
            if (exists) {
                try { existing = await readExistingDoc(target) }
                catch (e) { console.error(`  ! failed to read existing ${src.slug}: ${e.message}`); totalErrors++ }
            }

            const merged = merger(src, existing)
            const output = serialize(kind, merged)
            const current = exists ? fs.readFileSync(target, 'utf-8') : null
            const isSame = current !== null && norm(current) === norm(output)

            if (!exists) { created++; if (!checkFlag) { fs.writeFileSync(target, output); written++ } }
            else if (!isSame) { changed++; if (!checkFlag) { fs.writeFileSync(target, output); written++ } }
            else { same++ }
        }

        console.log(`[${domainKey}] symbols=${symbols.length} new=${created} changed=${changed} unchanged=${same}` + (checkFlag ? '' : ` written=${written}`))
        totalChanged += changed; totalNew += created; totalSame += same; totalWritten += written
    }

    console.log(`\n${checkFlag ? 'CHECK' : 'WRITE'} summary — new: ${totalNew}, changed: ${totalChanged}, unchanged: ${totalSame}` + (checkFlag ? '' : `, written: ${totalWritten}`) + (totalErrors ? `, errors: ${totalErrors}` : ''))
    if (checkFlag && (totalNew + totalChanged) > 0) { console.log('\n--check: files WOULD change.'); process.exit(1) }
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
            if (checkFlag) throw new Error(ROLLBACK)
        })
    } catch (e) {
        if (e.message !== ROLLBACK) throw e
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0) + svgCount
    console.log(`\n${checkFlag ? 'CHECK' : 'BACKFILL'} summary`)
    console.log(`  doc_entry.description_key : ${counts.entryDescription}`)
    console.log(`  doc_entry.note_key        : ${counts.entryNote}`)
    console.log(`  doc_prop.description_key  : ${counts.props}`)
    console.log(`  doc_param.description_key : ${counts.params}`)
    console.log(`  doc_return.description_key: ${counts.returns}`)
    console.log(`  doc_example.title_key     : ${counts.examples}`)
    console.log(`  enum. -> enums. namespace : ${counts.enumNamespace}`)
    console.log(`  doc_entry.svg_*_key       : ${svgCount}`)
    console.log(`  TOTAL                     : ${total}`)

    if (checkFlag && total > 0) {
        console.log('\n--check: the database WOULD change. Run without --check to apply.')
        await closeDb()
        process.exit(1)
    }
    await closeDb()
}

async function run () {
    if (filesFlag) return runFiles()
    if (backfillKeysFlag) return runBackfillKeys()
    return runDb()
}

run().catch(async (e) => { console.error(e); await closeDb().catch(() => {}); process.exit(2) })
