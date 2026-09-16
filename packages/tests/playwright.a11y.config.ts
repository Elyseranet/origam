import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scratchDirPatterns } from './scratch-dirs.const'
import { HISTOIRE_BASE_PATH } from './e2e/_support/histoire-manifest.const'

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
    // 'marketing-a11y.spec.ts' targets the Nuxt marketing app (:3000) via
    // `playwright.a11y.marketing.config.ts` and its own `MARKETING_BASE_URL`.
    // It lives in the same `./a11y` directory, so without this it would also
    // run here against Histoire's baseURL, where its DOM never exists — the
    // exact harness-scoping bug `e2e/_support/marketing-specs.const.ts`
    // documents for the e2e side.
    testIgnore: [...scratchDirPatterns('./a11y'), '**/marketing-a11y.spec.ts'],
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
        //
        // E2E_STATIC=1 (CI): serve the PREBUILT static Histoire via
        // `histoire preview` (the job runs the stories build first) instead of
        // paying a per-story Vite cold-compile. Meme knob et meme raison que
        // `playwright.config.ts` (ou le gain mesure sur la suite e2e est de
        // 3.4x — root CLAUDE.md, "Running the full e2e suite" ; ce facteur
        // n'a PAS ete remesure pour la suite a11y). Defaut (local) : le
        // serveur `histoire dev` vivant, reutilise s'il tourne deja.
        command: process.env.E2E_STATIC === '1'
            ? `pnpm -F @origam/stories exec histoire preview -p ${HISTOIRE_PORT}`
            // No `--` separator: pnpm would forward it literally to the script
            // and the server would silently bind the default 6006 instead.
            : `pnpm -F @origam/stories dev --port ${HISTOIRE_PORT}`,
        cwd: REPO_ROOT,
        // Probe the base path, not `/`. `histoire preview` serves a plain
        // static tree under `vite.base` and answers 404 on `/`, which is NOT
        // one of the statuses Playwright accepts as "server is up" — the job
        // would hang until `timeout` and die before the first spec.
        url: `http://localhost:${HISTOIRE_PORT}${HISTOIRE_BASE_PATH}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
