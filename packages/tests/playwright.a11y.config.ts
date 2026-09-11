import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

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

    fullyParallel: false,

    forbidOnly: !!process.env.CI,

    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,

    reporter: [
        ['html', { outputFolder: 'a11y/.report', open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: 'http://localhost:6006',
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
        command: 'pnpm -F @origam/stories dev',
        cwd: REPO_ROOT,
        url: 'http://localhost:6006',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
