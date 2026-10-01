import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'

/*********************************************************
 * Config du harnais blockquote-preset
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

/*********************************************************
 * ORIGAM_DS_ROOT — l'A/B sans toucher l'arbre de travail
 *
 * @description
 * Le harnais importe le DS par l'alias `@ds-under-test` et non par un
 * chemin relatif, pour qu'une mesure « avant » n'exige PAS de revenir en
 * arriere dans la copie de travail. On extrait le `packages/ds` d'un
 * commit ailleurs (`git archive <sha> packages/ds | tar -x -C <tmp>`) et
 * on pointe l'alias dessus :
 *
 *     ORIGAM_DS_ROOT=<tmp>/packages/ds pnpm -F @origam/tests audit:blockquote-preset -- --json avant.json
 *
 * @description
 * ⛔ Pourquoi pas un `git checkout <sha> -- packages/ds`. Parce qu'il
 * MUTE l'arbre, et qu'un run interrompu laisse alors la copie de travail
 * sur un etat anterieur sans que rien ne le signale — exactement la forme
 * d'accident que le `CLAUDE.md` decrit a propos des refs partagees. Un
 * alias est reversible par construction : il n'y a rien a restaurer.
 *
 * @description
 * Les themes de `packages/marketing` ne passent PAS par l'alias : ils sont
 * l'entree de la mesure, pas son objet, et doivent rester identiques des
 * deux cotes de l'A/B.
 ********************************************************/
const DS_ROOT = process.env.ORIGAM_DS_ROOT
    ? resolve(process.env.ORIGAM_DS_ROOT)
    : resolve(HERE, '../../../ds')

export default {
    root: HERE,
    base: './',
    plugins: [vue()],
    resolve: {
        alias: { '@ds-under-test': DS_ROOT }
    },
    build: {
        outDir: resolve(HERE, 'dist'),
        emptyOutDir: true,
        sourcemap: false
    },
    logLevel: 'warn'
}
