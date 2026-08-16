#!/usr/bin/env node
/**
 * Guard 5 — a component must not DECLARE a prop it never CONSUMES.
 *
 * THE DEFECT THIS EXISTS FOR
 * --------------------------
 * The project's own CLAUDE.md calls it "bug n°1": *a half-implemented
 * surface, where a documented prop silently does nothing*. It is the worst
 * cost/discovery ratio in the catalogue, because it produces no signal at
 * all — the prop is declared, so the type-check is happy; it is ignored, so
 * nothing throws; nothing exercises it, so no test reddens. The consumer
 * reads the doc, passes the prop, and watches nothing happen.
 *
 * On 2026-08-13 four instances were found in a single day, all four BY
 * ACCIDENT while working on something else (`borderBlock`/`borderInline`,
 * `IAdjacentProps` on OrigamBadge, `defaultDuration` on OrigamSnackbarGroup,
 * `filter` on OrigamChipGroup). The subsequent audit measured 1 997
 * runtime-confirmed inert (component, prop) pairs. This guard exists so that
 * stock can only shrink.
 *
 * WHAT COUNTS AS CONSUMED
 * -----------------------
 * The prop influences the render or the behaviour. Reached through any of:
 * a `<template>` binding expression, a `props.x` read in `<script setup>`,
 * or a composable the component hands the whole `props` object to (followed
 * transitively, including tables iterated by `props[key]`).
 *
 * TWO TRAPS THE DETECTION HANDLES DELIBERATELY
 * --------------------------------------------
 * 1. HOMONYMS. `grep filter packages/ds/src/components/Chip/OrigamChipGroup.vue`
 *    returns four hits, every one of them `filterProps` — an unrelated
 *    prop-filtering helper. The prop itself is read nowhere. Detection is
 *    token-based, not substring-based, so `filterProps` never credits
 *    `filter`.
 * 2. INDIRECT READS. `useDimension` reads `props[dimension]` while iterating
 *    `DIMENSIONS_ARRAY`; `useTypography` iterates a module-local tuple table;
 *    `useActive` reads `(props as any).activeClass` through a TS cast. Each
 *    of those shapes, unmodelled, produced a false-positive cluster. They are
 *    now credited — see `scanPropReads` in the audit script.
 *
 * PRECISION, MEASURED — AND THE MISTAKE THAT INFLATED IT
 * -----------------------------------------------------
 * The analysis is cross-checked against a runtime sweep that mounts each
 * component twice with two distinct values and diffs the rendered surface
 * (markup + the stylesheet `useStyle` injects): **precision 100 %** — 0 false
 * positives over 1 317 flagged pairs — for **recall 82.3 %**. That trade is
 * deliberate and right for a blocking guard: a false positive blocks an
 * innocent PR, a false negative only fails to catch some debt.
 * Re-run the cross-check with `pnpm -F @origam/tests audit:inert-props`.
 *
 * The first baseline held 3 340 entries and was WRONG. `filterProps(props, …)`
 * was recorded as "an explicit key list, not a wildcard" — it is neither: it
 * hands a child every prop the two components share. All 42 call sites in
 * this catalogue pass the whole `props` object; not one passes an object
 * literal. Correcting it removed **1 677 entries (50.2 %)** and took the
 * excluded-component count from 15 to 49.
 *
 * That first number also LOOKED validated, and was not. Precision was
 * computed only over pairs the runtime sweep could decide, and the
 * forwarding-heavy components are overlays (`Dialog`, `ContextualMenu`,
 * `Menu`, `Tooltip`, `Snackbar`…) which render nothing while closed. They
 * landed in `not-rendered` / `unmountable` and were silently outside the
 * measurement. A precision figure is only as good as the population it was
 * measured over — check that population before trusting the percentage.
 *
 * COMPONENTS THIS GUARD DOES NOT JUDGE
 * ------------------------------------
 * A component that spreads its whole props object (`...props`,
 * `v-bind="props"`, `mergeProps(props, …)`) can forward anything anywhere;
 * no static pass can decide those, so they are skipped wholesale rather than
 * guessed at. 15 components today. They are listed by `--why`.
 *
 * Run: `node packages/ds/scripts/guards/unconsumed-props.mjs`
 *      `node packages/ds/scripts/guards/unconsumed-props.mjs --why`
 *      (or `pnpm -F origam guards:unconsumed-props`)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyse } from '../audit-unconsumed-props.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, 'baseline/unconsumed-props.json')

const results = analyse()
const skipped = results.filter((r) => r.wildcard)

/*
 * Violation ID = `Component.prop`. Deliberately NOT line-based: a baseline
 * keyed on line numbers goes stale on every unrelated edit above it.
 */
const currentIds = new Set()
const detailsById = new Map()

for (const r of results) {
    if (r.wildcard) continue
    for (const u of r.unconsumed) {
        const id = `${r.name}.${u.prop}`
        currentIds.add(id)
        detailsById.set(id, `declared by ${u.declaredBy} — ${r.file}`)
    }
}

if (process.argv.includes('--why')) {
    console.log(`${results.length} components analysed, ${skipped.length} skipped (whole-props forwarding):`)
    for (const r of skipped) console.log(`  - ${r.name}: ${r.wildcardReasons.join('; ')}`)
    console.log(`\n${currentIds.size} candidate (component, prop) pairs.`)
    process.exit(0)
}

if (process.argv.includes('--update-baseline')) {
    const written = writeBaseline(BASELINE_PATH, currentIds)
    console.log(`Wrote ${written.length} entries to ${BASELINE_PATH}`)
    process.exit(0)
}

process.exit(report({
    guardName: 'unconsumed-props — a declared prop must reach the render or the behaviour',
    baselinePath: BASELINE_PATH,
    currentIds,
    detailsById,
    fixHint:
        'A NEW entry means a prop was added (or inherited via `extends`) and nothing reads it.\n'
        + 'Fix it, do not baseline it. Three shapes cover almost every case:\n'
        + '  1. The component extends a Commons interface but never calls its composable\n'
        + '     -> call it, and BIND its return (a `usePosition(props)` whose `positionStyles`\n'
        + '        is destructured away paints nothing — OrigamCard:361 does exactly that).\n'
        + '  2. The composable itself ignores the prop (useMargin reads only `props.margin`).\n'
        + '     -> that is a transverse change; raise it rather than patching one caller.\n'
        + '  3. The prop was never meant to be on this component -> drop it from the interface.\n'
        + 'Verify the fix at runtime, not by reading: `pnpm -F @origam/tests audit:inert-props`.'
}))
