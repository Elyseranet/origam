import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/**
 * Standalone Playwright config for the marketing site's a11y sweep.
 *
 * WHY A SEPARATE CONFIG (not a second `projects[]` entry in
 * `playwright.a11y.config.ts`) — same reasoning `playwright.marketing.config.ts`
 * already gives for the e2e split, applied here: this repo's convention is
 * one config per `webServer` target, and Playwright's `webServer` option is
 * top-level, not per-project — a second project can pick a different
 * `baseURL`, but not a different server to boot. `playwright.a11y.config.ts`
 * boots Histoire (:6006); this one boots the marketing Nuxt app (:3000).
 * Mirrors the existing e2e / marketing-e2e split 1:1 rather than inventing
 * a new pattern.
 *
 * WHY THIS EXISTS — `packages/tests/a11y/components.spec.ts` only ever
 * scans component Variants mounted inside a Histoire story iframe, and
 * explicitly ignores `region`, `landmark-one-main`, `page-has-heading-one`,
 * `document-title`, `html-has-lang`, `html-lang-valid` — defensible for an
 * iframe fragment with no page chrome, indefensible for a real page. This
 * config sweeps actual marketing PAGES (full document, real `<html lang>`,
 * real landmarks) with none of those rules ignored.
 */
export default defineConfig({
    testDir: './a11y',
    testMatch: ['**/marketing-a11y.spec.ts'],
    outputDir: './a11y/.results-marketing',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,

    reporter: [
        ['html', { outputFolder: 'a11y/.report-marketing', open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: process.env.MARKETING_BASE_URL ?? 'http://localhost:3000',
        trace: 'on-first-retry'
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
