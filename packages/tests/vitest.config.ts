import vue from "@vitejs/plugin-vue"
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from "vitest/config"
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

export default defineConfig({
    plugins: [
        vue(),
        // Walk up to the repo root tsconfig.json so the @origam / @stories /
        // @docs path aliases resolve consistently with the rest of the build.
        tsconfigPaths({
            projects: [resolve(REPO_ROOT, 'tsconfig.json')]
        })
    ],
    resolve: {
        alias: {
            // `~` is the Nuxt-managed alias for `@origam/marketing`'s own
            // `src/` (defined per-app in packages/marketing/nuxt.config.ts,
            // not visible outside the Nuxt build). Registered here so pure
            // (non-Nuxt-runtime) marketing utils under TU/marketing/ can be
            // unit tested without duplicating their import paths.
            '~': resolve(REPO_ROOT, 'packages/marketing/src'),
            // TU/marketing/*.spec.ts pull in marketing source that imports
            // the PUBLISHED `origam/<subpath>` package names (the same way a
            // real consumer app would), unlike the DS's own TU specs which
            // import straight from `packages/ds/src` via the `@origam/*`
            // tsconfig path above. `origam/<subpath>` resolves through
            // package.json `exports` to `dist/src/<subpath>/index.js` — a
            // build artifact `pnpm -F origam tokens:build` (the only DS
            // prerequisite the CI unit-test job runs) never produces. Alias
            // the plain-TS barrel subpaths straight to source so these specs
            // don't require a full `pnpm -F origam build` just to resolve an
            // enum import.
            'origam/enums': resolve(REPO_ROOT, 'packages/ds/src/enums/index.ts'),
            'origam/utils': resolve(REPO_ROOT, 'packages/ds/src/utils/index.ts'),
            'origam/consts': resolve(REPO_ROOT, 'packages/ds/src/consts/index.ts'),
            'origam/types': resolve(REPO_ROOT, 'packages/ds/src/types/index.ts'),
            'origam/interfaces': resolve(REPO_ROOT, 'packages/ds/src/interfaces/index.ts')
        }
    },
    test: {
        /*
         * The vitest root is pinned to the monorepo root so coverage can
         * instrument the library source under `packages/ds/src` — the v8
         * provider only maps files located inside the project root, and the
         * specs live in a sibling package (`packages/tests`). All include /
         * exclude / setup globs below are therefore repo-root-relative.
         *
         * Unit tests live in `packages/tests/TU/`, mirroring the
         * `packages/ds/src/` tree (e.g.
         * `packages/ds/src/composables/Foo/foo.composable.ts` → its spec
         * is at `packages/tests/TU/composables/Foo/foo.composable.spec.ts`).
         *
         * - `e2e/` runs via Playwright (own config) — keep out of vitest
         *   discovery so `test.describe` doesn't collide with Playwright's
         *   runtime.
         * - `a11y/` runs via Playwright (separate config) — same reason.
         * - `.claude/worktrees/**` holds throwaway git worktrees spawned
         *   by parallel Claude agents — must NOT be collected (would
         *   multiply the run by N and surface unrelated branch failures).
         */
        include: ['TU/**/*.spec.ts'],
        exclude: ['node_modules/**', 'dist/**', 'e2e/**', 'a11y/**', '.claude/**', '../../**/node_modules/**', '../../.claude/**'],
        globals: true,
        environment: 'jsdom',
        /*
         * jsdom@25+ does NOT expose the Web Pointer Events spec
         * (PointerEvent class is undefined). useSheetSwipe relies on it
         * for synthetic gesture dispatch. The setup file (loaded before
         * every spec) polyfills PointerEvent on the jsdom window so
         * those tests run unmodified. happy-dom was tested as an
         * alternative environment but broke 5 unrelated specs
         * (sanitize-html string normalisation, ssr-smoke class shape).
         */
        setupFiles: ['./TU/vitest.setup.ts'],
        /*
         * Runs once, before Vite starts transforming any file — see
         * global-setup.ts for why: `packages/marketing/tsconfig.json`
         * extends a git-ignored, Nuxt-generated file that a fresh CI
         * runner never produces (marketing's own `postinstall` script
         * deliberately no-ops `nuxt prepare` in CI), which crashes
         * Vite's built-in per-file tsconfig lookup for every TU/marketing
         * spec with a hard TSConfckParseError.
         */
        globalSetup: ['./global-setup.ts'],
        coverage: {
            provider: 'v8',
            /*
             * text-summary: terminal output (no options needed).
             * lcov: SF paths must be relative to the repo root so SonarQube
             *       (running with sonar.sources=packages at the repo root)
             *       can resolve them. Passing projectRoot=REPO_ROOT forces
             *       istanbul-reports/lcovonly to compute
             *       `path.relative(REPO_ROOT, absoluteFilePath)` instead of
             *       the default `path.relative(packages/tests, …)` which
             *       produces unusable `../ds/src/…` paths.
             */
            reporter: ['text-summary', ['lcov', { projectRoot: REPO_ROOT }]],
            reportsDirectory: resolve(REPO_ROOT, 'coverage'),
            /*
             * allowExternal: true is REQUIRED for cross-package coverage in a
             * pnpm monorepo. Without it, @vitest/coverage-v8 passes
             * `relativePath: true` to the underlying TestExclude instance,
             * which calls `isOutsideDir(cwd, filename)` and returns false for
             * every file whose absolute path sits outside the vitest root
             * (here `packages/tests`). All `packages/ds/src/**` files are
             * therefore silently excluded — producing the 0/0 SF=0 symptom.
             *
             * With allowExternal: true, relativePath is false, so pathToCheck
             * is the raw absolute path. The include patterns below must therefore
             * be absolute strings (resolved via REPO_ROOT) so that minimatch can
             * compare them against the absolute file paths reported by V8.
             */
            allowExternal: true,
            include: [`${resolve(REPO_ROOT, 'packages/ds/src')}/**/*.{ts,vue}`],
            exclude: [
                '**/*.d.ts',
                '**/*.story.vue',
                `${resolve(REPO_ROOT, 'packages/ds/src')}/index.ts`,
                `${resolve(REPO_ROOT, 'packages/ds/src')}/**/index.ts`,
                `${resolve(REPO_ROOT, 'packages/ds/src')}/interfaces/**`,
                `${resolve(REPO_ROOT, 'packages/ds/src')}/types/**`,
                `${resolve(REPO_ROOT, 'packages/ds/src')}/enums/**`
            ],
            all: true,
            clean: true
        }
    }
})
