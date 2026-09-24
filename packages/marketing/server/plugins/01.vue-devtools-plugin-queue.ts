// server/plugins/01.vue-devtools-plugin-queue.ts
//
// ⛔ #248 — le worker SSR de `nuxt dev` partait en OOM après ~1 100 rendus, en
// retenant une application Vue COMPLÈTE par requête dans la file d'attente des
// plugins Vue DevTools (`globalThis.__VUE_DEVTOOLS_PLUGINS__`), que rien ne vide
// jamais dans un worker Node.
//
// Le diagnostic complet, le chemin de rétention lu dans le heap snapshot et les
// chiffres avant/après sont dans `server/utils/devtools-plugin-queue.ts`, à côté
// du code qu'ils justifient. Le plugin lui-même ne fait qu'appeler la fonction
// au démarrage du serveur, donc bien avant la première requête (Nitro attend
// tous ses plugins avant d'écouter).
//
// ── Pourquoi `import.meta.dev` ───────────────────────────────────────────────
// Le défaut corrigé est celui du serveur de DEV : c'est là, et seulement là, que
// `vue-i18n` s'enregistre auprès des devtools à chaque rendu — son garde est
// `NODE_ENV !== 'production' || __VUE_PROD_DEVTOOLS__`. Vérifié sur le bundle de
// production : `setupDevtoolsPlugin` n'y est jamais appelé, donc la file ne s'y
// remplit pas et ce plugin n'y a rien à faire. Il est inoffensif en production,
// mais inoffensif n'est pas utile : on ne fait pas tourner chez les visiteurs un
// correctif dont le défaut n'existe pas chez eux.
//
// ⚠️ Le bornage est VÉRIFIÉ PAR LA MESURE, pas par construction : le témoin A/B
// de `packages/tests/bench/marketing-ssr-leak.mjs` a été rejoué avec la
// condition en place, au même seau rétréci de 1 216 Mo. Sans ce fichier le
// worker meurt toujours ; avec, il survit. La condition ne désarme donc pas le
// correctif là où il sert.
//
// ⚠️ Si un jour un build de production active `__VUE_PROD_DEVTOOLS__`, la fuite
// redevient possible en production et cette borne devra sauter.

import type { IDevtoolsQueueTarget } from '../interfaces/devtools-queue-target.interface'

export default defineNitroPlugin(() => {
    if (!import.meta.dev) return

    neutraliseVueDevtoolsPluginQueue(globalThis as unknown as IDevtoolsQueueTarget)
})
