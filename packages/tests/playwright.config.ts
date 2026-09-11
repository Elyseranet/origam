import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/**
 * Specs already migrated to the unified-story format and verified green.
 * CI runs ONLY these (set `E2E_GREEN_ONLY=1`) so the e2e job stays green while
 * the remaining specs are repaired wave by wave — add each spec here as it
 * goes green. A local run with no env var still executes the whole suite.
 */
const GREEN_SPECS = [
    'btn.spec.ts',
    'chip.spec.ts',
    'card.spec.ts',
    'avatar.spec.ts',
    'alert.spec.ts',
    'badge.spec.ts',
    'checkbox.spec.ts',
    'switch.spec.ts',
    'tooltip.spec.ts',
    // wave 2
    'divider.spec.ts',
    'kbd.spec.ts',
    'title.spec.ts',
    'breadcrumb.spec.ts',
    'text-field.spec.ts',
    'radio.spec.ts',
    'slider-field.spec.ts',
    'tabs.spec.ts',
    'label.spec.ts',
    // wave 3
    'select.spec.ts',
    'number-field.spec.ts',
    'password-field.spec.ts',
    'rating-field.spec.ts',
    'otp-input-field.spec.ts',
    'textarea-field.spec.ts',
    'list.spec.ts',
    'menu.spec.ts',
    'expansion-panel.spec.ts',
    // wave 4
    'dialog.spec.ts',
    'drawer.spec.ts',
    'snackbar.spec.ts',
    'stepper.spec.ts',
    'timeline.spec.ts',
    'treeview.spec.ts',
    'clipboard.spec.ts',
    'code.spec.ts',
    'empty-state.spec.ts',
    // wave 5
    'blockquote.spec.ts',
    'skeleton.spec.ts',
    'qr-code.spec.ts',
    'watermark.spec.ts',
    'masonry.spec.ts',
    'grid.spec.ts',
    'progress.spec.ts',
    'carousel.spec.ts',
    'counter.spec.ts',
    // wave 6 — specs réconciliées (drift variant-title résolu, commit 8bbe9ca4).
    // Flakiness cold-start mitigée en CI (workers=1, retries=1) ; durcissement +
    // ajout des specs -debug et des 12 specs complexes suivis dans le ticket DS #9.
    'app.spec.ts',
    'toolbar.spec.ts',
    'pagination.spec.ts',
    'parallax.spec.ts',
    'table.spec.ts',
    'timeline-debug.spec.ts',
    'color-picker.spec.ts',
    'color-picker-field.spec.ts',
    'theme-provider.spec.ts',
    'textarea-richtext.spec.ts',
    'defaults-provider.spec.ts',
    'field-height.spec.ts'
]

/**
 * Playwright configuration for origam.
 *
 * The unit tests stay in Vitest (`pnpm -F @origam/tests test:unit`); Playwright
 * owns the end-to-end + visual-regression layer.
 *
 * Histoire is started as a webServer so e2e specs can mount any component
 * by navigating to its story URL. This avoids spinning up a parallel
 * Vite dev server for each component under test.
 */
export default defineConfig({
    testDir: './e2e',
    outputDir: './e2e/.results',

    // CI gates on the migrated subset; locally the full suite still runs.
    testMatch: process.env.E2E_GREEN_ONLY === '1' ? GREEN_SPECS : undefined,

    // One spec per file; specs inside a file run sequentially (consistent
    // visual-regression baselines), but separate files parallelise.
    fullyParallel: true,

    // Forbid `test.only` in CI so a focused spec doesn't silently mask the
    // rest of the suite.
    forbidOnly: !!process.env.CI,

    // Retry once in CI to absorb flakes from animations / network blips —
    // never retry locally so the dev sees the failure as it happened.
    retries: process.env.CI ? 1 : 0,

    // CI serves the prebuilt static Histoire (E2E_STATIC), so there is no
    // per-story Vite cold-compile contention — run parallel to fit the time
    // budget. Single worker only when CI hits the live dev server.
    workers: process.env.CI ? (process.env.E2E_STATIC === '1' ? '100%' : 1) : undefined,

    reporter: [
        ['html', { outputFolder: 'e2e/.report', open: 'never' }],
        ['list']
    ],

    use: {
        // Histoire serves under /stories/ (vite.base = '/stories/' in histoire.config.js).
        // Story URLs must include the full prefix: page.goto('/stories/story/STORY_ID...')
        // Note: Playwright resolves absolute paths (starting with /) against the baseURL
        // host only, NOT the full baseURL path. Keep baseURL at origin level.
        baseURL: 'http://localhost:6006',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ],

    webServer: {
        // E2E_STATIC=1 (CI): serve the PREBUILT static Histoire via
        // `histoire preview` (the job runs `build:stories` first). No per-story
        // Vite cold-compile → fast + deterministic, which is what lets the job
        // fit its timeout and run parallel workers. Same /stories/story/... URLs.
        // Default (local): the live `histoire dev` server, reused if running.
        command: process.env.E2E_STATIC === '1'
            ? 'pnpm -F @origam/stories exec histoire preview -p 6006'
            : 'pnpm -F @origam/stories dev',
        cwd: REPO_ROOT,
        url: 'http://localhost:6006/stories/',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
