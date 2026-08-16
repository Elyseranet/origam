import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/** Same knob as `playwright.config.ts` — the manifest guard reads it too. */
const HISTOIRE_PORT = process.env.E2E_HISTOIRE_PORT ?? '6006'

/*
 * Standalone Playwright config for `pnpm -F @origam/tests test:a11y`.
 *
 * Mirrors the e2e config but targets `a11y/` instead of `e2e/`. A
 * separate config (rather than overriding `testDir` from the CLI)
 * keeps Playwright happy — `testDir` is compile-time on the config
 * object and can't be re-pointed via CLI flags.
 *
 * Only runs on Chromium (axe-core results are browser-engine
 * independent; running on 3 engines triples the runtime for the
 * same violations). Add a `firefox` / `webkit` project here if
 * you ever need to verify engine-specific a11y quirks.
 */
export default defineConfig({
    testDir: './a11y',
    outputDir: './a11y/.results',

    // Same `reuseExistingServer` exposure as the e2e config: a foreign or
    // outdated Histoire on this port silently routes the wrong stories.
    // See e2e-global-setup.ts.
    globalSetup: './e2e-global-setup.ts',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,

    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,

    reporter: [
        ['html', { outputFolder: 'a11y/.report', open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: `http://localhost:${HISTOIRE_PORT}`,
        trace: 'on-first-retry'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    webServer: {
        // Spawn pnpm from the repo root so the workspace filter resolves.
        command: `pnpm -F @origam/stories dev --port ${HISTOIRE_PORT}`,
        cwd: REPO_ROOT,
        url: `http://localhost:${HISTOIRE_PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
