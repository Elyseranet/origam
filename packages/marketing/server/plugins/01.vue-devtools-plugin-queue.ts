// server/plugins/01.vue-devtools-plugin-queue.ts
//
// ⛔ #248 — neutralise la file d'attente des plugins Vue DevTools CÔTÉ SERVEUR.
// C'est la cause de l'OOM du worker SSR de `nuxt dev`, mesurée et non supposée.
//
// ── Ce qui se passe sans ce plugin ───────────────────────────────────────────
// 1. Nuxt crée UNE application Vue PAR REQUÊTE SSR.
// 2. `vue-i18n` s'enregistre auprès des devtools à chaque `app.use(i18n)` —
//    le garde est `NODE_ENV !== 'production' || __VUE_PROD_DEVTOOLS__`
//    (`vue-i18n/dist/vue-i18n.mjs`, `install()`), donc il est VRAI côté serveur
//    en dev. `@nuxtjs/i18n` v10 force cet artefact universel pour les deux
//    bundles (`nuxt.options.alias['vue-i18n'] = 'vue-i18n/dist/vue-i18n.mjs'`,
//    module.mjs:2452) ; le build `vue-i18n.node.mjs`, lui, ne contient AUCUN
//    appel devtools.
// 3. `setupDevtoolsPlugin()` (`@vue/devtools-api` v6) ne trouve aucun hook
//    devtools dans un worker Node, donc il EMPILE le descripteur dans
//    `globalThis.__VUE_DEVTOOLS_PLUGINS__` — une file prévue pour être vidée
//    par un panneau devtools de NAVIGATEUR qui s'attacherait plus tard.
// 4. Dans un worker SSR, ce panneau n'arrive jamais. La file n'est jamais vidée,
//    et chaque entrée retient `pluginDescriptor.app` : l'application Vue
//    complète de la requête, donc son `_context.provides`, les entrées unhead
//    (la chaîne `window.__NUXT__` de ~910 Ko, qui embarque les 8 thèmes de
//    marque sérialisés) et tout le graphe d'instances de composants.
//
// ── Mesure (machine locale, worker isolé sur un port à nous) ─────────────────
// Chemin de rétention lu dans un heap snapshot du worker, identique pour les
// 100 chaînes `window.__NUXT__` vivantes après exactement 100 rendus SSR :
//
//   (root) → global → __VUE_DEVTOOLS_PLUGINS__ → [n] → pluginDescriptor
//          → app → _context → provides → usehead → entries (Map)
//          → _tags[1] → innerHTML  (string, 910 Ko)
//
// Recensement de deux snapshots, à 100 puis 250 rendus — le compte suit le
// nombre de rendus À L'UNITÉ, et le graphe d'objets suit :
//
//   chaîne `window.__NUXT__`      100 → 250   (+150)   +133 Mo
//   array (object properties)   50 113 → 117 475       +125 Mo
//   object Object              717 617 → 1 740 292      +54 Mo
//
// Soit ~3,75 Mo retenus PAR RENDU SSR, survivant à un `gc()` forcé. Avec la
// limite de tas par défaut du worker (4 144 Mo ici), ~1 100 rendus suffisent à
// le tuer — « Worker terminated due to reaching memory limit: JS heap out of
// memory », puis 500 sur TOUTES les routes, définitivement : `NodeDevWorker`
// (nitropack) marque `closed = true` et ne relance jamais de worker.
//
// ── Pourquoi vider cette file est SANS EFFET de bord ────────────────────────
// La file n'existe que pour qu'un devtools de navigateur s'attachant après coup
// retrouve les plugins déjà enregistrés. Aucun consommateur ne la lit dans un
// worker Node : Nuxt DevTools tourne dans le navigateur et parle en RPC, il ne
// lit jamais ce global côté serveur. La vider n'enlève donc aucune fonction —
// elle enlève une fuite.
//
// Le correctif est volontairement ici et pas dans `packages/ds` : la cause est
// une dépendance du site marketing (`vue-i18n`), pas le design system. Un module
// publié n'a pas à modifier les globals de ses consommateurs.
//
// ⚠️ À retirer le jour où `@nuxtjs/i18n` alias `vue-i18n` vers son build node
// pour le bundle serveur (ou où `vue-i18n` cesse de s'enregistrer hors
// navigateur). Le garde `packages/tests/e2e/marketing-ssr-no-leak.spec.ts`
// échouera si la fuite revient.

interface IDevtoolsQueueTarget {
    __VUE_DEVTOOLS_PLUGINS__?: unknown[]
}

export default defineNitroPlugin(() => {
    const target = globalThis as unknown as IDevtoolsQueueTarget

    const queue: unknown[] = target.__VUE_DEVTOOLS_PLUGINS__ ?? []
    queue.length = 0

    // `setupDevtoolsPlugin()` fait `target.__VUE_DEVTOOLS_PLUGINS__ ||= []` puis
    // `list.push(...)`. On laisse donc une VRAIE liste en place (truthy, donc
    // conservée) dont le `push` ne retient rien : le chemin d'appel amont est
    // inchangé, seule la rétention disparaît.
    Object.defineProperty(queue, 'push', {
        value: () => 0,
        writable: true,
        configurable: true,
        enumerable: false
    })

    // Réassignation verrouillée : sans cela, le premier `||= []` d'un autre
    // paquet qui aurait vidé le global recréerait une liste qui, elle, retient.
    Object.defineProperty(target, '__VUE_DEVTOOLS_PLUGINS__', {
        get: () => queue,
        set: () => {},
        configurable: true,
        enumerable: false
    })
})
