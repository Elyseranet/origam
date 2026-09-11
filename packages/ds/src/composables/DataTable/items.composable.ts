import { computed, Ref } from 'vue'
import type { IDataTableItemsProps, IInternalDataTableHeader } from '../../interfaces'

import { transformDataTableItems } from '../../utils'

/*********************************************************
 * useDataTableItems
 ********************************************************/
export function useDataTableItems (props: IDataTableItemsProps, columns: Ref<Array<IInternalDataTableHeader>>) {
    const items = computed(() => transformDataTableItems(props, props.items, columns.value))

    return {items}
}
