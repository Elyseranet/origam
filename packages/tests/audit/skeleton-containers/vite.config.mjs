import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'

/*********************************************************
 * Config du harnais skeleton-containers
 *
 * @description
 * Meme forme que `../skeleton-contrast/vite.config.mjs` — lire son
 * en-tete avant de toucher a l'un ou a l'autre.
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
