// Utilities
// Types
import type { Ref } from 'vue'
import { onBeforeUpdate, ref } from 'vue'

/*********************************************************
 * useRefs
 *
 * @description
 * Collecte un tableau de template refs pour une liste `v-for` (`:ref`
 * pointant vers `(e) => updateRef(e, index)`) — pattern standard pour
 * recuperer les instances/elements enfants d'une boucle dans un ordre
 * stable.
 *
 * @description
 * Le tableau est REINITIALISE a vide a chaque `onBeforeUpdate`, puis Vue
 * re-remplit les index via `updateRef` pendant le re-render qui suit.
 *
 * @description
 * ⛔ Le tableau ne RETRECIT PAS pour autant. Mesure, liste de 3 items
 * ramenee a 1 : `refs.value` vaut `[<li>, null, null]` et `refs.value.length`
 * vaut toujours `3` — Vue rappelle la fonction `ref` des vnodes demontes
 * avec `null`, donc les emplacements liberes sont REMIS A `null` (pas
 * d'element perime conserve) mais restent presents. Un consommateur doit
 * filtrer les trous et ne jamais deduire la longueur de la liste de
 * `refs.value.length`.
 ********************************************************/
export function useRefs<T extends object> () {
    const refs = ref<(T | null | undefined)[]>([]) as Ref<(T | null | undefined)[]>

    onBeforeUpdate(() => (refs.value = []))

    function updateRef (e: T | null, i: number) {
        refs.value[i] = e
    }

    return {refs, updateRef}
}
