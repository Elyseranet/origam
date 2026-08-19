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
 *    machine's run-to-run drift (thermal, JIT, background load) on top of
 *    whatever `useDefaults` actually costs — calibrated at 4-9 % run-to-run
 *    noise on the pooled median for Divider/Btn, which is too close to (or
 *    above) the 5 % threshold to arbitrate anything. See the calibration
 *    notes below.
 *
 * 2. `--ab` INTERLEAVED mode — the fix for that noise problem. Builds TWO
 *    synthetic components with an IDENTICAL prop surface (N string props,
 *    N configurable via `--prop-counts`): one plain, one wired with
 *    `useDefaults(_props)` exactly like a real component would be. Both are
 *    mounted, in the SAME process, in randomized-order alternation
 *    (A,B,B,A,B,A,… — the coin flip cancels any systematic "second mount in
 *    a pair is warmer" bias), and the harness reports the PAIRED delta
 *    (B − A) with a 95 % CI, plus that delta as a percentage of A's own
 *    mean cost — which is exactly "how much does useDefaults cost, in
 *    percent of mount time, for a component with N props". Doing this
 *    turns two noisy independent samples into one low-variance paired
 *    comparison (textbook reason paired designs beat independent-group
 *    designs when the same nuisance factors — GC phase, JIT tier state —
 *    hit both conditions equally within a tight time window).
 *    Synthetic components use STRING props uniformly — `useDefaults`'s own
 *    cost mechanism (`Object.keys` + one `computed` per key) does not
 *    depend on prop TYPE, only prop COUNT, so this is a deliberate
 *    simplification, not an oversight.
 *
 * Real components already wired with `useDefaults` (OrigamBtn, OrigamCard)
 * make good NEGATIVE CONTROLS in real-component mode: their mount cost is
 * not expected to move at all when #363 lands elsewhere in the catalogue,
 * so if a before/after comparison ever shows them moving by more than the
 * calibrated noise floor, that is itself a signal something is off with
 * the comparison, not with those components.
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
 *      argv. If more than one "unit" is requested (more than one
 *      `--components` name, or more than one `--prop-counts` value), it
 *      shards: spawns one fresh `node` CHILD PROCESS per unit (see "WHY
 *      SHARDING" below), each given its unit via `ORIGAM_BENCH_SHARD_ARGS`,
 *      then merges their JSON results into one combined report. With a
 *      single unit, it skips straight to step 2 in-process.
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
 * WHY SHARDING (one process per component / prop-count)
 * ---------------------------------------------------------
 * Measured directly: `--components Divider,Pagination,Btn` in a single
 * process at the default sample size crashed with "Reached heap limit —
 * JavaScript heap out of memory" partway through. `OrigamPagination` mounts
 * a `v-for` of page-number buttons — much heavier per mount than
 * `OrigamDivider`/`OrigamBtn` — and its allocations compounded on top of
 * whatever the earlier components in the same run hadn't fully released.
 * `packages/tests/audit/run-inert-props-audit.mjs` hit the identical shape
 * of problem for the identical reason and fixed it the identical way: full
 * process boundaries, not more `gc()` calls, are what reliably reclaims
 * memory between independent units of work. Sharding here also happens to
 * be exactly what's needed for `--ab`'s multiple `--prop-counts` values.
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
 *   node bench/mount-cost.mjs [--components Divider,Pagination,Btn]
 *                             [--iterations 2000] [--series 5]
 *                             [--warmup 300] [--burnin-series 1]
 *                             [--json /path/out.json]
 *
 *   node bench/mount-cost.mjs --ab [--prop-counts 5,20,50]
 *                             [--iterations 2000] [--series 5] [...]
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
// `Card/OrigamCard.vue:185`) — #363 will NOT touch them, so `Btn` is kept
// here as a negative control: its mount cost should stay flat across a
// before/after comparison. `Divider`/`Pagination` are genuine #363 subjects
// (verified: neither calls `useDefaults` on this baseline) spanning a small
// vs. large declared-prop surface.
const DEFAULT_COMPONENTS = ['Divider', 'Pagination', 'Btn']
const DEFAULT_PROP_COUNTS = [5, 20, 50]
const DEFAULT_ITERATIONS = 2000
const DEFAULT_SERIES = 5
const DEFAULT_WARMUP = 300
const DEFAULT_BURNIN_SERIES = 1

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

function computeTimeoutMs (args) {
    const perCycleBudgetMs = 25
    const units = args.ab ? args.propCounts.length : args.components.length
    // Burn-in series run (warmup+iterations) cycles once; each measured
    // series runs warmup (discarded) + iterations (measured) cycles too —
    // same total per series either way. `--ab` does 2 mounts (A and B) per
    // measured cycle instead of 1.
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
        ab: false,
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
        } else if (a === '--components') {
            args.components = String(argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
        } else if (a.startsWith('--components=')) {
            args.components = a.slice('--components='.length).split(',').map((s) => s.trim()).filter(Boolean)
        } else if (a === '--prop-counts') {
            args.propCounts = String(argv[++i] ?? '').split(',').map((s) => Number(s.trim())).filter((n) => n)
        } else if (a.startsWith('--prop-counts=')) {
            args.propCounts = a.slice('--prop-counts='.length).split(',').map((s) => Number(s.trim())).filter((n) => n)
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
    if (args.ab) {
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
            throw new Error('--components must be a non-empty comma-separated list, e.g. --components Divider,Pagination,Btn')
        }
        for (const name of args.components) {
            if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
                throw new Error(`Invalid component name "${name}" — expected the bare family name (e.g. "Btn", not "OrigamBtn" or "Btn.vue")`)
            }
        }
    }
    for (const [key, value] of [['--iterations', args.iterations], ['--series', args.series], ['--warmup', args.warmup], ['--burnin-series', args.burninSeries]]) {
        const allowsZero = key === '--warmup' || key === '--burnin-series'
        if (!Number.isFinite(value) || value < 0 || (!allowsZero && value < 1)) {
            throw new Error(`${key} must be a positive number, got ${value}`)
        }
    }
}

function printUsage () {
    console.log(`
origam mount-cost benchmark

Usage:
  node bench/mount-cost.mjs [options]                  (real components)
  node bench/mount-cost.mjs --ab [options]              (interleaved A/B, synthetic)

Options:
  --components <A,B,C>   Comma-separated component family names, resolved as
                          @origam/components/{Name}/Origam{Name}.vue.
                          Ignored when --ab is set.
                          (default: ${DEFAULT_COMPONENTS.join(',')})
  --ab                    Interleaved A/B mode: synthetic components with an
                          identical prop surface, one plain, one wired with
                          useDefaults(_props) — reports the paired delta as
                          a % of baseline mount cost, with a 95% CI. This is
                          the mode that can actually arbitrate a 5% threshold;
                          real-component mode cannot (see file header).
  --prop-counts <a,b,c>   Prop-surface sizes to benchmark in --ab mode.
                          (default: ${DEFAULT_PROP_COUNTS.join(',')})
  --iterations <n>        Measured mounts (or A/B pairs) per series, per unit
                          (default: ${DEFAULT_ITERATIONS})
  --series <n>            Independent repetitions per unit (default: ${DEFAULT_SERIES})
  --warmup <n>            Discarded warm-up mounts per series (default: ${DEFAULT_WARMUP})
  --burnin-series <n>     Extra full series run before the measured ones and
                          entirely discarded — absorbs the one-time JIT /
                          module-init cost that otherwise inflates series #1
                          (default: ${DEFAULT_BURNIN_SERIES}, 0 to disable)
  --json <path>           Also write the full raw (combined) results as JSON
  --help                  Show this help

More than one component / prop-count value shards across isolated child
processes automatically (avoids cross-unit heap growth — see file header).

Examples:
  node bench/mount-cost.mjs --components Divider,Pagination,Btn
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

    const units = args.ab ? args.propCounts : args.components

    if (units.length <= 1) {
        await runSingleShard(args)
        return
    }

    console.log(`[mount-cost] sharding across ${units.length} ${args.ab ? 'prop-count' : 'component'} unit(s) — one isolated child process each\n`)

    const combined = {}
    let anyFailed = false

    for (const unit of units) {
        const shardArgs = args.ab
            ? { ...args, propCounts: [unit] }
            : { ...args, components: [unit] }
        const tmpJson = join(tmpdir(), `origam-mount-cost-${process.pid}-${unit}-${Math.random().toString(36).slice(2, 8)}.json`)
        shardArgs.json = tmpJson

        console.log(`[mount-cost] === shard: ${unit} ===`)
        const result = spawnSync(process.execPath, [__filename], {
            stdio: 'inherit',
            env: { ...process.env, ORIGAM_BENCH_SHARD_ARGS: JSON.stringify(shardArgs) }
        })

        if (result.status !== 0) {
            anyFailed = true
            console.error(`[mount-cost] shard "${unit}" exited with code ${result.status}`)
        }

        try {
            const raw = JSON.parse(readFileSync(tmpJson, 'utf-8'))
            Object.assign(combined, raw.results)
        } catch (err) {
            anyFailed = true
            console.error(`[mount-cost] shard "${unit}" produced no readable JSON: ${err.message}`)
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

    const unitLabel = args.ab ? `prop-counts=${args.propCounts.join(',')}` : `components=${args.components.join(',')}`
    console.log(`[mount-cost] ${args.ab ? 'AB' : 'real'} mode  ${unitLabel}  iterations=${args.iterations} series=${args.series} warmup=${args.warmup} burnin-series=${args.burninSeries}`)
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

    describe('origam useDefaults A/B benchmark', () => {
        it(
            `prop-counts ${args.propCounts.join(', ')} — ${args.iterations}×${args.series} series (+${args.warmup} warmup)`,
            async () => {
                const { createApp, defineComponent, h, nextTick, shallowRef } = await import('vue')
                const { createOrigam } = await import('@origam/origam')
                const { useDefaults } = await import('@origam/composables')

                const results = {}

                for (const n of args.propCounts) {
                    results[String(n)] = await benchmarkPropCount(n, args, {
                        createApp,
                        defineComponent,
                        h,
                        nextTick,
                        shallowRef,
                        createOrigam,
                        useDefaults
                    })
                }

                printAbReport(results, args)

                if (args.json) {
                    writeFileSync(args.json, JSON.stringify({ args, results }, null, 2))
                    console.log(`[mount-cost] raw results written to ${args.json}`)
                }

                expect(Object.keys(results).length, 'at least one prop-count must have benchmarked successfully').toBeGreaterThan(0)
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
 * Runs ONE interleaved A/B series and returns the raw paired samples.
 * `CompA`/`CompB` are created ONCE per prop-count (by `benchmarkPropCount`)
 * and reused across burn-in + every series here — recreating them per call
 * would pay Vue's per-component-definition normalization cost on every
 * series' first mount, reproducing exactly the "series #1 is slower"
 * artifact the burn-in mechanism exists to eliminate.
 *
 * Order within each pair is randomized (coin flip) specifically to cancel
 * any systematic "second mount in a pair runs warmer" bias — without this,
 * always measuring A-then-B would let B's number benefit from whatever
 * caches A's mount just populated, biasing the delta downward.
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

async function benchmarkPropCount (n, args, vueApi) {
    const { defineComponent, h, useDefaults } = vueApi
    const schema = buildSyntheticPropsSchema(n)
    const propKeys = Object.keys(schema)

    // A: plain props, no useDefaults — the baseline.
    const CompA = defineComponent({
        name: 'OrigamBenchSyntheticNoDefaults',
        props: schema,
        setup (props) {
            return () => h('span', null, propKeys.map((k) => props[k]).join(''))
        }
    })

    // B: identical prop surface, wired exactly like a real #363 component
    // would be — same schema, same withDefaults-equivalent (Vue's own
    // `default:` in the props options), only ADDITION is the useDefaults
    // wrap. Reads every prop through the resolved Proxy in the render, the
    // same way a real template binds many resolved props to the DOM.
    const CompB = defineComponent({
        name: 'OrigamBenchSyntheticWithDefaults',
        props: schema,
        setup (_props) {
            const props = useDefaults(_props)
            return () => h('span', null, propKeys.map((k) => props[k]).join(''))
        }
    })

    for (let b = 0; b < args.burninSeries; b++) {
        await runOneAbSeries(CompA, CompB, args.warmup + args.iterations, vueApi)
    }

    const seriesStats = []
    const allDiffs = []
    const allA = []
    const allB = []

    for (let s = 0; s < args.series; s++) {
        await runOneAbSeries(CompA, CompB, args.warmup, vueApi)

        const { diffs, asA, asB } = await runOneAbSeries(CompA, CompB, args.iterations, vueApi)

        allDiffs.push(diffs)
        allA.push(asA)
        allB.push(asB)

        const meanDiff = mean(diffs)
        const meanA = mean(asA)
        const sd = stddev(diffs)
        const se = sd / Math.sqrt(diffs.length)

        seriesStats.push({
            series: s + 1,
            n: diffs.length,
            meanA,
            meanB: mean(asB),
            meanDiff,
            medianDiff: median(diffs),
            stddevDiff: sd,
            ciLow: meanDiff - 1.96 * se,
            ciHigh: meanDiff + 1.96 * se,
            ratioPercent: meanA !== 0 ? (meanDiff / meanA) * 100 : NaN
        })
    }

    const pooledDiffs = allDiffs.flat()
    const pooledA = allA.flat()
    const pooledB = allB.flat()
    const pooledMeanDiff = mean(pooledDiffs)
    const pooledMeanA = mean(pooledA)
    const pooledMeanB = mean(pooledB)
    const pooledSd = stddev(pooledDiffs)
    const pooledSe = pooledSd / Math.sqrt(pooledDiffs.length)
    const pooledCiLow = pooledMeanDiff - 1.96 * pooledSe
    const pooledCiHigh = pooledMeanDiff + 1.96 * pooledSe
    const seriesMeanDiffs = seriesStats.map((st) => st.meanDiff)

    return {
        propCount: n,
        warmupPerSeries: args.warmup,
        iterationsPerSeries: args.iterations,
        seriesCount: args.series,
        burninSeries: args.burninSeries,
        series: seriesStats,
        pooled: {
            n: pooledDiffs.length,
            meanA: pooledMeanA,
            meanB: pooledMeanB,
            meanDiff: pooledMeanDiff,
            medianDiff: median(pooledDiffs),
            stddevDiff: pooledSd,
            // 95% CI on the paired mean delta, normal approximation
            // (SE = stddev(diffs)/sqrt(n)) — reasonable at these sample
            // sizes (thousands of pairs).
            ci95Low: pooledCiLow,
            ci95High: pooledCiHigh,
            ratioPercent: pooledMeanA !== 0 ? (pooledMeanDiff / pooledMeanA) * 100 : NaN,
            // CI on the ratio via the same delta, expressed as % of A's
            // mean — treats meanA as fixed, a fair approximation since A's
            // own relative SE is far smaller than the diff's at this n.
            ratioCi95LowPercent: pooledMeanA !== 0 ? (pooledCiLow / pooledMeanA) * 100 : NaN,
            ratioCi95HighPercent: pooledMeanA !== 0 ? (pooledCiHigh / pooledMeanA) * 100 : NaN
        },
        interSeries: {
            meanOfSeriesMeanDiffs: mean(seriesMeanDiffs),
            stddevOfSeriesMeanDiffs: stddev(seriesMeanDiffs),
            cvPercent: mean(seriesMeanDiffs) !== 0 ? (stddev(seriesMeanDiffs) / Math.abs(mean(seriesMeanDiffs))) * 100 : NaN
        }
    }
}

function printAbReport (results, args) {
    console.log('\n=== origam useDefaults A/B benchmark (interleaved, paired, synthetic) ===')
    console.log(`prop-counts: ${Object.keys(results).join(', ')}`)
    console.log(`iterations/series: ${args.iterations}  warmup/series: ${args.warmup}  series: ${args.series}  burnin-series: ${args.burninSeries}\n`)

    const summaryRows = []

    for (const key of Object.keys(results)) {
        const r = results[key]
        console.log(`--- ${key} props ---`)
        console.table(
            r.series.map((st) => ({
                series: st.series,
                n: st.n,
                'meanA(ms)': fmt(st.meanA),
                'meanB(ms)': fmt(st.meanB),
                'meanDiff(ms)': fmt(st.meanDiff),
                '95% CI(ms)': `[${fmt(st.ciLow)}, ${fmt(st.ciHigh)}]`,
                'ratio%': fmt(st.ratioPercent)
            }))
        )
        console.log(`pooled: n=${r.pooled.n} meanA=${fmt(r.pooled.meanA)}ms meanB=${fmt(r.pooled.meanB)}ms meanDiff=${fmt(r.pooled.meanDiff)}ms  95% CI=[${fmt(r.pooled.ci95Low)}, ${fmt(r.pooled.ci95High)}]ms`)
        console.log(`ratio: ${fmt(r.pooled.ratioPercent)}%  95% CI=[${fmt(r.pooled.ratioCi95LowPercent)}%, ${fmt(r.pooled.ratioCi95HighPercent)}%]`)
        console.log(`inter-series CV on meanDiff: ${fmt(r.interSeries.cvPercent)}%\n`)

        summaryRows.push({
            'prop count': key,
            'meanA(ms)': fmt(r.pooled.meanA),
            'meanB(ms)': fmt(r.pooled.meanB),
            'ratio%': fmt(r.pooled.ratioPercent),
            '95% CI (ratio%)': `[${fmt(r.pooled.ratioCi95LowPercent)}, ${fmt(r.pooled.ratioCi95HighPercent)}]`
        })
    }

    console.log('=== summary — useDefaults overhead vs prop count ===')
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
