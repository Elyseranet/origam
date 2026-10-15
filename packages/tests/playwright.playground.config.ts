import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/**
 * Playground specs — they target the standalone playground host
 * (`pnpm -F @origam/playground dev`), not Histoire and not the Nuxt site, so
 * they live in their own directory and their own config: a spec under
 * `./e2e` would be picked up by `playwright.config.ts` and pointed at
 * Histoire's baseURL, where the playground's DOM never exists.
 *
 * ⛔ `--strictPort`: without it Vite silently moves to the next free port
 * when the requested one is taken, while `url` below keeps probing the
 * requested one — i.e. a NEIGHBOUR's server. Check the owner first
 * (`lsof -ti :<port>`), or set `E2E_PLAYGROUND_PORT`.
 */
const PLAYGROUND_PORT = process.env.E2E_PLAYGROUND_PORT ?? '5183'

export default defineConfig({
    testDir: './e2e-playground',
    outputDir: './e2e-playground/.results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: `http://localhost:${PLAYGROUND_PORT}`,
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
    ],
    webServer: {
        command: `pnpm -F @origam/playground dev --port ${PLAYGROUND_PORT} --strictPort`,
        cwd: REPO_ROOT,
        url: `http://localhost:${PLAYGROUND_PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
