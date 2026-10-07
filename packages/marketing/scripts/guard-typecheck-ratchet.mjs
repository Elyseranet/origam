#!/usr/bin/env node
/**
 * guard-typecheck-ratchet.mjs — the marketing `vue-tsc` error count may only
 * go DOWN, never up (decided by the owner, 2026-10-07).
 *
 * WHY THIS EXISTS
 *   `packages/marketing` declares a `typecheck` script (`nuxt typecheck`),
 *   and nothing in CI ever calls it. The `type-check` job
 *   (`.github/workflows/ci.yml`) only runs `pnpm -F origam run type-check` —
 *   its own comment says so plainly: "Hard gate: the DS must stay at ZERO
 *   vue-tsc errors." That gate was never meant to cover the marketing
 *   package, and it does not. The marketing site has accumulated a large,
 *   silent type-debt (measured 2026-10-07, `52b7bbd31`: 3332 errors) with
 *   no CI signal at all.
 *
 * WHY A RATCHET, NOT A FIX
 *   Fixing 3332 pre-existing errors is a separate, large piece of work —
 *   not this ticket's scope. A ratchet is the standard way to stop a debt
 *   from growing while it is paid down incrementally: it fails the build
 *   the moment the count goes ABOVE the recorded floor, and says nothing
 *   when it stays at or under it. The floor itself is a committed number
 *   (`guard-typecheck-ratchet-floor.json`, mirroring the `baseline/*.json`
 *   convention the DS guards use for violation SETS — here the committed
 *   value is a single integer because the underlying measure is a count,
 *   not a set of stable, individually-nameable violations vue-tsc does not
 *   expose a diffable id for).
 *
 * HOW TO LOWER THE FLOOR
 *   Fix some errors, re-run this guard with `--update-floor`, commit the
 *   new (lower) number in the SAME commit as the fix. Never raise it by
 *   hand — a PR that increases `maxErrors` without evidence the increase is
 *   unavoidable is the one thing this guard exists to catch in review.
 *
 * WHAT IT DOES NOT CATCH
 *   Nothing here identifies WHICH errors are new vs pre-existing — only the
 *   total count. A PR could fix 5 old errors and introduce 5 new ones and
 *   this guard would stay green (count unchanged). That trade-off is
 *   deliberate: vue-tsc gives no stable per-error id to diff against (file
 *   + line churns on every unrelated edit above it), so a baseline keyed on
 *   individual errors would be exactly the "baseline that only ever grows
 *   with noise" anti-pattern `lib/baseline.mjs`'s header warns against. The
 *   count-only ratchet is the honest version of what can actually be
 *   measured here.
 *
 * PREREQUISITE
 *   `nuxt typecheck` resolves `origam/interfaces` etc. against the DS
 *   package, so `packages/ds` must be BUILT first
 *   (`pnpm -F origam build` — ⛔ this rewrites
 *   `packages/ds/src/assets/css/main.css` as a side effect, a tooling
 *   defect worth fixing separately; `git checkout -- packages/ds/src/assets/css/main.css`
 *   afterwards if running this locally in a worktree that must not touch
 *   `packages/ds/src/`).
 *
 * Run:
 *   node scripts/guard-typecheck-ratchet.mjs
 *   node scripts/guard-typecheck-ratchet.mjs --update-floor
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const MARKETING_ROOT = resolve(HERE, '..')
const FLOOR_PATH = resolve(HERE, 'guard-typecheck-ratchet-floor.json')

/** Pure — counts `error TS` lines in `nuxt typecheck`'s combined output. */
export function countTypeErrors (output) {
    const matches = output.match(/error TS\d+:/g)
    return matches ? matches.length : 0
}

function loadFloor () {
    const raw = readFileSync(FLOOR_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    if (typeof parsed.maxErrors !== 'number' || !Number.isFinite(parsed.maxErrors)) {
        throw new Error(`${FLOOR_PATH} must contain {"maxErrors": <number>}`)
    }
    return parsed.maxErrors
}

function writeFloor (count) {
    writeFileSync(FLOOR_PATH, JSON.stringify({ maxErrors: count }, null, 4) + '\n')
}

function runTypecheck () {
    try {
        const out = execFileSync('pnpm', ['run', 'typecheck'], {
            cwd: MARKETING_ROOT,
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024
        })
        return out
    } catch (err) {
        // `nuxt typecheck` exits non-zero whenever there is at least one
        // error — that is the expected, non-exceptional case here. The
        // combined stdout/stderr still carries the `error TS…` lines we
        // need to count, on both execFileSync's error object and success.
        return (err.stdout ?? '') + (err.stderr ?? '')
    }
}

function run () {
    const output = runTypecheck()
    const count = countTypeErrors(output)

    if (process.argv.includes('--update-floor')) {
        writeFloor(count)
        console.log(`Floor written: maxErrors = ${count} -> ${FLOOR_PATH}`)
        process.exit(0)
    }

    const floor = loadFloor()
    const line = '─'.repeat(70)
    console.log(line)
    console.log('Guard: typecheck-ratchet (marketing vue-tsc error count may only go down)')
    console.log(line)

    if (count > floor) {
        console.log(`FAIL — ${count} error(s), floor is ${floor} (+${count - floor} new).`)
        console.log(`\nRe-run locally: pnpm -F @origam/marketing typecheck`)
        console.log(`(packages/ds must be built first: pnpm -F origam build)`)
        console.log(line)
        process.exit(1)
    }

    if (count < floor) {
        console.log(`PASS — ${count} error(s), floor is ${floor} (${floor - count} fixed since the floor was last recorded).`)
        console.log(`Consider lowering the floor: node scripts/guard-typecheck-ratchet.mjs --update-floor`)
    } else {
        console.log(`PASS — ${count} error(s), at the floor (${floor}).`)
    }
    console.log(line)
    process.exit(0)
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    run()
}
