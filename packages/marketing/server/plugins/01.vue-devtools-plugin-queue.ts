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

import type { IDevtoolsQueueTarget } from '../interfaces/devtools-queue-target.interface'

export default defineNitroPlugin(() => {
    neutraliseVueDevtoolsPluginQueue(globalThis as unknown as IDevtoolsQueueTarget)
})
