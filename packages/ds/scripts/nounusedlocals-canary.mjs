#!/usr/bin/env node
/**
 * Canary — re-enable `noUnusedLocals` when @vue/language-core supports TS 6.
 *
 * WHY THIS EXISTS
 * ---------------
 * `packages/ds/tsconfig.json` sets `noUnusedLocals` / `noUnusedParameters` to
 * FALSE. That is a temporary workaround: under TypeScript 6 the vue-tsc engine
 * (@vue/language-core 3.3.x) does not mark template-ref bindings (`ref="x"`) as
 * a use of the `<script setup>` variable, so `noUnusedLocals` reports dozens of
 * FALSE-POSITIVE TS6133 errors on functional template refs (some owned by
 * composables, e.g. `useIntersectionObserver`, which cannot be removed).
 * See the PR "restore green vue-tsc gate under TypeScript 6".
 *
 * The condition can only change when @vue/language-core is upgraded. This canary
 * runs in that exact moment (a dependabot bump triggers CI) and tells us whether
 * the upstream fix has landed:
 *
 *   - installed @vue/language-core <= LAST_BROKEN  → known-broken, stay OFF (pass).
 *   - installed @vue/language-core  > LAST_BROKEN  → probe by type-checking the DS
 *       with `noUnusedLocals` forced ON:
 *         · still errors on template refs → upstream not fixed yet (pass, stay OFF).
 *         · ZERO errors                   → FIXED → FAIL loudly so we re-enable it.
 *
 * TO RE-ENABLE (when this canary fails green-light):
 *   1. Remove `noUnusedLocals`/`noUnusedParameters: false` from packages/ds/tsconfig.json.
 *   2. Run `pnpm -F origam type-check` → confirm 0 errors.
 *   3. Delete this script + its `type-check:canary` package.json entry + CI step.
 *
 * FAIL-OPEN: this canary must NEVER redden CI on its own errors. If it cannot
 * resolve the engine version or the probe blows up, it exits 0 (stay OFF) with a
 * warning. It only exits 1 when it AFFIRMATIVELY confirms the upstream fix landed.
 *
 * Exit codes: 0 = nothing to do (stay OFF, or could not determine). 1 = re-enable now.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DS_ROOT = resolve(__dirname, '..')
const require = createRequire(import.meta.url)

// Highest @vue/language-core version KNOWN to false-positive on template refs
// under TS 6. Bump this if a newer version is confirmed still-broken.
const LAST_BROKEN = '3.3.6'

function cmp (a, b) {
    const pa = a.split('.').map(Number)
    const pb = b.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
        if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0)
    }
    return 0
}

function installedLanguageCoreVersion () {
    // @vue/language-core is a (transitive) dependency of vue-tsc, not a direct
    // dependency of the DS package. Under pnpm's strict, non-hoisted layout it
    // is NOT resolvable from DS_ROOT — resolve it FROM vue-tsc's location.
    const paths = [DS_ROOT]
    try {
        const vueTscPkg = require.resolve('vue-tsc/package.json', { paths: [DS_ROOT] })
        paths.unshift(dirname(vueTscPkg))
    } catch { /* fall back to DS_ROOT below */ }
    const pkg = require.resolve('@vue/language-core/package.json', { paths })
    return require(pkg).version
}

function countTemplateRefUnusedErrors () {
    // Force noUnusedLocals ON via a throwaway tsconfig that extends the DS one.
    // The throwaway config must live INSIDE the DS (not in os.tmpdir()):
    // `types: ["node"]` / typeRoots resolve relative to the config file, so a
    // tmpdir copy dies with TS2688, reports zero TS6133 and reads as "fixed".
    const dir = mkdtempSync(join(DS_ROOT, '.origam-canary-'))
    const tsconfigPath = join(dir, 'tsconfig.canary.json')
    writeFileSync(tsconfigPath, JSON.stringify({
        extends: join(DS_ROOT, 'tsconfig.json'),
        compilerOptions: { noUnusedLocals: true, noUnusedParameters: true }
    }))
    try {
        execFileSync(vueTscBin(), ['--noEmit', '-p', tsconfigPath], {
            cwd: DS_ROOT, stdio: 'pipe'
        })
        return 0 // vue-tsc exited 0 → no errors → the fix has landed
    } catch (e) {
        // Distinguish "vue-tsc ran and reported errors" (has an exit status) from
        // a spawn failure (ENOENT, no status) — the latter must NOT read as 0.
        if (e.status == null) throw e
        const out = `${e.stdout ?? ''}${e.stderr ?? ''}`
        const unused = (out.match(/error TS6133/g) ?? []).length
        // Failed for another reason: inconclusive, never read it as "fixed".
        if (unused === 0) throw new Error('vue-tsc failed without any TS6133: ' + out.slice(0, 200))
        return unused
    } finally {
        rmSync(dir, { recursive: true, force: true })
    }
}

/** Resolve the vue-tsc executable robustly under pnpm's layout. */
function vueTscBin () {
    const local = join(DS_ROOT, 'node_modules', '.bin', 'vue-tsc')
    if (existsSync(local)) return local
    const root = resolve(DS_ROOT, '..', '..', 'node_modules', '.bin', 'vue-tsc')
    if (existsSync(root)) return root
    // Last resort: derive from the resolved vue-tsc package.
    const pkg = require.resolve('vue-tsc/package.json', { paths: [DS_ROOT] })
    return join(dirname(pkg), 'bin', 'vue-tsc.js')
}

try {
    const version = installedLanguageCoreVersion()

    if (cmp(version, LAST_BROKEN) <= 0) {
        console.log(`[canary] @vue/language-core ${version} <= ${LAST_BROKEN} — known TS6 template-ref limitation. noUnusedLocals stays OFF. OK.`)
        process.exit(0)
    }

    console.log(`[canary] @vue/language-core ${version} > ${LAST_BROKEN} — probing whether noUnusedLocals can be re-enabled…`)
    const errors = countTemplateRefUnusedErrors()

    if (errors === 0) {
        console.error(
            `\n[canary] ✅ @vue/language-core ${version} no longer false-positives on template refs.\n` +
            `         → RE-ENABLE noUnusedLocals: remove the "noUnusedLocals"/"noUnusedParameters": false\n` +
            `           overrides from packages/ds/tsconfig.json, confirm \`pnpm -F origam type-check\` is 0,\n` +
            `           then delete this canary (script + package.json entry + CI step).\n`
        )
        process.exit(1)
    }

    console.log(`[canary] @vue/language-core ${version} still reports ${errors} template-ref TS6133 — staying OFF. OK.`)
    process.exit(0)
} catch (err) {
    // FAIL-OPEN: never redden CI on the canary's own resolution/probe errors.
    console.warn(`[canary] could not evaluate (${err?.message ?? err}) — assuming noUnusedLocals stays OFF. OK.`)
    process.exit(0)
}
