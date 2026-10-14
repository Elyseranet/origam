import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'

/*********************************************************
 * Config du harnais skeleton-contrast
 *
 * @description
 * Meme raisonnement et meme forme que `../kbd-preset/vite.config.mjs` —
 * lire son en-tete avant de toucher a l'un ou a l'autre (pas d'import du
 * paquet `vite`, pas de devDep `vite`).
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
