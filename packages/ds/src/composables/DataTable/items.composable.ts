import { computed, Ref } from 'vue'
import type { IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'
import type { IDataTableItemsProps } from '../../interfaces/DataTable/items.interface'

import { transformDataTableItems } from '../../utils/DataTable/items.util'

/*********************************************************
 * useDataTableItems
 ********************************************************/
/*********************************************************
 * useDataTableItems
 *
 * @description
 * Transforme les donnees brutes de `props.items` en lignes internes de
 * `<origam-data-table>`, via `transformDataTableItems`. Retourne `{ items }`.
 *
 * @description
 * Depend des COLONNES autant que des donnees : la transformation extrait une
 * valeur par colonne declaree. Les colonnes sont donc passees en `Ref` et non
 * en valeur, pour que le calcul se refasse quand elles changent — un tableau
 * dont les colonnes sont dynamiques recalculerait sinon ses lignes sur
 * l'ancien jeu.
 ********************************************************/
export function useDataTableItems (props: IDataTableItemsProps, columns: Ref<Array<IInternalDataTableHeader>>) {
    const items = computed(() => transformDataTableItems(props, props.items, columns.value))

    return {items}
}
