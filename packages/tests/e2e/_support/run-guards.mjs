#!/usr/bin/env node
/**
 * Runner for the Variant navigation guards — runs them ALL, aggregates their
 * exit codes, and never short-circuits.
 *
 * ─── Why this file exists ────────────────────────────────────────────────────
 * The guards do not overlap; they PARTITION the suite. Measured on this tree:
 *
 *     audit-variant-titles.mjs   82 specs   (navigate by Variant title)
 *                                           — of which 80 verified, 2 exempted
 *                                             by in-file pragma, listed on
 *                                             every run
 *     audit-variant-pins.mjs     60 specs   (navigate by ?variantId=<slug>-N)
 *                                           — of which 55 bound to one story,
 *                                             5 multi-story, named as
 *                                             unattributable
 *     intersection                0 specs
 *
 * Union: 142/175. The 33 remaining are 28 marketing/docs specs that target no
 * story at all, plus 5 that target one but navigate in a way neither guard can
 * read statically. That residue is stated here rather than rounded away.
 *
 * Each guard is therefore silent about the other's half BY CONSTRUCTION. A
 * green `audit-variant-titles` says nothing whatsoever about the 54 specs that
 * address Variants positionally, and vice versa. The guarantee only exists
 * when BOTH have spoken.
 *
 * Chaining them with `&&` destroys exactly that. `a && b` runs `b` only if `a`
 * succeeded, so any failure in the title half suppresses the pin half
 * entirely — the run reports one problem and hides an unknown number of
 * others, on a disjoint set of specs. The operator turns two complementary
 * guards into one, silently, and the person reading the output has no way to
 * tell that half the suite went unexamined. `;` would be no better: it runs
 * both but the shell keeps only the LAST exit code, so a failing first guard
 * followed by a passing second exits 0 — a red run reported green.
 *
 * Hence: spawn each guard, let each one finish, collect every status, OR them
 * together. The gate fails if ANY guard failed, and the summary states which.
 *
 * Usage:
 *     node e2e/_support/run-guards.mjs              # the audits
 *     node e2e/_support/run-guards.mjs --self-test  # each guard's own self-test
 */

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const SELF_TEST = argv.includes('--self-test')

// Test-only override (see TU/e2e-support/run-guards.spec.ts, #534): the
// aggregation logic below (spawn each guard, OR their exit codes, never
// short-circuit) is exactly the thing #534 was filed against — "a failing
// guard blocks Playwright but the caller still sees exit 0". Proving that
// stays fixed means running THIS file, unmodified, against a guard we
// control instead of the real (and currently drifting) variant-titles /
// variant-pins detectors. RUN_GUARDS_FIXTURE_FILES, when set, replaces
// GUARDS with a synthetic list built from a comma-separated list of
// absolute script paths. Unset in every real invocation (CLI, pretest:e2e,
// CI) — the production GUARDS list below is untouched.
const FIXTURE_FILES = process.env.RUN_GUARDS_FIXTURE_FILES

const GUARDS = FIXTURE_FILES
    ? FIXTURE_FILES.split(',').map((file, i) => ({ name: `fixture-${i}`, file, covers: '(fixture — test-only, RUN_GUARDS_FIXTURE_FILES)' }))
    : [
        { name: 'variant-titles', file: join(HERE, 'audit-variant-titles.mjs'), covers: 'specs naviguant par TITRE de Variant' },
        { name: 'variant-pins', file: join(HERE, 'audit-variant-pins.mjs'), covers: 'specs naviguant par INDEX (?variantId=<slug>-N)' },
        // #824 — troisieme partition, orthogonale aux deux precedentes : elles
        // jugent COMMENT une spec navigue, celle-ci juge SI un job de CI
        // l'execute. Les deux premieres peuvent etre vertes sur une spec que
        // la CI n'a jamais lancee — c'est exactement ce qui est arrive a
        // `rating-field-a11y.spec.ts` (#810).
        { name: 'spec-coverage', file: join(HERE, 'audit-spec-coverage.mjs'), covers: 'specs executees par un job de CI, ou enregistrees comme ne l\'etant pas' }
    ]

const mode = SELF_TEST ? '--self-test' : null
const label = SELF_TEST ? 'self-tests' : 'audits'

console.log(`\n═══ Variant guards — ${label} (${GUARDS.length} gardes, exécutés tous, codes agrégés) ═══\n`)

const results = []
for (const g of GUARDS) {
    console.log(`\n─── ${g.name} — ${g.covers} ───\n`)
    // stdio 'inherit': the diagnostic is the product. Never capture-and-summarise
    // it away — a guard whose findings get swallowed by its own runner is the
    // failure mode this whole exercise is about.
    const r = spawnSync(process.execPath, mode ? [g.file, mode] : [g.file], { stdio: 'inherit' })
    // A guard killed by a signal (OOM, timeout) has status === null. Treating
    // that as 0 would let a crashed guard read as a pass.
    const code = r.status === null ? 1 : r.status
    results.push({ ...g, code, signal: r.signal })
}

console.log(`\n═══ Récapitulatif ═══\n`)
for (const r of results) {
    const state = r.code === 0 ? '✓ vert' : `✗ ROUGE (exit ${r.code}${r.signal ? `, signal ${r.signal}` : ''})`
    console.log(`  ${state.padEnd(28)} ${r.name}  — ${r.covers}`)
}

const failed = results.filter((r) => r.code !== 0)
if (!failed.length) {
    // ⛔ Le compte est derive de `results`, jamais ecrit en dur : la phrase
    // disait « les DEUX moities » et il y a trois gardes depuis #824. Un
    // recapitulatif qui annonce un perimetre faux est la meme famille de
    // defaut que les gardes qu'il agrege.
    console.log(`\n✓ ${results.length}/${results.length} gardes verts — les ${results.length} partitions de la suite ont été examinées.\n`)
    process.exit(0)
}

console.log(
    `\n✗ ${failed.length}/${results.length} garde(s) en échec : ${failed.map((f) => f.name).join(', ')}.`
    + `\n  Les ${results.length - failed.length} autre(s) ont TOUT DE MÊME tourné — leur verdict ci-dessus est valide.\n`
)
process.exit(1)
