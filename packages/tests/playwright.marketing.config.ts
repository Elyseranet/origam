import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MARKETING_SPEC_PATTERNS } from './e2e/_support/marketing-specs.const'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/**
 * Specs verified green AND stable (5+ consecutive local runs, no flake) on
 * this config. CI runs ONLY these (`MARKETING_GREEN_ONLY=1`) — same pattern
 * as `GREEN_SPECS` in `playwright.config.ts`, kept separate because this
 * config targets the Nuxt dev server (:3000), not Histoire (:6006). Grows
 * wave by wave as the rest of `MARKETING_SPEC_PATTERNS` is stabilised. A
 * local run with no env var still executes the whole marketing suite.
 */
const MARKETING_GREEN_SPECS = [
    'nav-link-availability.spec.ts',
    'marketing-nav-ssr.spec.ts'
]

/**
 * Playwright configuration for marketing-site e2e specs.
 *
 * Separate from the default `playwright.config.ts` because that one
 * targets Histoire at :6006, whereas marketing tests target the Nuxt
 * dev server at :3000. A single config file cannot target two different
 * webServers, so we keep them apart.
 *
 * Run: `pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts`
 */
export default defineConfig({
    testDir: './e2e',
    testMatch: process.env.MARKETING_GREEN_ONLY === '1' ? MARKETING_GREEN_SPECS : MARKETING_SPEC_PATTERNS,
    outputDir: './e2e/.results-marketing',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,

    reporter: [
        ['html', { outputFolder: 'e2e/.report-marketing', open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: process.env.MARKETING_BASE_URL ?? 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    webServer: {
        command: 'NUXT_IGNORE_LOCK=1 pnpm -F @origam/marketing dev',
        cwd: REPO_ROOT,
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000
    }
})
