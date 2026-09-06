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
 * Le tableau est REINITIALISE a vide a chaque `onBeforeUpdate` : c'est ce
 * qui evite d'accumuler des references perimees quand la liste retrecit
 * (sans ce reset, un index au-dela de la nouvelle longueur garderait
 * l'ancien element). Vue re-remplit ensuite les index via `updateRef`
 * pendant le re-render qui suit.
 ********************************************************/
export function useRefs<T extends object> () {
    const refs = ref<(T | null | undefined)[]>([]) as Ref<(T | null | undefined)[]>

    onBeforeUpdate(() => (refs.value = []))

    function updateRef (e: T | null, i: number) {
        refs.value[i] = e
    }

    return {refs, updateRef}
}
