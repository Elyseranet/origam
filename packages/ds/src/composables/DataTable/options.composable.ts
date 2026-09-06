import type { IDataTableSortItem } from '../../interfaces/DataTable/sort.interface'
import { deepEqual } from '../../utils/Commons/commons.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'
import { computed, Ref, watch } from 'vue'

/*********************************************************
 * useOptions
 ********************************************************/
/*********************************************************
 * useOptions
 *
 * @description
 * Regroupe pagination, tri, groupement et recherche en un seul objet
 * `options`, et emet `update:options` sur `<origam-data-table>` a chaque
 * changement reel. C'est le point unique par lequel un consommateur en mode
 * serveur apprend qu'il doit recharger.
 *
 * @description
 * Ne retourne RIEN : ce composable est un effet de bord, pas une source de
 * valeur. Les refs qu'il surveille appartiennent deja a l'appelant.
 *
 * @description
 * ⛔ Deux protections contre les emissions parasites. Un `deepEqual` avec
 * l'objet precedent evite d'emettre quand une ref a ete reassignee sans que
 * son contenu change. Et un changement de `search` REMET LA PAGE A 1 avant
 * d'emettre — sans quoi une recherche depuis la page 4 demanderait la page 4
 * d'un jeu de resultats qui n'en a peut-etre qu'une.
 ********************************************************/
export function useOptions ({
                                page,
                                itemsPerPage,
                                sortBy,
                                groupBy,
                                search
                            }: {
    page: Ref<number>
    itemsPerPage: Ref<number>
    sortBy: Ref<Array<IDataTableSortItem>>
    groupBy: Ref<Array<IDataTableSortItem>>
    search: Ref<string | undefined>
}) {
    const vm = getCurrentInstance('OrigamDataTable')

    const options = computed(() => ({
        page: page.value,
        itemsPerPage: itemsPerPage.value,
        sortBy: sortBy.value,
        groupBy: groupBy.value,
        search: search.value
    }))

    let oldOptions: typeof options.value | null = null

    watch(options, () => {
        if (deepEqual(oldOptions, options.value)) return

        // Reset page when searching
        if (oldOptions && oldOptions.search !== options.value.search) {
            page.value = 1
        }

        vm.emit('update:options', options.value)
        oldOptions = options.value
    }, {deep: true, immediate: true})
}
