/**
 * mount-cost.mjs — Vue 3 component MOUNT COST benchmark harness.
 *
 * WHY THIS EXISTS
 * ----------------
 * Issue #363 wires `useDefaults(_props)` onto 172 components. `useDefaults`
 * (see `packages/ds/src/composables/Commons/defaults.composable.ts`) does,
 * per mount: `Object.keys(props)`, then for EACH declared prop name builds
 * one `computed()` closure, then wraps the result in one `Proxy`. Before
 * that rollout lands, we need a number: does it cost more than 5 % on
 * mount? A go/no-go decision for the whole campaign depends on this figure.
 *
 * TWO MEASUREMENT MODES
 * ----------------------
 * 1. REAL-COMPONENT mode (default) — mounts actual `.vue` SFCs from the
 *    catalogue and reports their absolute mount cost. Useful for absolute
 *    numbers and for tracking a real component's cost over time, but a
 *    two-separate-runs "before/after" comparison inherits ALL of the
 *    machine's run-to-run drift on top of whatever `useDefaults` actually
 *    costs. MEASURED DIRECTLY: inter-series noise (same process) on `Btn`
 *    was 0.94 % in one run, 8.41 % in a separate run of the identical
 *    command — an ORDER OF MAGNITUDE difference that pins the noise
 *    source squarely on comparing separate PROCESSES, not on the
 *    measurement technique itself. Two-run comparisons are therefore not
 *    used to arbitrate the 5 % threshold; `--ab` mode (below) is.
 *
 * 2. `--ab` PAIRED INTRA-PROCESS mode — the fix. For each unit (a real
 *    component's name, or a raw prop count via `--prop-counts`), builds TWO
 *    synthetic components sharing an IDENTICAL prop surface: A (plain), B
 *    (wired with `useDefaults(_props)`, exactly like a real component
 *    would be). Both mount, in the SAME process, on the SAME host app,
 *    interleaved one pair per iteration (never "2000×A then 2000×B" — see
 *    "WHY INTERLEAVED, WHY PAIRED" below). The statistic reported is the
 *    PAIRED delta δᵢ = Bᵢ − Aᵢ, aggregated as its MEDIAN (not a difference
 *    of medians — see below) with a bootstrap 95 % CI, plus that median
 *    expressed as a percentage of A's own median cost.
 *
 * WHY INTERLEAVED, WHY PAIRED (not "mean(B) − mean(A)" over two blocks)
 * -------------------------------------------------------------------
 * Two independent design choices, each closing a different noise source:
 *
 * - INTERLEAVED (A,B,A,B,… one pair per iteration) instead of blocked
 *   (2000×A then 2000×B): any slow drift over the run's lifetime — thermal
 *   throttling, GC pacing, JIT continuing to tier up — would, in a blocked
 *   design, land almost entirely inside ONE of the two blocks and bias the
 *   block-to-block difference. Interleaved, the same drift touches A and B
 *   at nearly the same points in time, so it affects both nearly equally.
 * - PAIRED statistic (median of per-pair δᵢ) instead of a difference of
 *   marginal statistics (median(all B) − median(all A)): a difference of
 *   medians still carries whatever noise is COMMON to a given moment in
 *   time into both A's and B's marginal distributions independently, and
 *   that noise only cancels in expectation, not per-sample. Computing δᵢ
 *   PER PAIR first removes that common noise at the pair level, before any
 *   aggregation happens — the same logic as a paired t-test / Wilcoxon
 *   signed-rank test beating an unpaired one when the same nuisance factor
 *   hits both conditions in each unit of comparison.
 * - MEDIAN of δ, not mean of δ: sub-millisecond mount timings are riddled
 *   with rare GC-pause outliers (stddev routinely exceeds the mean itself
 *   at this scale — measured). The median is the statistic actually robust
 *   to that; the mean was kept in earlier iterations of this harness for
 *   completeness only, on the wrong side of that tradeoff.
 * - Order WITHIN each pair is randomized (coin flip: A-then-B or B-then-A),
 *   not fixed. A fixed order (always A first) would let B systematically
 *   benefit — or suffer — from whatever caches/JIT state A's mount just
 *   left behind, contaminating every single pair with the SAME directional
 *   bias, which the median-of-δ aggregation does NOT cancel (a constant
 *   bias survives averaging/median just as much as it survives summing).
 *   Randomizing which condition goes first is what actually cancels a
 *   "second mount in a pair runs warmer" effect; fixed alternation cannot.
 *
 * VALIDATION — an instrument that hasn't proven it can detect a real
 * effect, and hasn't proven it reports ~zero for no effect, is unusable
 * regardless of how principled its design sounds on paper. `--validate`
 * adds two extra units to any `--ab` run:
 *   - NEGATIVE CONTROL: A and B are literally the SAME component body (no
 *     useDefaults on either side). Expected: median δ ≈ 0, CI contains 0.
 *   - POSITIVE CONTROL: B is A plus a deterministic busy-wait in setup()
 *     that burns a KNOWN wall-clock cost (`--injected-overhead-ms`,
 *     default given by `DEFAULT_INJECTED_OVERHEAD_MS`) — a cost that does
 *     NOT depend on GC/allocation behaviour the way useDefaults' own cost
 *     does, so it is independently checkable. Expected: median δ lands
 *     close to the injected value. An instrument that can't see an effect
 *     deliberately put there proves nothing when it reports "no effect" on
 *     the real question — this is the performance-measurement version of
 *     a test suite with no red-test discipline.
 *
 * Synthetic components use STRING props uniformly — `useDefaults`'s own
 * cost mechanism (`Object.keys` + one `computed` per key) does not depend
 * on prop TYPE, only prop COUNT, so this is a deliberate simplification.
 * `--components` in `--ab` mode reads the REAL prop count off the actual
 * compiled `.vue` component (`Object.keys(Component.props).length`) and
 * builds the synthetic pair at THAT count — the mount itself is synthetic
 * (a "test double"), but the prop-surface size it's measured at is real.
 * This deliberately sidesteps having to fork component source: `OrigamBtn`
 * and `OrigamCard` already call `useDefaults` today (verified by reading
 * the source), so there is no "real Btn without useDefaults" to diff
 * against without editing the DS itself — the synthetic pair is what makes
 * the comparison possible at all without touching component source.
 *
 * KNOWN GAP (2026-08-19) — this file measures SYNTHETIC test doubles ONLY.
 * A true real-component A/B was NOT built here: the worktree it was being
 * drafted in was deleted mid-session (by the team lead, cleaning up after
 * an unrelated merge), and the draft was never tested. Do NOT assume the
 * real-component path exists in this file — it doesn't.
 *
 * It was measured SEPARATELY instead, directly on `develop`: B = the real
 * component as-is, A = the same component with its `useDefaults` line
 * removed, paired and interleaved on one host. Those numbers, not this
 * file's, are what arbitrated the 5 % stop rule of issue #363:
 *
 *     control Btn vs Btn   +0.0000ms    +0.02 %   (instrument sound)
 *     Btn      base 0.1725ms   delta +0.0594ms   +34.42 %
 *     Card     base 0.1233ms   delta +0.0638ms   +51.76 %
 *     Chip     base 0.1311ms   delta +0.0829ms   +63.21 %
 *     Divider  base 0.0452ms   delta +0.0037ms    +8.21 %  (reverse: added)
 *
 * ⚠️ THOSE PERCENTAGES ARE MEASURED AGAINST THE WRONG BASE (2026-08-19).
 * The run above mounts the component with NO plugin installed. A real app
 * calls `createOrigam()`, and the resolver mixin it installs runs on every
 * mount, so a realistic base is 3-4x larger and the SAME saving is a much
 * smaller share of it. Re-measured with the plugin installed, same paired
 * interleaved protocol, coin-flip order within each pair, median of the
 * per-pair deltas, n=2000:
 *
 *     control Btn vs Btn   base 0.7562ms   delta +0.0008ms   +0.10 %
 *     Btn                  base 0.7226ms   delta +0.0659ms   +9.11 %
 *     Card                 base 0.6137ms   delta +0.0660ms  +10.76 %
 *     Chip                 base 0.6047ms   delta +0.0722ms  +11.94 %
 *
 * The ABSOLUTE cost reproduces across both runs (+0.059..0.083 ms then
 * +0.066..0.072 ms) — that is the figure to trust and to quote. The
 * percentage is not a property of `useDefaults`; it is a property of what
 * you divide by. Both readings clear the 5 % stop rule, so the decision to
 * remove is unaffected, but "recovers 34-52 % of mount time" overstates
 * what a real application gets by roughly a factor of three.
 *
 * The harness for this second run is not committed: once the removal landed,
 * the "with useDefaults" side of the pair no longer exists in the tree, so
 * the A/B cannot be rebuilt from source without reverting the campaign.
 * To reproduce, check out a commit before 7bf7ede3, generate a twin of each
 * component with its `useDefaults` line deleted and `_props` renamed to
 * `props`, write it NEXT TO the original (relative imports must still
 * resolve) under a name outside the `Origam*.vue` catalogue glob, and mount
 * both twins on one host with `createOrigam({})` installed.
 *
 * ⚠️ The synthetic bases below are 3-4x SMALLER than those real ones, so the
 * ratios this file reports run ~2.5x HIGHER. Both readings clear 5 % by a
 * wide margin, so the verdict is identical either way — but quote the real
 * numbers, never these, or a future decision gets justified with a figure
 * 2.5x too large.
 *
 * HOW A SINGLE FILE RUNS BOTH "VIA NODE" AND "VIA VITEST"
 * ---------------------------------------------------------
 * Mounting a real `.vue` SFC needs the Vue compiler (for the `<template>`
 * block) plus the `@origam/*` → `packages/ds/src/*` alias resolution. Plain
 * Node cannot do either, and posting a throwaway `vitest.config.*` file
 * outside `packages/tests` can't resolve `@vitejs/plugin-vue` either (no
 * `node_modules` above `/tmp`). So a SINGLE file plays three roles,
 * disambiguated purely by which env var is set when it's (re-)imported:
 *
 *   1. ORCHESTRATOR (no special env var) — the command a human runs. Parses
 *      argv. If more than one "unit" is requested, it shards: spawns one
 *      fresh `node` CHILD PROCESS per unit (see "WHY SHARDING" below), each
 *      given its unit via `ORIGAM_BENCH_SHARD_ARGS`, then merges their JSON
 *      results into one combined report. With a single unit, it skips
 *      straight to step 2 in-process.
 *   2. SHARD/CLI (env `ORIGAM_BENCH_SHARD_ARGS` set, OR a single-unit
 *      orchestrator run) — still a plain Node process. Boots Vitest
 *      PROGRAMMATICALLY (`startVitest` from `vitest/node`) with an inline
 *      config (`config: false` — the normal `vitest.config.ts`
 *      include/coverage settings never apply here, so they can't skew
 *      timings). Forwards args to the Vitest worker via `ORIGAM_BENCH_ARGS`
 *      (Vitest's default `forks` pool inherits `process.env` like any
 *      Node child process).
 *   3. WORKER (env `ORIGAM_BENCH_WORKER=1`, set by step 2 and inherited by
 *      the forked Vitest worker) — the SAME file, re-imported by that
 *      worker, now runs inside jsdom with the Vue plugin active. Registers
 *      one `describe`/`it` that does the actual mount loop and prints/
 *      writes the report.
 *
 * WHY SHARDING (one process per component / prop-count / control)
 * ---------------------------------------------------------
 * Measured directly: `--components Divider,Pagination,Btn` in a single
 * process at the default sample size crashed with "Reached heap limit —
 * JavaScript heap out of memory" partway through. `OrigamPagination` mounts
 * a `v-for` of page-number buttons — much heavier per mount than
 * `OrigamDivider`/`OrigamBtn` — and its allocations compounded on top of
 * whatever the earlier components in the same run hadn't fully released.
 * (Separately measured: `Pagination` ALONE, in its own isolated process,
 * STILL exhausts a 4 GB heap at the full default sample size — its
 * per-series stddev climbs series over series in a way that looks like a
 * real per-mount retention issue in that component, not a harness
 * artifact. Flagged, not chased further here — out of this harness's
 * scope.) `packages/tests/audit/run-inert-props-audit.mjs` hit the
 * identical shape of problem for the identical reason and fixed it the
 * identical way: full process boundaries, not more `gc()` calls, reliably
 * reclaim memory between independent units of work.
 *
 * WHAT "MOUNT" MEANS HERE
 * -------------------------
 * One long-lived host Vue app per series (`createOrigam()` + `app.use()`
 * once, matching how a real app boots exactly once) with a tiny host
 * component that toggles a `shallowRef` to mount/unmount the TARGET
 * component(s) as its own child. Each measured mount:
 *
 *   t0 = performance.now(); visible.value = true; await nextTick(); t1 = ...
 *
 * `nextTick()` resolves once Vue's render job — the target's full setup()
 * + render + patch — has flushed. This isolates the target's own mount
 * cost from the cost of spinning up a whole new Vue app thousands of times
 * (which `@vue/test-utils`' `mount()` would do on every call).
 *
 * USAGE
 * -----
 *   node bench/mount-cost.mjs [--components Divider,Btn,Card]
 *                             [--iterations 2000] [--series 5]
 *                             [--warmup 300] [--burnin-series 1]
 *                             [--json /path/out.json]
 *
 *   node bench/mount-cost.mjs --ab [--components Divider,Btn,Card]
 *                             [--validate] [--injected-overhead-ms 0.02]
 *                             [--iterations 2000] [--series 5] [...]
 *
 *   node bench/mount-cost.mjs --ab --prop-counts 5,20,50
 *
 * Run from anywhere; paths are resolved relative to this file.
 */

import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TESTS_ROOT = resolve(__dirname, '..')
const REPO_ROOT = resolve(TESTS_ROOT, '..', '..')
const THIS_FILE_RELATIVE = relative(TESTS_ROOT, __filename).split('\\').join('/')

// `Btn`/`Card` already call `useDefaults` (verified by reading the source —
// `packages/ds/src/components/Btn/OrigamBtn.vue:188` and
// `Card/OrigamCard.vue:185`) — #363 will NOT touch them. That's fine for
// `--ab` mode: the synthetic pair is built at THEIR real prop count
// regardless of whether the real component already has useDefaults wired
// (see file header) — they're useful data points on the cost-vs-N curve
// either way, and negative controls for a REAL-MODE before/after diff.
// `Divider` is a genuine #363 subject (verified: doesn't call useDefaults
// on this baseline).
const DEFAULT_COMPONENTS = ['Divider', 'Btn', 'Card']
const DEFAULT_PROP_COUNTS = [5, 20, 50]
const DEFAULT_ITERATIONS = 2000
const DEFAULT_SERIES = 5
const DEFAULT_WARMUP = 300
const DEFAULT_BURNIN_SERIES = 1
const CONTROL_PROP_COUNT = 20
const DEFAULT_INJECTED_OVERHEAD_MS = 0.02
const BOOTSTRAP_RESAMPLES = 1000

/*********************************************************
 * Shared — stats helpers (dependency-free, safe to load
 * under plain Node too).
 ********************************************************/
function mean (xs) {
    return xs.reduce((a, b) => a + b, 0) / xs.length
}

function median (xs) {
    const s = [...xs].sort((a, b) => a - b)
    const n = s.length
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

function stddev (xs) {
    const n = xs.length
    if (n < 2) return 0
    const m = mean(xs)
    const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)
    return Math.sqrt(variance)
}

function percentile (xs, p) {
    const s = [...xs].sort((a, b) => a - b)
    const idx = (p / 100) * (s.length - 1)
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    if (lo === hi) return s[lo]
    return s[lo] + (s[hi] - s[lo]) * (idx - lo)
}

function fmt (n) {
    return Number.isFinite(n) ? n.toFixed(4) : 'NaN'
}

/**
 * Plain bootstrap CI for a single-sample statistic (here: median of the
 * per-pair δ). Resample WITH replacement, recompute the statistic,
 * repeat `resamples` times, take the percentile interval of the resulting
 * distribution.
 */
function bootstrapCI (samples, statFn, resamples = BOOTSTRAP_RESAMPLES, level = 0.95) {
    const n = samples.length
    const stats = new Array(resamples)
    for (let r = 0; r < resamples; r++) {
        const resample = new Array(n)
        for (let i = 0; i < n; i++) {
            resample[i] = samples[Math.floor(Math.random() * n)]
        }
        stats[r] = statFn(resample)
    }
    const alpha = (1 - level) / 2
    return {
        low: percentile(stats, alpha * 100),
        high: percentile(stats, (1 - alpha) * 100)
    }
}

/**
 * Paired bootstrap for the RATIO statistic (median(δ) / median(A) × 100).
 * Resamples PAIR INDICES — not `diffs` and `asA` independently — so each
 * bootstrap draw keeps a δᵢ together with its own Aᵢ. Resampling them
 * independently would answer a different (wrong) question: the ratio of
 * two separately-noisy quantities instead of the ratio computed from the
 * same underlying paired draws.
 */
function bootstrapPairedRatioCI (diffs, asA, resamples = BOOTSTRAP_RESAMPLES, level = 0.95) {
    const n = diffs.length
    const stats = new Array(resamples)
    for (let r = 0; r < resamples; r++) {
        const sDiffs = new Array(n)
        const sA = new Array(n)
        for (let i = 0; i < n; i++) {
            const idx = Math.floor(Math.random() * n)
            sDiffs[i] = diffs[idx]
            sA[i] = asA[idx]
        }
        const mA = median(sA)
        stats[r] = mA !== 0 ? (median(sDiffs) / mA) * 100 : NaN
    }
    const clean = stats.filter(Number.isFinite)
    const alpha = (1 - level) / 2
    return {
        low: percentile(clean, alpha * 100),
        high: percentile(clean, (1 - alpha) * 100)
    }
}

/**
 * Decision rule requested by the team lead: a ratio-% CI entirely below the
 * threshold PASSes, entirely above STOPs the campaign, and a CI straddling
 * the threshold is INCONCLUSIVE — the instrument doesn't get to fudge that.
 */
function verdictFor (ciLow, ciHigh, threshold = 5) {
    if (!Number.isFinite(ciLow) || !Number.isFinite(ciHigh)) return 'INCONCLUSIVE'
    if (ciHigh < threshold) return 'PASS'
    if (ciLow > threshold) return 'STOP'
    return 'INCONCLUSIVE'
}

function computeTimeoutMs (args) {
    const perCycleBudgetMs = 25
    const units = args.ab ? (args.abUnits ? args.abUnits.length : 1) : args.components.length
    // Burn-in series run (warmup+iterations) cycles once; each measured
    // series runs warmup (discarded) + iterations (measured) cycles too —
    // same total per series either way. `--ab` does 2 mounts (A and B) per
    // measured cycle instead of 1, PLUS bootstrap CPU time (pure JS on
    // already-collected samples, but budgeted generously all the same).
    const cyclesPerUnit = (args.series + args.burninSeries) * (args.warmup + args.iterations)
    const perCycleMultiplier = args.ab ? 2 : 1
    return Math.max(300_000, units * cyclesPerUnit * perCycleBudgetMs * perCycleMultiplier)
}

/*********************************************************
 * Argv parsing — shared by all three roles (no external
 * deps, safe under plain Node).
 ********************************************************/
function parseArgs (argv) {
    const args = {
        components: DEFAULT_COMPONENTS,
        propCounts: DEFAULT_PROP_COUNTS,
        propCountsExplicit: false,
        ab: false,
        validate: false,
        injectedOverheadMs: DEFAULT_INJECTED_OVERHEAD_MS,
        iterations: DEFAULT_ITERATIONS,
        series: DEFAULT_SERIES,
        warmup: DEFAULT_WARMUP,
        burninSeries: DEFAULT_BURNIN_SERIES,
        json: null,
        help: false
    }

    for (let i = 0; i < argv.length; i++) {
        const a = argv[i]
        if (a === '--help' || a === '-h') {
            args.help = true
        } else if (a === '--ab') {
            args.ab = true
        } else if (a === '--validate') {
            args.validate = true
        } else if (a === '--components') {
            args.components = String(argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
        } else if (a.startsWith('--components=')) {
            args.components = a.slice('--components='.length).split(',').map((s) => s.trim()).filter(Boolean)
        } else if (a === '--prop-counts') {
            args.propCounts = String(argv[++i] ?? '').split(',').map((s) => Number(s.trim())).filter((n) => n)
            args.propCountsExplicit = true
        } else if (a.startsWith('--prop-counts=')) {
            args.propCounts = a.slice('--prop-counts='.length).split(',').map((s) => Number(s.trim())).filter((n) => n)
            args.propCountsExplicit = true
        } else if (a === '--injected-overhead-ms') {
            args.injectedOverheadMs = Number(argv[++i])
        } else if (a.startsWith('--injected-overhead-ms=')) {
            args.injectedOverheadMs = Number(a.split('=')[1])
        } else if (a === '--iterations') {
            args.iterations = Number(argv[++i])
        } else if (a.startsWith('--iterations=')) {
            args.iterations = Number(a.split('=')[1])
        } else if (a === '--series') {
            args.series = Number(argv[++i])
        } else if (a.startsWith('--series=')) {
            args.series = Number(a.split('=')[1])
        } else if (a === '--warmup') {
            args.warmup = Number(argv[++i])
        } else if (a.startsWith('--warmup=')) {
            args.warmup = Number(a.split('=')[1])
        } else if (a === '--burnin-series') {
            args.burninSeries = Number(argv[++i])
        } else if (a.startsWith('--burnin-series=')) {
            args.burninSeries = Number(a.split('=')[1])
        } else if (a === '--json') {
            args.json = argv[++i]
        } else if (a.startsWith('--json=')) {
            args.json = a.slice('--json='.length)
        } else {
            throw new Error(`Unknown argument: ${a} (see --help)`)
        }
    }

    return args
}

function validateArgs (args) {
    if (args.ab && args.propCountsExplicit) {
        if (!Array.isArray(args.propCounts) || args.propCounts.length === 0) {
            throw new Error('--prop-counts must be a non-empty comma-separated list of positive integers, e.g. --prop-counts 5,20,50')
        }
        for (const n of args.propCounts) {
            if (!Number.isInteger(n) || n < 1) {
                throw new Error(`Invalid --prop-counts value "${n}" — must be a positive integer`)
            }
        }
    } else {
        if (!Array.isArray(args.components) || args.components.length === 0) {
            throw new Error('--components must be a non-empty comma-separated list, e.g. --components Divider,Btn,Card')
        }
        for (const name of args.components) {
            if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
                throw new Error(`Invalid component name "${name}" — expected the bare family name (e.g. "Btn", not "OrigamBtn" or "Btn.vue")`)
            }
        }
    }
    if (args.ab && (!Number.isFinite(args.injectedOverheadMs) || args.injectedOverheadMs <= 0)) {
        throw new Error('--injected-overhead-ms must be a positive number')
    }
    for (const [key, value] of [['--iterations', args.iterations], ['--series', args.series], ['--warmup', args.warmup], ['--burnin-series', args.burninSeries]]) {
        const allowsZero = key === '--warmup' || key === '--burnin-series'
        if (!Number.isFinite(value) || value < 0 || (!allowsZero && value < 1)) {
            throw new Error(`${key} must be a positive number, got ${value}`)
        }
    }
}

/**
 * Turns CLI args into the flat list of "ab units" the orchestrator shards
 * over and the worker benchmarks one by one. Pure data — no Vue/Vite
 * involved, safe to compute in the plain-Node orchestrator process. Each
 * unit's `propCount` for `kind: 'component'` is resolved LATER, inside the
 * Vue-aware worker (needs to import the real `.vue` file).
 */
function buildAbUnits (args) {
    const units = []

    if (args.propCountsExplicit) {
        for (const n of args.propCounts) {
            units.push({ kind: 'propCount', n, label: `${n}` })
        }
    } else {
        for (const name of args.components) {
            units.push({ kind: 'component', name, label: name })
        }
    }

    if (args.validate) {
        units.push({ kind: 'control', control: 'negative', n: CONTROL_PROP_COUNT, label: `NegativeControl_N${CONTROL_PROP_COUNT}` })
        units.push({
            kind: 'control',
            control: 'positive',
            n: CONTROL_PROP_COUNT,
            injectedOverheadMs: args.injectedOverheadMs,
            label: `PositiveControl_N${CONTROL_PROP_COUNT}_+${args.injectedOverheadMs}ms`
        })
    }

    return units
}

function printUsage () {
    console.log(`
origam mount-cost benchmark

Usage:
  node bench/mount-cost.mjs [options]                   (real components, absolute cost)
  node bench/mount-cost.mjs --ab [options]               (paired intra-process A/B)

Options:
  --components <A,B,C>     Comma-separated component family names, resolved
                            as @origam/components/{Name}/Origam{Name}.vue.
                            In --ab mode, drives which REAL prop counts the
                            synthetic pairs are built at (ignored if
                            --prop-counts is also passed).
                            (default: ${DEFAULT_COMPONENTS.join(',')})
  --ab                      Paired intra-process A/B mode: for each unit,
                            builds two synthetic components with an
                            identical prop surface — A plain, B wired with
                            useDefaults(_props) — interleaved one pair per
                            iteration, reports the MEDIAN of the per-pair
                            delta (B−A) with a bootstrap 95% CI, as a % of
                            A's own median cost. This is the mode that can
                            actually arbitrate a 5% threshold (see file
                            header for why real-component / two-run
                            comparisons cannot).
  --prop-counts <a,b,c>     Raw prop-surface sizes to benchmark in --ab mode,
                            INSTEAD of resolving them from --components.
  --validate                Adds a negative control (A and B identical — the
                            paired delta should be ~0) and a positive
                            control (B = A + a calibrated injected overhead
                            — the paired delta should land near that known
                            value) to the run. Do this before trusting any
                            --ab number.
  --injected-overhead-ms <n> Wall-clock cost (ms) the positive control burns
                            in B's setup() via a busy-wait.
                            (default: ${DEFAULT_INJECTED_OVERHEAD_MS})
  --iterations <n>          Measured mounts (or A/B pairs) per series, per
                            unit (default: ${DEFAULT_ITERATIONS})
  --series <n>              Independent repetitions per unit (default: ${DEFAULT_SERIES})
  --warmup <n>               Discarded warm-up mounts per series (default: ${DEFAULT_WARMUP})
  --burnin-series <n>       Extra full series run before the measured ones
                            and entirely discarded — absorbs the one-time
                            JIT / module-init cost that otherwise inflates
                            series #1 (default: ${DEFAULT_BURNIN_SERIES}, 0 to disable)
  --json <path>             Also write the full raw (combined) results as JSON
  --help                    Show this help

More than one component / prop-count / control unit shards across isolated
child processes automatically (avoids cross-unit heap growth — see file
header).

Examples:
  node bench/mount-cost.mjs --components Divider,Btn,Card
  node bench/mount-cost.mjs --ab --validate
  node bench/mount-cost.mjs --ab --prop-counts 5,20,50
`)
}

/*********************************************************
 * Orchestrator — plain Node process, the only thing a human
 * runs directly. No Vue/Vite imports at module scope (they
 * would fail to resolve outside a Vite-aware runner).
 ********************************************************/
async function runOrchestrator (argv) {
    const args = parseArgs(argv)

    if (args.help) {
        printUsage()
        return
    }

    validateArgs(args)

    if (args.ab) {
        args.abUnits = buildAbUnits(args)
    }

    const units = args.ab ? args.abUnits : args.components

    if (units.length <= 1) {
        await runSingleShard(args)
        return
    }

    console.log(`[mount-cost] sharding across ${units.length} unit(s) — one isolated child process each\n`)

    const combined = {}
    let anyFailed = false

    for (const unit of units) {
        const label = args.ab ? unit.label : unit
        const shardArgs = args.ab
            ? { ...args, abUnits: [unit] }
            : { ...args, components: [unit] }
        const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, '_')
        const tmpJson = join(tmpdir(), `origam-mount-cost-${process.pid}-${safeLabel}-${Math.random().toString(36).slice(2, 8)}.json`)
        shardArgs.json = tmpJson

        console.log(`[mount-cost] === shard: ${label} ===`)
        const result = spawnSync(process.execPath, [__filename], {
            stdio: 'inherit',
            env: { ...process.env, ORIGAM_BENCH_SHARD_ARGS: JSON.stringify(shardArgs) }
        })

        if (result.status !== 0) {
            anyFailed = true
            console.error(`[mount-cost] shard "${label}" exited with code ${result.status}`)
        }

        try {
            const raw = JSON.parse(readFileSync(tmpJson, 'utf-8'))
            Object.assign(combined, raw.results)
        } catch (err) {
            anyFailed = true
            console.error(`[mount-cost] shard "${label}" produced no readable JSON: ${err.message}`)
        } finally {
            rmSync(tmpJson, { force: true })
        }
    }

    console.log('\n[mount-cost] === combined report (all shards) ===')
    if (args.ab) printAbReport(combined, args)
    else printReport(combined, args)

    if (args.json) {
        writeFileSync(args.json, JSON.stringify({ args, results: combined }, null, 2))
        console.log(`[mount-cost] combined raw results written to ${args.json}`)
    }

    process.exit(anyFailed || Object.keys(combined).length === 0 ? 1 : 0)
}

/*********************************************************
 * Shard/CLI role — still a plain Node process (either the
 * orchestrator itself, when only one unit was requested, or
 * a child process spawned by it). Boots Vitest programmatically.
 ********************************************************/
async function runSingleShard (args) {
    // Forwarded to the Vitest worker process (default `forks` pool inherits
    // the parent's `process.env` the same way any Node child process does).
    process.env.ORIGAM_BENCH_WORKER = '1'
    process.env.ORIGAM_BENCH_ARGS = JSON.stringify(args)
    // `globalThis.gc()` is called between series to keep heap growth from
    // thousands of mount/unmount cycles from adding its own noise to the
    // timing — see the file-level comment in
    // `packages/tests/audit/run-inert-props-audit.mjs` for the sibling
    // problem (retained <style> nodes) this project already hit once.
    // `--max-old-space-size=4096` is defensive headroom for the DEFAULT
    // settings on a SINGLE unit (measured to run cleanly at 2000×5+1).
    process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--expose-gc', '--max-old-space-size=4096'].filter(Boolean).join(' ')

    const { startVitest } = await import('vitest/node')
    const vuePlugin = (await import('@vitejs/plugin-vue')).default
    const tsconfigPaths = (await import('vite-tsconfig-paths')).default

    const REPO_TSCONFIG = resolve(REPO_ROOT, 'tsconfig.json')
    const SETUP_FILE = resolve(TESTS_ROOT, 'TU/vitest.setup.ts')
    const DS_SRC = resolve(REPO_ROOT, 'packages/ds/src')
    const testTimeout = computeTimeoutMs(args)

    const unitLabel = args.ab ? `units=${args.abUnits.map((u) => u.label).join(',')}` : `components=${args.components.join(',')}`
    console.log(`[mount-cost] ${args.ab ? 'AB (paired, intra-process)' : 'real'} mode  ${unitLabel}  iterations=${args.iterations} series=${args.series} warmup=${args.warmup} burnin-series=${args.burninSeries}`)
    console.log(`[mount-cost] booting Vitest (jsdom) with testTimeout=${testTimeout}ms …`)

    const vitest = await startVitest(
        'test',
        [],
        {
            config: false,
            root: TESTS_ROOT,
            watch: false,
            run: true,
            include: [THIS_FILE_RELATIVE],
            includeSource: [THIS_FILE_RELATIVE],
            exclude: ['node_modules/**', 'dist/**'],
            environment: 'jsdom',
            globals: true,
            setupFiles: [SETUP_FILE],
            reporters: ['default'],
            testTimeout,
            hookTimeout: testTimeout,
            passWithNoTests: false
        },
        {
            root: TESTS_ROOT,
            plugins: [vuePlugin(), tsconfigPaths({ projects: [REPO_TSCONFIG] })],
            // `vite-tsconfig-paths` matches an importing file against the
            // `include` glob of a DISCOVERED tsconfig to decide which
            // `paths` apply to it. Nothing in the tsconfig project-reference
            // tree covers `packages/tests/bench/**` (only `TU/` and `e2e/`
            // are referenced), so it silently treats `@origam/*` imports
            // from this file as not-applicable and leaves them unresolved.
            // `packages/tests/vitest.audit.config.ts` hit the exact same
            // failure for the same reason and fixed it the same way — an
            // explicit alias, which Vite resolves before handing off to
            // plugin resolvers.
            resolve: {
                alias: [
                    { find: /^@origam\/(.*)$/, replacement: `${DS_SRC}/$1` },
                    { find: /^@origam$/, replacement: DS_SRC }
                ]
            }
        }
    )

    const failed = vitest.state.getCountOfFailedTests() > 0
    await vitest.close()
    process.exit(failed ? 1 : 0)
}

/*********************************************************
 * Worker role — runs INSIDE Vitest (jsdom environment).
 * Every Vue/Vite-resolved import is dynamic and confined to
 * this branch so the orchestrator/shard roles above never
 * touch them.
 ********************************************************/
async function registerBenchmarkSuite (args) {
    const { describe, it, expect } = await import('vitest')

    describe('origam mount-cost benchmark', () => {
        it(
            `mounts ${args.components.join(', ')} — ${args.iterations}×${args.series} series (+${args.warmup} warmup)`,
            async () => {
                const { createApp, defineComponent, h, nextTick, shallowRef } = await import('vue')
                const { createOrigam } = await import('@origam/origam')

                const results = {}

                for (const name of args.components) {
                    const modPath = `@origam/components/${name}/Origam${name}.vue`
                    let mod
                    try {
                        mod = await import(/* @vite-ignore */ modPath)
                    } catch (err) {
                        console.error(`[mount-cost] SKIPPED "${name}" — could not import ${modPath}: ${err.message}`)
                        continue
                    }
                    const Target = mod.default
                    // Real declared prop count, read off the COMPILED
                    // component object (`Component.props`, Vue's own
                    // normalized runtime props options) — not the source
                    // interface, which would require re-deriving every
                    // `extends` chain by hand. This is what `useDefaults`'s
                    // own `Object.keys(props)` sees at mount time.
                    const propCount = Target && Target.props ? Object.keys(Target.props).length : null
                    results[name] = await benchmarkComponent(name, Target, args, {
                        createApp,
                        defineComponent,
                        h,
                        nextTick,
                        shallowRef,
                        createOrigam
                    })
                    results[name].propCount = propCount
                }

                printReport(results, args)

                if (args.json) {
                    writeFileSync(args.json, JSON.stringify({ args, results }, null, 2))
                    console.log(`[mount-cost] raw results written to ${args.json}`)
                }

                expect(Object.keys(results).length, 'at least one component must have benchmarked successfully').toBeGreaterThan(0)
            },
            computeTimeoutMs(args)
        )
    })
}

async function registerAbBenchmarkSuite (args) {
    const { describe, it, expect } = await import('vitest')

    describe('origam useDefaults A/B benchmark (paired, intra-process)', () => {
        it(
            `units: ${args.abUnits.map((u) => u.label).join(', ')} — ${args.iterations}×${args.series} series (+${args.warmup} warmup)`,
            async () => {
                const { createApp, defineComponent, h, nextTick, shallowRef } = await import('vue')
                const { createOrigam } = await import('@origam/origam')
                const { useDefaults } = await import('@origam/composables')

                const results = {}

                for (const unit of args.abUnits) {
                    let propCount = null
                    let mode
                    let injectedOverheadMs = null
                    // Result key defaults to the unit's own label; only
                    // `kind: 'component'` overrides it below, once the real
                    // prop count is known.
                    let resultKey = unit.label
                    let synthetic = true

                    if (unit.kind === 'component') {
                        const modPath = `@origam/components/${unit.name}/Origam${unit.name}.vue`
                        let mod
                        try {
                            mod = await import(/* @vite-ignore */ modPath)
                        } catch (err) {
                            console.error(`[mount-cost] SKIPPED "${unit.label}" — could not import ${modPath}: ${err.message}`)
                            continue
                        }
                        const Target = mod.default
                        propCount = Target && Target.props ? Object.keys(Target.props).length : null
                        if (propCount == null) {
                            console.error(`[mount-cost] SKIPPED "${unit.label}" — could not read declared props off the compiled component`)
                            continue
                        }
                        mode = 'useDefaults'
                        // Team-lead correction (2026-08-19): a row literally
                        // named "Btn" reads as a measurement OF Btn — it
                        // isn't, it's a synthetic test double calibrated to
                        // Btn's real prop count (see file header, "Synthetic
                        // components use STRING props uniformly"). Naming it
                        // `synth-{name}-{N}props` makes that undeniable in
                        // any table, log, or JSON export six months from
                        // now, without having to re-read this file's header
                        // first.
                        resultKey = `synth-${unit.name}-${propCount}props`
                    } else if (unit.kind === 'propCount') {
                        propCount = unit.n
                        mode = 'useDefaults'
                        resultKey = `synth-${propCount}props`
                    } else if (unit.kind === 'control') {
                        propCount = unit.n
                        mode = unit.control === 'negative' ? 'identical' : 'injected'
                        injectedOverheadMs = unit.injectedOverheadMs ?? null
                    }

                    results[resultKey] = await benchmarkPairedUnit(propCount, mode, injectedOverheadMs, args, {
                        createApp,
                        defineComponent,
                        h,
                        nextTick,
                        shallowRef,
                        createOrigam,
                        useDefaults
                    })
                    results[resultKey].propCount = propCount
                    // Every unit `--ab` mode can currently produce IS a
                    // synthetic test double — real-component A/B (B = real
                    // component as-is, A = same component with useDefaults
                    // neutralised) does not exist in this file yet (see file
                    // header, "KNOWN GAP"). Setting this explicitly, rather
                    // than only relying on the resultKey prefix, means a
                    // consumer reading the JSON export doesn't have to know
                    // the naming convention to avoid the same misreading.
                    results[resultKey].synthetic = synthetic
                }

                printAbReport(results, args)

                if (args.json) {
                    writeFileSync(args.json, JSON.stringify({ args, results }, null, 2))
                    console.log(`[mount-cost] raw results written to ${args.json}`)
                }

                expect(Object.keys(results).length, 'at least one unit must have benchmarked successfully').toBeGreaterThan(0)
            },
            computeTimeoutMs(args)
        )
    })
}

/**
 * Runs ONE series (mount+unmount `count` times against a freshly created
 * host app) and returns the raw per-mount durations. Used both for the
 * discarded burn-in series and for the measured ones — same shape, same
 * cost, so burn-in genuinely absorbs whatever series #1 would otherwise pay
 * alone (first-ever `createOrigam()` call, first CSS-module evaluation,
 * V8 tier-up that hasn't happened yet — all one-time, process-lifetime
 * costs, not something that repeats per series).
 */
async function runOneSeries (Target, count, vueApi) {
    const { createApp, defineComponent, h, nextTick, shallowRef, createOrigam } = vueApi

    const origam = createOrigam()
    const container = document.createElement('div')
    document.body.appendChild(container)

    const Host = defineComponent({
        name: 'OrigamBenchHost',
        setup () {
            const visible = shallowRef(false)
            return { visible }
        },
        render () {
            return this.visible ? h(Target) : null
        }
    })

    const app = createApp(Host)
    app.use(origam)
    const vm = app.mount(container)

    const durations = new Array(count)
    for (let i = 0; i < count; i++) {
        const t0 = performance.now()
        vm.visible = true
        await nextTick()
        const t1 = performance.now()
        durations[i] = t1 - t0

        vm.visible = false
        await nextTick()
    }

    app.unmount()
    container.remove()
    // Defensive sweep — `useStyle`'s `tryOnScopeDispose` already removes its
    // own <style> tag on unmount, this is just insurance against a
    // component that doesn't clean up after itself the same way the
    // inert-props audit was bitten by once (see that runner's header
    // comment).
    document.querySelectorAll('style[id^="origam_styletag_"]').forEach((el) => el.remove())
    if (globalThis.gc) globalThis.gc()

    return durations
}

async function benchmarkComponent (name, Target, args, vueApi) {
    // Burn-in: full series (warmup + measured-length mount count), run and
    // thrown away entirely. Empirically, WITHOUT this, series #1 alone runs
    // 2-4x slower than every subsequent series regardless of its own
    // internal warm-up loop — a one-time process-lifetime cost (JIT
    // tier-up, first module evaluation) was leaking into the first
    // measured series and inflating inter-series CV past 20%.
    for (let b = 0; b < args.burninSeries; b++) {
        await runOneSeries(Target, args.warmup + args.iterations, vueApi)
    }

    const seriesStats = []
    const allSeries = []

    for (let s = 0; s < args.series; s++) {
        // Per-series warm-up, discarded — keeps each series internally
        // consistent even though the cross-series JIT cost is now handled
        // by the burn-in above.
        await runOneSeries(Target, args.warmup, vueApi)

        const durations = await runOneSeries(Target, args.iterations, vueApi)

        allSeries.push(durations)
        seriesStats.push({
            series: s + 1,
            n: durations.length,
            mean: mean(durations),
            median: median(durations),
            stddev: stddev(durations),
            p95: percentile(durations, 95)
        })
    }

    const pooled = allSeries.flat()
    const seriesMeans = seriesStats.map((st) => st.mean)
    const seriesMedians = seriesStats.map((st) => st.median)

    return {
        component: name,
        warmupPerSeries: args.warmup,
        iterationsPerSeries: args.iterations,
        seriesCount: args.series,
        burninSeries: args.burninSeries,
        series: seriesStats,
        pooled: {
            n: pooled.length,
            mean: mean(pooled),
            median: median(pooled),
            stddev: stddev(pooled),
            p95: percentile(pooled, 95)
        },
        interSeries: {
            // Mean-of-means is dominated by rare GC-pause outliers (stddev
            // routinely exceeds the mean itself for sub-millisecond mounts)
            // — reported for completeness, but median-of-medians is the
            // statistic actually fit to judge "is a 3-5% difference signal
            // or noise", since the per-series MEDIAN is far more robust to
            // those outliers than the per-series mean.
            meanOfMeans: mean(seriesMeans),
            stddevOfMeans: stddev(seriesMeans),
            cvPercentOfMeans: (stddev(seriesMeans) / mean(seriesMeans)) * 100,
            meanOfMedians: mean(seriesMedians),
            stddevOfMedians: stddev(seriesMedians),
            cvPercentOfMedians: (stddev(seriesMedians) / mean(seriesMedians)) * 100
        }
    }
}

function printReport (results, args) {
    console.log('\n=== origam mount-cost benchmark (real components) ===')
    console.log(`components: ${Object.keys(results).join(', ')}`)
    console.log(`iterations/series: ${args.iterations}  warmup/series: ${args.warmup}  series: ${args.series}  burnin-series: ${args.burninSeries}\n`)

    const summaryRows = []

    for (const name of Object.keys(results)) {
        const r = results[name]
        console.log(`--- ${name} (Origam${name}) — ${r.propCount == null ? 'prop count unknown' : `${r.propCount} declared props`} ---`)
        console.table(
            r.series.map((st) => ({
                series: st.series,
                n: st.n,
                'mean(ms)': fmt(st.mean),
                'median(ms)': fmt(st.median),
                'stddev(ms)': fmt(st.stddev),
                'p95(ms)': fmt(st.p95)
            }))
        )
        console.log(`pooled: n=${r.pooled.n} mean=${fmt(r.pooled.mean)}ms median=${fmt(r.pooled.median)}ms stddev=${fmt(r.pooled.stddev)}ms p95=${fmt(r.pooled.p95)}ms`)
        console.log(`inter-series (means):   meanOfMeans=${fmt(r.interSeries.meanOfMeans)}ms stddevOfMeans=${fmt(r.interSeries.stddevOfMeans)}ms CV=${fmt(r.interSeries.cvPercentOfMeans)}%`)
        console.log(`inter-series (medians): meanOfMedians=${fmt(r.interSeries.meanOfMedians)}ms stddevOfMedians=${fmt(r.interSeries.stddevOfMedians)}ms CV=${fmt(r.interSeries.cvPercentOfMedians)}%\n`)

        summaryRows.push({
            component: name,
            'props': r.propCount ?? '?',
            'pooled mean(ms)': fmt(r.pooled.mean),
            'pooled median(ms)': fmt(r.pooled.median),
            'pooled p95(ms)': fmt(r.pooled.p95),
            'inter-series CV% (medians)': fmt(r.interSeries.cvPercentOfMedians)
        })
    }

    console.log('=== summary ===')
    console.table(summaryRows)
}

/*********************************************************
 * --ab mode: synthetic paired A/B benchmark.
 ********************************************************/
function buildSyntheticPropsSchema (n) {
    const schema = {}
    for (let i = 0; i < n; i++) {
        schema[`prop${i}`] = { type: String, default: `default-value-${i}` }
    }
    return schema
}

/**
 * Builds CompB according to `mode`:
 *   - 'useDefaults' — the real thing: same schema as A, wrapped with
 *     useDefaults(_props), reading every prop through the resolved Proxy.
 *   - 'identical'   — NEGATIVE CONTROL: byte-for-byte the same body as A.
 *   - 'injected'    — POSITIVE CONTROL: A's body plus a deterministic
 *     busy-wait in setup() burning `injectedOverheadMs` of wall-clock time.
 *     Wall-clock, not allocation-driven, so it's independently checkable
 *     against the reported delta regardless of GC behaviour.
 */
function buildCompB (mode, schema, propKeys, injectedOverheadMs, vueApi) {
    const { defineComponent, h, useDefaults } = vueApi

    if (mode === 'useDefaults') {
        return defineComponent({
            name: 'OrigamBenchSyntheticB_UseDefaults',
            props: schema,
            setup (_props) {
                const props = useDefaults(_props)
                return () => h('span', null, propKeys.map((k) => props[k]).join(''))
            }
        })
    }

    if (mode === 'identical') {
        return defineComponent({
            name: 'OrigamBenchSyntheticB_Identical',
            props: schema,
            setup (props) {
                return () => h('span', null, propKeys.map((k) => props[k]).join(''))
            }
        })
    }

    if (mode === 'injected') {
        return defineComponent({
            name: 'OrigamBenchSyntheticB_Injected',
            props: schema,
            setup (props) {
                const t0 = performance.now()
                 
                while (performance.now() - t0 < injectedOverheadMs) {}
                return () => h('span', null, propKeys.map((k) => props[k]).join(''))
            }
        })
    }

    throw new Error(`Unknown CompB mode: ${mode}`)
}

/**
 * Runs ONE interleaved A/B series and returns the raw paired samples.
 * `CompA`/`CompB` are created ONCE per unit (by `benchmarkPairedUnit`) and
 * reused across burn-in + every series here — recreating them per call
 * would pay Vue's per-component-definition normalization cost on every
 * series' first mount, reproducing exactly the "series #1 is slower"
 * artifact the burn-in mechanism exists to eliminate.
 *
 * Order within each pair is randomized (coin flip) specifically to cancel
 * any systematic "second mount in a pair runs warmer" bias — a FIXED
 * alternation (always A first) would let B systematically benefit from
 * whatever caches A's mount just populated, biasing every single pair the
 * same direction, which averaging/median does NOT cancel (see file
 * header).
 */
async function runOneAbSeries (CompA, CompB, count, vueApi) {
    const { createApp, defineComponent, h, nextTick, shallowRef, createOrigam } = vueApi

    const origam = createOrigam()
    const container = document.createElement('div')
    document.body.appendChild(container)

    const Host = defineComponent({
        name: 'OrigamBenchAbHost',
        setup () {
            const mode = shallowRef(null)
            return { mode }
        },
        render () {
            if (this.mode === 'A') return h(CompA)
            if (this.mode === 'B') return h(CompB)
            return null
        }
    })

    const app = createApp(Host)
    app.use(origam)
    const vm = app.mount(container)

    const diffs = new Array(count)
    const asA = new Array(count)
    const asB = new Array(count)

    for (let i = 0; i < count; i++) {
        const firstIsA = Math.random() < 0.5

        vm.mode = firstIsA ? 'A' : 'B'
        const tStart1 = performance.now()
        await nextTick()
        const durFirst = performance.now() - tStart1
        vm.mode = null
        await nextTick()

        vm.mode = firstIsA ? 'B' : 'A'
        const tStart2 = performance.now()
        await nextTick()
        const durSecond = performance.now() - tStart2
        vm.mode = null
        await nextTick()

        const durA = firstIsA ? durFirst : durSecond
        const durB = firstIsA ? durSecond : durFirst
        asA[i] = durA
        asB[i] = durB
        diffs[i] = durB - durA
    }

    app.unmount()
    container.remove()
    document.querySelectorAll('style[id^="origam_styletag_"]').forEach((el) => el.remove())
    if (globalThis.gc) globalThis.gc()

    return { diffs, asA, asB }
}

async function benchmarkPairedUnit (n, mode, injectedOverheadMs, args, vueApi) {
    const { defineComponent, h } = vueApi
    const schema = buildSyntheticPropsSchema(n)
    const propKeys = Object.keys(schema)

    // A: plain props — the baseline every mode is measured against.
    const CompA = defineComponent({
        name: 'OrigamBenchSyntheticA',
        props: schema,
        setup (props) {
            return () => h('span', null, propKeys.map((k) => props[k]).join(''))
        }
    })

    const CompB = buildCompB(mode, schema, propKeys, injectedOverheadMs, vueApi)

    for (let b = 0; b < args.burninSeries; b++) {
        await runOneAbSeries(CompA, CompB, args.warmup + args.iterations, vueApi)
    }

    const seriesStats = []
    const allDiffs = []
    const allA = []

    for (let s = 0; s < args.series; s++) {
        await runOneAbSeries(CompA, CompB, args.warmup, vueApi)

        const { diffs, asA, asB } = await runOneAbSeries(CompA, CompB, args.iterations, vueApi)

        allDiffs.push(diffs)
        allA.push(asA)

        const medianDiff = median(diffs)
        const medianA = median(asA)
        const ci = bootstrapCI(diffs, median)
        const ratioCi = bootstrapPairedRatioCI(diffs, asA)

        seriesStats.push({
            series: s + 1,
            n: diffs.length,
            medianA,
            medianB: median(asB),
            medianDiff,
            ciLow: ci.low,
            ciHigh: ci.high,
            ratioPercent: medianA !== 0 ? (medianDiff / medianA) * 100 : NaN,
            ratioCiLow: ratioCi.low,
            ratioCiHigh: ratioCi.high
        })
    }

    const pooledDiffs = allDiffs.flat()
    const pooledA = allA.flat()
    const pooledMedianDiff = median(pooledDiffs)
    const pooledMedianA = median(pooledA)
    const pooledCi = bootstrapCI(pooledDiffs, median)
    const pooledRatioCi = bootstrapPairedRatioCI(pooledDiffs, pooledA)
    const pooledRatioPercent = pooledMedianA !== 0 ? (pooledMedianDiff / pooledMedianA) * 100 : NaN
    const seriesMedianDiffs = seriesStats.map((st) => st.medianDiff)

    return {
        propCount: n,
        mode,
        injectedOverheadMs: mode === 'injected' ? injectedOverheadMs : null,
        warmupPerSeries: args.warmup,
        iterationsPerSeries: args.iterations,
        seriesCount: args.series,
        burninSeries: args.burninSeries,
        series: seriesStats,
        pooled: {
            n: pooledDiffs.length,
            medianA: pooledMedianA,
            medianDiff: pooledMedianDiff,
            // Bootstrap 95% CI on the median of paired deltas — see
            // `bootstrapCI` / `bootstrapPairedRatioCI` above for why this
            // replaces the earlier normal-approximation CI on the MEAN
            // delta from two independent runs.
            ci95Low: pooledCi.low,
            ci95High: pooledCi.high,
            ratioPercent: pooledRatioPercent,
            ratioCi95LowPercent: pooledRatioCi.low,
            ratioCi95HighPercent: pooledRatioCi.high,
            verdict: verdictFor(pooledRatioCi.low, pooledRatioCi.high)
        },
        interSeries: {
            meanOfSeriesMedianDiffs: mean(seriesMedianDiffs),
            stddevOfSeriesMedianDiffs: stddev(seriesMedianDiffs),
            cvPercent: mean(seriesMedianDiffs) !== 0 ? (stddev(seriesMedianDiffs) / Math.abs(mean(seriesMedianDiffs))) * 100 : NaN
        }
    }
}

function printAbReport (results, args) {
    console.log('\n=== origam useDefaults A/B benchmark (interleaved, paired, intra-process) ===')
    console.log(`units: ${Object.keys(results).join(', ')}`)
    console.log(`iterations/series: ${args.iterations}  warmup/series: ${args.warmup}  series: ${args.series}  burnin-series: ${args.burninSeries}`)
    // Team-lead correction (2026-08-19): every row `--ab` mode can
    // currently produce is a SYNTHETIC test double calibrated to a prop
    // count — real-component A/B doesn't exist yet (see file header,
    // "KNOWN GAP"). Said here once, up top, in addition to the per-row
    // key prefix and the summary table's `type` column below, so it can't
    // be missed by skimming straight to the numbers.
    console.log('NOTE: every unit below is a SYNTHETIC test double (same prop COUNT as the named real component, not the real component itself) — see file header.\n')

    const summaryRows = []

    for (const key of Object.keys(results)) {
        const r = results[key]
        console.log(`--- ${key}${r.propCount != null ? ` (N=${r.propCount} props, mode=${r.mode}${r.injectedOverheadMs != null ? `, injected=${r.injectedOverheadMs}ms` : ''})` : ''} ---`)
        console.table(
            r.series.map((st) => ({
                series: st.series,
                n: st.n,
                'medianA(ms)': fmt(st.medianA),
                'medianB(ms)': fmt(st.medianB),
                'medianDiff(ms)': fmt(st.medianDiff),
                'bootstrap 95% CI(ms)': `[${fmt(st.ciLow)}, ${fmt(st.ciHigh)}]`,
                'ratio%': fmt(st.ratioPercent)
            }))
        )
        console.log(`pooled: n=${r.pooled.n} medianA=${fmt(r.pooled.medianA)}ms medianDiff=${fmt(r.pooled.medianDiff)}ms  bootstrap 95% CI=[${fmt(r.pooled.ci95Low)}, ${fmt(r.pooled.ci95High)}]ms`)
        console.log(`ratio: ${fmt(r.pooled.ratioPercent)}%  bootstrap 95% CI=[${fmt(r.pooled.ratioCi95LowPercent)}%, ${fmt(r.pooled.ratioCi95HighPercent)}%]  verdict(5%): ${r.pooled.verdict}`)
        console.log(`inter-series CV on medianDiff: ${fmt(r.interSeries.cvPercent)}%\n`)

        summaryRows.push({
            unit: key,
            type: r.synthetic ? 'SYNTHETIC' : 'real component',
            props: r.propCount ?? '?',
            mode: r.mode,
            'medianA(ms)': fmt(r.pooled.medianA),
            'medianDiff(ms)': fmt(r.pooled.medianDiff),
            'ratio%': fmt(r.pooled.ratioPercent),
            '95% CI (ratio%)': `[${fmt(r.pooled.ratioCi95LowPercent)}, ${fmt(r.pooled.ratioCi95HighPercent)}]`,
            'verdict(5%)': r.pooled.verdict
        })
    }

    console.log('=== summary — useDefaults overhead (paired, intra-process) ===')
    console.table(summaryRows)
}

/*********************************************************
 * Entry point — role dispatch.
 ********************************************************/
if (process.env.ORIGAM_BENCH_WORKER === '1') {
    const workerArgs = JSON.parse(process.env.ORIGAM_BENCH_ARGS)
    if (workerArgs.ab) await registerAbBenchmarkSuite(workerArgs)
    else await registerBenchmarkSuite(workerArgs)
} else if (process.env.ORIGAM_BENCH_SHARD_ARGS) {
    await runSingleShard(JSON.parse(process.env.ORIGAM_BENCH_SHARD_ARGS))
} else {
    await runOrchestrator(process.argv.slice(2))
}
