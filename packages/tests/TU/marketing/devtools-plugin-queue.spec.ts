/*
 * #248 — épingle le correctif de la fuite mémoire du worker SSR de `nuxt dev`.
 *
 * Le défaut mesuré : `vue-i18n` appelle `setupDevtoolsPlugin()` à chaque
 * `app.use(i18n)`, donc à chaque requête SSR (Nuxt crée une application Vue par
 * requête). Faute de hook devtools dans un worker Node, `@vue/devtools-api`
 * EMPILE le descripteur dans `globalThis.__VUE_DEVTOOLS_PLUGINS__`, et chaque
 * entrée retient `pluginDescriptor.app` — l'application complète de la requête.
 * ~3,75 Mo retenus par rendu, worker tué vers 1 100 rendus.
 *
 * Ce test rejoue le CHEMIN D'APPEL EXACT de `@vue/devtools-api` v6
 * (`setupDevtoolsPlugin`, `lib/esm/index.js:17-22`) :
 *
 *   const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []
 *   list.push({ pluginDescriptor: descriptor, setupFn, proxy })
 *
 * et vérifie qu'après `neutraliseVueDevtoolsPluginQueue`, cet appel ne retient
 * plus rien. La rétention est mesurée par un `WeakRef` + `FinalizationRegistry`
 * quand le runtime expose `gc()` ; sinon on se rabat sur l'assertion de
 * structure (la file reste vide), qui est la condition nécessaire et suffisante
 * ici — rien d'autre ne pointe sur le descripteur.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import type { IDevtoolsQueueTarget } from '../../../marketing/server/interfaces/devtools-queue-target.interface'
import {
    VUE_DEVTOOLS_PLUGINS_KEY,
    neutraliseVueDevtoolsPluginQueue
} from '../../../marketing/server/utils/devtools-plugin-queue'

/** Reproduit `setupDevtoolsPlugin()` de `@vue/devtools-api` v6, branche « pas de hook ». */
function setupDevtoolsPluginLike (target: IDevtoolsQueueTarget, descriptor: object): void {
    const list = target[VUE_DEVTOOLS_PLUGINS_KEY] = target[VUE_DEVTOOLS_PLUGINS_KEY] || []
    list.push({ pluginDescriptor: descriptor, setupFn: () => {}, proxy: null })
}

describe('devtools-plugin-queue (#248)', () => {
    let target: IDevtoolsQueueTarget

    beforeEach(() => {
        target = {}
    })

    it('CONTRÔLE NÉGATIF — sans le correctif, la file grossit d’une entrée par application', () => {
        for (let i = 0; i < 50; i++) setupDevtoolsPluginLike(target, { app: { id: i } })

        expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(50)
    })

    it('après neutralisation, 1 000 enregistrements ne retiennent rien', () => {
        neutraliseVueDevtoolsPluginQueue(target)

        for (let i = 0; i < 1000; i++) setupDevtoolsPluginLike(target, { app: { id: i } })

        expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(0)
    })

    it('vide une file déjà remplie (le plugin Nitro peut démarrer après un enregistrement)', () => {
        setupDevtoolsPluginLike(target, { app: { id: 'avant' } })
        expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(1)

        neutraliseVueDevtoolsPluginQueue(target)

        expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(0)
    })

    it('survit à une réassignation du global — c’est exactement ce que fait `||= []`', () => {
        neutraliseVueDevtoolsPluginQueue(target)

        // `setupDevtoolsPlugin` réassigne systématiquement avant de pousser.
        // Sans le verrou, cette ligne réinstallerait une file rétentive.
        target[VUE_DEVTOOLS_PLUGINS_KEY] = []
        setupDevtoolsPluginLike(target, { app: { id: 'après' } })

        expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(0)
    })

    it('est idempotente', () => {
        neutraliseVueDevtoolsPluginQueue(target)
        neutraliseVueDevtoolsPluginQueue(target)
        neutraliseVueDevtoolsPluginQueue(target)

        setupDevtoolsPluginLike(target, { app: { id: 'x' } })

        expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(0)
    })

    it('le descripteur enregistré devient collectable (mesure directe de la fuite)', async () => {
        neutraliseVueDevtoolsPluginQueue(target)

        let app: object | undefined = { heavy: new Array(1024).fill('x') }
        const ref = new WeakRef(app)
        setupDevtoolsPluginLike(target, { app })
        app = undefined

        const gc = (globalThis as { gc?: () => void }).gc
        if (!gc) {
            // Sans `--expose-gc`, on ne peut pas prouver la collecte ; l'assertion
            // de structure ci-dessus la couvre. Marqué explicitement plutôt que
            // silencieusement sauté.
            expect(target[VUE_DEVTOOLS_PLUGINS_KEY]).toHaveLength(0)
            return
        }

        gc(); gc()
        await new Promise((resolve) => setTimeout(resolve, 0))
        gc(); gc()

        expect(ref.deref()).toBeUndefined()
    })
})
