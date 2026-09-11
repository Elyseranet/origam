import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/*
 * On-demand AUDIT config — deliberately NOT part of `test:unit:run`.
 *
 * The specs under `audit/` mount the whole component catalogue several times
 * over. That is the right shape for an audit and the wrong shape for a unit
 * suite: it is slow, it needs a raised heap, and an unbounded run exhausts
 * V8 outright. Keeping it under its own config means the default unit run
 * cannot be broken by it, while the audit stays runnable — and an audit
 * nobody can run observes nothing, which is the very defect this tooling
 * exists to catch.
 *
 * Entry point: `pnpm -F @origam/tests audit:inert-props` (shards the run
 * across separate processes — see audit/run-inert-props-audit.mjs).
 */
export default defineConfig({
    plugins: [
        vue(),
        tsconfigPaths({ projects: [resolve(REPO_ROOT, 'tsconfig.json')] })
    ],
    resolve: {
        /*
         * Declared explicitly rather than relying on `vite-tsconfig-paths`.
         * The root tsconfig's `include` covers `packages/ds/src/**` only;
         * `TU/` gets its mappings from its own `TU/tsconfig.json`, and
         * reproducing that indirection for a single audit directory buys
         * nothing but a resolution failure that only shows at run time
         * (`Failed to resolve import "@origam/origam"` — measured).
         */
        alias: [
            { find: /^@origam\/(.*)$/, replacement: `${resolve(REPO_ROOT, 'packages/ds/src')}/$1` },
            { find: /^@origam$/, replacement: resolve(REPO_ROOT, 'packages/ds/src') }
        ]
    },
    test: {
        include: ['audit/**/*.spec.ts'],
        exclude: ['node_modules/**', 'dist/**', 'TU/**', 'e2e/**', 'a11y/**', '.claude/**'],
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./TU/vitest.setup.ts'],
        globalSetup: ['./global-setup.ts']
    }
})
