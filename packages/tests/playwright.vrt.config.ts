import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/** Same knob as `playwright.config.ts` — the manifest guard reads it too. */
const HISTOIRE_PORT = process.env.E2E_HISTOIRE_PORT ?? '6006'

/*
 * Standalone Playwright config for `pnpm -F @origam/tests test:vrt`.
 *
 * Full rationale: packages/tests/vrt/VRT.md. Short version — this is a
 * SEPARATE suite from the functional e2e gate (playwright.config.ts) on
 * purpose:
 *
 *   - A screenshot diff is a different failure mode than a broken locator
 *     or a failed assertion. Mixing them makes a red CI run ambiguous:
 *     "the app broke" vs. "a button moved 2px". Two gates, two meanings.
 *   - Visual baselines are platform-sensitive (anti-aliasing, font
 *     fallback, sub-pixel rendering differ between macOS and Linux). This
 *     suite is ONLY meaningful when the comparison runs on the same OS +
 *     fontconfig the baseline was captured on. See VRT.md for the pinned
 *     Docker image used for both baseline capture and CI comparison.
 *   - chromium only, single worker, ZERO retries. A retry that turns a red
 *     run green would hide the exact ambiguity (flaky non-determinism vs.
 *     a real visual regression) this suite exists to resolve. If a VRT
 *     spec is flaky, that is itself a bug to fix (missing animation
 *     disable, unstabilised async content, …), never something to retry
 *     away.
 *
 * Snapshot file naming keeps Playwright's default template, which embeds
 * `{platform}` (e.g. `-linux.png`). Because both the baseline-generation
 * recipe (VRT.md → Docker) and the CI job run inside the SAME pinned Linux
 * container, `process.platform` reports `linux` in both places and the
 * filenames line up without any custom `snapshotPathTemplate`. Running the
 * suite natively on a contributor's macOS machine produces `-darwin.png`
 * files instead — these are gitignored (see root .gitignore) so an
 * accidental native run can never silently commit an untrustworthy
 * baseline.
 */
export default defineConfig({
    testDir: './vrt',
    outputDir: './vrt/.results',

    // Same `reuseExistingServer` exposure as the e2e config, and worse here:
    // a stale server would produce visually plausible screenshots against the
    // wrong Variants, silently poisoning the baselines. See e2e-global-setup.ts.
    globalSetup: './e2e-global-setup.ts',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,

    retries: 0,
    workers: 1,

    reporter: [
        ['html', { outputFolder: 'vrt/.report', open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: `http://localhost:${HISTOIRE_PORT}`,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    webServer: {
        // The VRT suite only ever runs against the prebuilt static Histoire
        // (never `histoire dev`) — HMR / cold Vite compiles are exactly the
        // kind of non-determinism this suite must not depend on.
        command: `pnpm -F @origam/stories exec histoire preview -p ${HISTOIRE_PORT}`,
        cwd: REPO_ROOT,
        url: `http://localhost:${HISTOIRE_PORT}/stories/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
