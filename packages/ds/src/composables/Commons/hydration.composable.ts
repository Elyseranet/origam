import { onMounted, shallowRef } from 'vue'
import { useDisplay } from './display.composable'
import { IN_BROWSER } from '../../consts/Commons/commons.const'

/*********************************************************
 * useHydration
 *
 * @description
 * Retourne un `Ref<boolean>` qui vaut `false` jusqu'a l'hydratation cote
 * client puis bascule a `true` dans un `onMounted` — utile pour retarder un
 * rendu sensible a l'hydratation sans passer par `<ClientOnly>`.
 *
 * @description
 * Le flag SSR vient de `useDisplay().ssr` : si l'instance de display n'a
 * jamais ete creee en mode SSR (`ssr` falsy), le Ref demarre directement a
 * `true` — pas de delai artificiel dans une app 100% client. Hors
 * navigateur (`!IN_BROWSER`), retourne un Ref fige a `false`.
 *
 * @description
 * ⚠️ Dans un navigateur, ce composable PREFERE `createOrigam()` : il
 * appelle `useDisplay()`, dont l'injection n'existe que si le plugin est
 * installe, pour savoir si l'app tourne en SSR. **#attach-harmonisation** —
 * jusque-la, l'absence du plugin faisait LEVER `useDisplay()` (« Could not
 * find Origam display injection »), ce qui a casse 4 e2e marketing (SSR
 * Nuxt) : `useTeleport()`, qui appelle desormais ce composable pour eviter
 * une course de montage (voir teleport.composable.ts), doit rester
 * utilisable comme primitive BRUTE — sans `createOrigam()` — exactement
 * comme il l'etait avant. Le `try/catch` ci-dessous rattrape UNIQUEMENT ce
 * cas (plugin absent) et retombe sur le chemin non-SSR (`shallowRef(true)`,
 * aucun delai) : un consommateur qui a reellement besoin du signal SSR et
 * installe le plugin obtient exactement le comportement documente plus
 * haut, inchange. Aucun test n'epinglait le lever — `grep -rn "Could not
 * find Origam display injection" packages/tests` ne retourne rien.
 ********************************************************/
export function useHydration () {
    if (!IN_BROWSER) return shallowRef(false)

    let ssr: boolean | undefined

    try {
        ({ssr} = useDisplay())
    } catch {
        // Pas de createOrigam() installe (usage brut du composable, ou un
        // test qui monte sans le plugin) — aucune ambiguite SSR possible
        // dans ce cas, donc pas de delai artificiel.
        return shallowRef(true)
    }

    if (ssr) {
        const isMounted = shallowRef(false)
        onMounted(() => {
            isMounted.value = true
        })
        return isMounted
    } else {
        return shallowRef(true)
    }
}
