import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * Regression test for #534 — "pretest:e2e bloque Playwright avant demarrage
 * tout en rendant exit 0".
 *
 * `packages/tests/package.json`'s `pretest:e2e` script is exactly
 * `node e2e/_support/run-guards.mjs`: whatever exit code this file produces
 * IS the exit code a caller (a human, CI, `pnpm run test:e2e`) sees before a
 * single Playwright spec starts. The bug report claimed that a failing guard
 * still let that exit code read as 0 — a green result for a suite that never
 * ran.
 *
 * This spec proves the opposite for the current code by running the REAL
 * script (not a reimplementation of its logic) as a child process, pointed
 * at synthetic guards we control via RUN_GUARDS_FIXTURE_FILES (see the
 * script's own comment on that env var). Using a fixture instead of the real
 * `audit-variant-titles.mjs` / `audit-variant-pins.mjs` guards keeps this
 * spec independent of whatever drift those two happen to have on a given day
 * (variant-titles was observed red on 2026-08-31 for unrelated reasons —
 * this spec must stay meaningful regardless of that state).
 */

const HERE = dirname(fileURLToPath(import.meta.url))
const RUN_GUARDS_SCRIPT = resolve(HERE, '..', '..', 'e2e', '_support', 'run-guards.mjs')

let tmpDir: string | undefined

afterEach(() => {
    if (tmpDir) {
        rmSync(tmpDir, { recursive: true, force: true })
        tmpDir = undefined
    }
})

function writeFixtureGuard(dir: string, name: string, exitCode: number): string {
    const file = join(dir, name)
    writeFileSync(file, `process.exit(${exitCode})\n`)
    return file
}

function runGuardsWithFixtures(files: string[]) {
    return spawnSync(process.execPath, [RUN_GUARDS_SCRIPT], {
        env: { ...process.env, RUN_GUARDS_FIXTURE_FILES: files.join(',') },
        encoding: 'utf-8'
    })
}

describe('e2e/_support/run-guards.mjs — #534 (pretest:e2e exit-code propagation)', () => {
    it('exits non-zero when a guard fails — Playwright must never look green after being blocked', () => {
        tmpDir = mkdtempSync(join(tmpdir(), 'run-guards-'))
        const passing = writeFixtureGuard(tmpDir, 'passing.mjs', 0)
        const failing = writeFixtureGuard(tmpDir, 'failing.mjs', 1)

        const result = runGuardsWithFixtures([passing, failing])

        expect(result.status).not.toBe(0)
        expect(result.status).not.toBeNull()
    })

    it('exits zero when every guard passes — the hook does not cry wolf', () => {
        tmpDir = mkdtempSync(join(tmpdir(), 'run-guards-'))
        const passingA = writeFixtureGuard(tmpDir, 'passing-a.mjs', 0)
        const passingB = writeFixtureGuard(tmpDir, 'passing-b.mjs', 0)

        const result = runGuardsWithFixtures([passingA, passingB])

        expect(result.status).toBe(0)
    })

    it('treats a guard killed by a signal as a failure, not a silent pass', () => {
        tmpDir = mkdtempSync(join(tmpdir(), 'run-guards-'))
        // A guard that kills itself never reaches process.exit(); spawnSync
        // reports { status: null, signal: 'SIGKILL' } for it. run-guards.mjs
        // must not read that as 0.
        const killed = join(tmpDir, 'killed.mjs')
        writeFileSync(killed, `process.kill(process.pid, 'SIGKILL')\n`)
        const passing = writeFixtureGuard(tmpDir, 'passing.mjs', 0)

        const result = runGuardsWithFixtures([passing, killed])

        expect(result.status).not.toBe(0)
        expect(result.status).not.toBeNull()
    })
})
