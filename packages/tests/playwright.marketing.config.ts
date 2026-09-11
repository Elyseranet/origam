import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

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
    testMatch: ['**/marketing-theming.spec.ts', '**/marketing-theming-isolation.spec.ts', '**/marketing-theme-builder.spec.ts', '**/marketing-theming-controls.spec.ts', '**/marketing-theming-viewport-height.spec.ts', '**/marketing-theming-theme-bg-and-triggers.spec.ts', '**/marketing-brand-presets.spec.ts', '**/marketing-theming-toggle-vs-split-parity.spec.ts', '**/marketing-theme-live-switch.spec.ts', '**/theming-feedback-tokens.spec.ts', '**/home-*.spec.ts', '**/why-origam.spec.ts', '**/roadmap.spec.ts', '**/changelog.spec.ts', '**/installation.spec.ts', '**/directives.spec.ts', '**/components.spec.ts', '**/wireframe.spec.ts', '**/types.spec.ts', '**/composables.spec.ts', '**/nav-link-availability.spec.ts', '**/api-docs-generated.spec.ts'],
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
