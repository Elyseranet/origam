import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'

/*********************************************************
 * ⛔ NO `import { defineConfig } from 'vite'`, AND NO `vite` DEVDEP.
 *
 * @description
 * Same constraint as `../dark-contrast/vite.config.mjs` — read that file's
 * long comment before touching this one. Short version: `vite` and `sass`
 * arrive as auto-installed peers of the already-declared `@vitejs/plugin-vue`
 * (`auto-install-peers=true` in `.npmrc`); adding either as an explicit
 * devDep here desynchronises the lockfile and fails `Install dependencies`
 * in CI. The audit script resolves the `vite` binary itself through
 * `@vitejs/plugin-vue`'s own realpath (`resolveViteBin()`), not through PATH.
 ********************************************************/

const HERE = dirname(fileURLToPath(import.meta.url))

export default {
    root: HERE,
    base: './',
    plugins: [vue()],
    build: {
        outDir: resolve(HERE, 'dist'),
        emptyOutDir: true,
        sourcemap: false
    },
    logLevel: 'warn'
}
