import { computed, Ref } from 'vue'
import type { IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'
import type { IDataTableItemsProps } from '../../interfaces/DataTable/items.interface'

import { transformDataTableItems } from '../../utils/DataTable/items.util'

/*********************************************************
 * useDataTableItems
 ********************************************************/
export function useDataTableItems (props: IDataTableItemsProps, columns: Ref<Array<IInternalDataTableHeader>>) {
    const items = computed(() => transformDataTableItems(props, props.items, columns.value))

    return {items}
}
