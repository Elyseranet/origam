#!/usr/bin/env node
/*********************************************************
 * sync-token-excerpts.mjs — re-derive the catalogue's token excerpts from the
 * hand-maintained stylesheets (#960).
 *
 * @description
 * Each component entry in `server/db/seed/component.json` can carry a
 * `kind_extra.tokens` block, and the component detail page renders it: a
 * "Source" row, then one row per excerpt line with a COPY BUTTON on the
 * `tokenPath`. The block was authored against the Style Dictionary v4 +
 * Tokens Studio pipeline, which was removed on 2026-08-31 together with its
 * `packages/ds/tokens/` DTCG sources and the Figma sync plugin.
 *
 * @description
 * So the page hands the visitor `alert.background-color` to copy, under a
 * legend that promises `--origam-<component>---<property>`, next to a value
 * of `{color.surface.disabled}` in a reference syntax nothing resolves any
 * more. Every one of the three is a name that exists nowhere in the repo.
 *
 * @description
 * This script rewrites each line against `lib/token-sheet.mjs`: `tokenPath`
 * becomes the variable the sheets really declare, `value` the value they
 * really give it. `type`, `descriptionKey` and `descriptionFallback` are
 * CURATED PROSE and are carried over untouched — re-deriving the machine
 * facts must not cost the editorial ones.
 *
 * @description
 * It also strips `DROPPED_FIELDS` (`pipelineNote`), which described the
 * removed pipeline and had nothing true left to say.
 *
 * @description
 * ⛔ A line whose token does not exist is DROPPED, never repaired by
 * approximation. Pointing it at a neighbouring token would replace a name
 * that resolves to nothing with a name that resolves to the wrong thing —
 * worse, because the second one looks right. The dropped lines are listed on
 * stdout so the enrichment lot knows what is missing.
 *
 * @description
 * WHY THIS IS A SCRIPT AND NOT A HAND EDIT. `kind_extra` is not in the
 * `components` re-sync policy (`generate-api-docs.mjs`, `RESYNC_POLICY`), so
 * no generator re-emits it and the committed JSON is the source of truth. But
 * `docs-fixtures.yml` round-trips that JSON through Postgres on every
 * `packages/ds/**` change, and a hand edit leaves nothing behind that a
 * future regeneration can reapply. Wired into the workflow, this script
 * re-derives from the sheets each time, so the correction survives.
 *
 * Usage : node packages/marketing/scripts/sync-token-excerpts.mjs [--check]
 ********************************************************/

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadDeclared, resolveTokenPath } from './lib/token-sheet.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const SEED = resolve(REPO, 'packages/marketing/server/db/seed/component.json')
const CHECK = process.argv.slice(2).includes('--check')

/*********************************************************
 * NO_TOKEN_SHEET
 *
 * @description
 * Replaces the one `sourceFile` sentinel that still spells out a path under
 * `packages/ds/tokens/` — a directory removed with the pipeline. Guard 10
 * lets it through because it contains a parenthesis and so fails its
 * path-shaped test, which is why it survived the earlier passes.
 *
 * @description
 * The sentinel's job is to tell the page there is nothing to link to. It does
 * that job without naming a directory that no longer exists.
 ********************************************************/
const NO_TOKEN_SHEET = '(no dedicated token sheet)'

/*********************************************************
 * DROPPED_FIELDS
 *
 * @description
 * Keys stripped from every `tokens` block because nothing true is left for
 * them to say. `pipelineNote` described the Style Dictionary v4 /
 * Tokens Studio build on 125 of 129 components; that pipeline was deleted on
 * 2026-08-31, its render was masked by the owner on 2026-09-25, and the markup
 * went with the page refactor in `a81d2f342`.
 *
 * @description
 * Removed rather than rewritten, decided under #960: the section's legend
 * already tells every visitor these are hand-maintained sheets with no build
 * step, so a per-component note would repeat it 129 times, and restoring a row
 * the owner had removed is not this lot's call.
 *
 * @description
 * Stripping here rather than in a one-off edit is what keeps it gone — this
 * script runs in `docs-fixtures.yml`, so a fixture regenerated from an older
 * database drops the field again instead of resurrecting it.
 ********************************************************/
const DROPPED_FIELDS = ['pipelineNote']

/*********************************************************
 * rederive
 *
 * @description
 * Rewrites one `kind_extra.tokens` block. Returns the new block (or `null`
 * when nothing true is left to show) plus the lines that had to be dropped.
 *
 * @description
 * A block whose excerpt empties out returns `null` so the caller can delete
 * the whole key. The page gates its Design-tokens section on the PRESENCE of
 * `tokens`, not on the excerpt having rows, so leaving an empty block behind
 * renders a heading, a source path and an empty table — a section that says
 * nothing, which is what two entries already do today.
 ********************************************************/
function rederive (declared, slug, tokens) {
    const kept = []
    const dropped = []

    for (const line of (tokens.excerpt ?? [])) {
        const r = resolveTokenPath(declared, line.tokenPath, slug)
        if (r.status !== 'ok') {
            dropped.push({ slug, tokenPath: line.tokenPath, reason: r.status })
            continue
        }
        kept.push({ ...line, value: r.value, tokenPath: r.name })
    }

    if (kept.length === 0) return { block: null, dropped }

    const sourceFile = String(tokens.sourceFile ?? '').startsWith('packages/ds/tokens/')
        ? NO_TOKEN_SHEET
        : tokens.sourceFile

    const block = { ...tokens, excerpt: kept, sourceFile }
    for (const field of DROPPED_FIELDS) delete block[field]

    return { block, dropped }
}

const declared = loadDeclared()
const raw = readFileSync(SEED, 'utf8')
const seed = JSON.parse(raw)

const allDropped = []
let blocksBefore = 0
let blocksRemoved = 0
let linesBefore = 0
let linesAfter = 0
let fieldsStripped = 0

for (const record of seed.entries) {
    const tokens = record.entry?.kind_extra?.tokens
    if (!tokens) continue

    blocksBefore++
    linesBefore += (tokens.excerpt ?? []).length
    fieldsStripped += DROPPED_FIELDS.filter(f => f in tokens).length

    const { block, dropped } = rederive(declared, record.entry.slug, tokens)
    allDropped.push(...dropped)

    if (block === null) {
        delete record.entry.kind_extra.tokens
        blocksRemoved++
        continue
    }

    record.entry.kind_extra.tokens = block
    linesAfter += block.excerpt.length
}

console.log(`declared token variables: ${declared.size}`)
console.log(`token blocks   : ${blocksBefore} → ${blocksBefore - blocksRemoved} (${blocksRemoved} emptied and removed)`)
console.log(`excerpt lines  : ${linesBefore} → ${linesAfter} (${allDropped.length} dropped)`)
console.log(`retired fields : ${fieldsStripped} stripped (${DROPPED_FIELDS.join(', ')})`)

if (allDropped.length > 0) {
    console.log('\nDROPPED — the design system declares no such token. Not invented, not approximated:')
    const bySlug = new Map()
    for (const d of allDropped) {
        if (!bySlug.has(d.slug)) bySlug.set(d.slug, [])
        bySlug.get(d.slug).push(d.tokenPath)
    }
    for (const [slug, paths] of [...bySlug].sort((a, b) => b[1].length - a[1].length)) {
        console.log(`  ${slug.padEnd(24)} ${String(paths.length).padStart(2)}  ${paths.join(', ')}`)
    }
}

const next = `${JSON.stringify(seed, null, 2)}\n`

if (next === raw) {
    console.log('\nAlready re-derived — nothing to write.')
    process.exit(0)
}

if (CHECK) {
    console.error('\nFAIL — the committed seed is not what the sheets say. Run without --check to re-derive.')
    process.exit(1)
}

writeFileSync(SEED, next)
console.log(`\nWrote ${SEED}`)
