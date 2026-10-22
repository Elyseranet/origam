/**
 * Objet portant la file d'attente des plugins Vue DevTools — `globalThis` en
 * production, un objet jetable dans les tests. Voir
 * `src/utils/devtools-plugin-queue.util.ts` (#248).
 */
export interface IDevtoolsQueueTarget {
    __VUE_DEVTOOLS_PLUGINS__?: unknown[]
}
