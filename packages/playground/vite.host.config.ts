import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import path from 'node:path'

/*
 * The standalone host — "a minimal page to open it" (lot 2). Rooted at this
 * package like the metadata-chain scripts (see `scripts/extract-runtime-
 * metadata.mjs`'s own header), for the same reason: `vue` must resolve
 * through THIS package's `node_modules` symlink, not the workspace root's
 * (pnpm's isolated layout puts no `node_modules/vue` there).
 *
 * `origam` is aliased to DS SOURCE rather than left to resolve through
 * `package.json` `exports` → `dist/`, because `packages/ds` is not built in
 * a fresh checkout and this host must open from one. Mirrors the alias set
 * `packages/tests/vitest.config.ts` and `scripts/extract-runtime-
 * metadata.mjs` already use.
 */
const DS_SRC = path.resolve(__dirname, '../ds/src')

export default defineConfig({
    root: __dirname,
    plugins: [vue()],
    server: {
        port: 5183,
        fs: { allow: [path.resolve(__dirname, '../..')] }
    },
    resolve: {
        /*
         * ⛔ Order matters: Vite's object-form `alias` matches a string
         * `find` both exactly AND as a `find + '/'` prefix (the same
         * mechanism that lets `@/foo` resolve from a plain `@` alias) — the
         * FIRST matching entry wins. A bare `origam` key placed before the
         * subpath entries swallows every `origam/*` import (rewriting
         * `origam/styles` to `.../origam.ts/styles`, which then 404s) before
         * its own specific entry is ever reached. Every `origam/<subpath>`
         * entry must therefore come BEFORE the bare `origam` entry.
         */
        alias: {
            'origam/composables': path.join(DS_SRC, 'composables/index.ts'),
            'origam/components': path.join(DS_SRC, 'components/index.ts'),
            'origam/enums': path.join(DS_SRC, 'enums/index.ts'),
            'origam/consts': path.join(DS_SRC, 'consts/index.ts'),
            'origam/types': path.join(DS_SRC, 'types/index.ts'),
            'origam/interfaces': path.join(DS_SRC, 'interfaces/index.ts'),
            'origam/utils': path.join(DS_SRC, 'utils/index.ts'),
            'origam/styles': path.join(DS_SRC, 'assets/css/main.css'),
            origam: path.join(DS_SRC, 'origam.ts')
        }
    }
})
