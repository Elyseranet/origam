/*
 * #248 — épingle le CÂBLAGE du correctif, pas son comportement.
 *
 * ─── Pourquoi ce fichier existe en plus de `devtools-plugin-queue.spec.ts` ──
 * Le mode de défaillance réel de ce correctif n'est pas que la neutralisation
 * cesse de fonctionner : c'est qu'elle cesse d'être APPELÉE. Tout le correctif
 * tient à un plugin Nitro de quatre lignes utiles, et ce fichier a déjà disparu
 * DEUX FOIS en trois jours — une fois dans un worktree, une fois volontairement
 * pour monter le contrôle AVANT du banc. Dans les deux cas
 * `devtools-plugin-queue.spec.ts` serait resté VERT (il teste la fonction, que
 * personne n'aurait plus appelée) et la fuite serait revenue en silence.
 *
 * C'est exactement le motif que cette campagne démonte : un test qui épingle un
 * comportement pendant que le câblage qui l'active peut sauter sans bruit.
 *
 * ─── Les deux tests ne sont PAS redondants ──────────────────────────────────
 * Ils séparent les deux causes de panne, pour qu'un rouge dise lequel :
 *
 *   « le module s'importe »   → rouge si le FICHIER a disparu / ne se charge pas
 *   « il appelle … »          → rouge si le fichier est là mais l'APPEL a sauté
 *
 * Un test unique confondrait « plugin supprimé » et « plugin débranché », et
 * rougirait sur une erreur de module en prétendant protéger le câblage.
 * Contrôle positif joué dans les deux sens avant commit : appel retiré →
 * SEUL le second rougit, le premier reste vert.
 *
 * ─── Ce qui est bouchonné, et pourquoi ──────────────────────────────────────
 * `defineNitroPlugin` et `neutraliseVueDevtoolsPluginQueue` sont des AUTO-IMPORTS
 * Nitro : le fichier source ne les importe pas, ils n'existent qu'à l'exécution
 * dans le worker. On les pose donc en globals avant l'import dynamique, ce qui
 * est précisément la façon dont le module les résout (identifiant libre →
 * `globalThis`). `import.meta.dev` est forcé à `true` par le `define` de
 * `vitest.config.ts` — voir le commentaire qui l'accompagne.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Charge le plugin Nitro dont dépend l'activation entière du correctif #248.
 *
 * ⛔ Le chemin est écrit EN CLAIR dans l'appel : un `import()` dont l'argument
 * est une variable n'est pas analysable statiquement par Vite, qui le laisse
 * alors se résoudre à l'exécution depuis la mauvaise racine (mesuré : « Cannot
 * find module '/marketing/server/plugins/…' »). Un littéral, et le plugin Vite
 * réécrit le chemin correctement.
 */
const importPlugin = () => import('../../../marketing/server/plugins/01.vue-devtools-plugin-queue')

describe('câblage du plugin Nitro #248', () => {
    let neutralise: ReturnType<typeof vi.fn>
    let registered: unknown[]

    beforeEach(() => {
        vi.resetModules()
        neutralise = vi.fn()
        registered = []

        vi.stubGlobal('defineNitroPlugin', (fn: unknown) => {
            registered.push(fn)
            return fn
        })
        vi.stubGlobal('neutraliseVueDevtoolsPluginQueue', neutralise)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('le module du plugin existe et s’importe (rouge si le FICHIER a disparu)', async () => {
        const mod = await importPlugin()

        expect(typeof mod.default).toBe('function')
        expect(registered).toHaveLength(1)
    })

    it('le plugin appelle la neutralisation sur globalThis (rouge si l’APPEL a sauté)', async () => {
        const mod = await importPlugin()

        // `defineNitroPlugin` rend la fonction telle quelle : l'export par
        // défaut EST le corps du plugin. L'exécuter, c'est jouer le démarrage
        // du serveur.
        await mod.default({} as never)

        expect(neutralise).toHaveBeenCalledTimes(1)
        // La cible doit être le VRAI global : c'est celui que lit
        // `getTarget()` de @vue/devtools-api dans un worker Node.
        expect(neutralise).toHaveBeenCalledWith(globalThis)
    })
})
