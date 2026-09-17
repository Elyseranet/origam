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
 * ⛔ Dans un navigateur, ce composable DEPEND de `createOrigam()` : il
 * appelle `useDisplay()`, dont l'injection n'existe que si le plugin est
 * installe. Mesure, montage d'un composant sans `createOrigam()` :
 * `useHydration()` LEVE `Could not find Origam display injection`. Ce
 * n'est donc pas un utilitaire autonome, contrairement a `useSsrBoot` qui
 * n'injecte rien.
 ********************************************************/
export function useHydration () {
    if (!IN_BROWSER) return shallowRef(false)

    const {ssr} = useDisplay()

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
