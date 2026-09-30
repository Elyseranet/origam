import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'

/*********************************************************
 * Config du harnais kbd-preset
 *
 * @description
 * ⛔ PAS de `import { defineConfig } from 'vite'`, et PAS de devDep `vite`
 * dans `packages/tests/package.json`. Avec `auto-install-peers=true`,
 * `vite` arrive comme PAIR de `@vitejs/plugin-vue` ; une plage ecrite a la
 * main desynchronise le lockfile et tue tous les jobs de CI a
 * `Install dependencies`. Un import du PAQUET `vite` echoue aussi : un pair
 * auto-installe recoit un lien de binaire, pas un import resoluble au
 * niveau du paquet consommateur. `defineConfig` n'etant qu'une aide au
 * typage, un objet nu est equivalent.
 *
 * @description
 * Meme raisonnement et meme forme que `../dark-contrast/vite.config.mjs` —
 * lire son en-tete, plus long, avant de toucher a l'un ou a l'autre.
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
