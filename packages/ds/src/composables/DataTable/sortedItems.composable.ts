import type { Ref } from 'vue'
import { computed } from 'vue'
import type { IDataTableSortItem } from '../../interfaces/DataTable/sort.interface'
import type { IInternalItem } from '../../interfaces/List/list-children.interface'
import type { TDataTableCompareFunction } from '../../types/DataTable/data-table.type'
import { sortItems } from '../../utils/DataTable/sort.util'

/*********************************************************
 * useSortedItems
 *
 * @description
 * Pure item-sorting hook: applies `sortBy` (+ optional custom compare
 * functions) to a plain items array. Independent from `useSort` /
 * `provideSort` / `createSort` (own file) — it consumes a `sortBy` ref
 * as a plain argument, never the `ORIGAM_DATA_TABLE_SORT_KEY`
 * injection those manage.
 ********************************************************/
export function useSortedItems<T extends IInternalItem> (
    props: {
        customKeySort: TDataTableCompareFunction | undefined
    },
    items: Ref<T[]>,
    sortBy: Ref<Array<IDataTableSortItem>>,
    options?: {
        transform?: (item: T) => Record<string, unknown>
        sortFunctions?: Ref<Record<string, TDataTableCompareFunction> | undefined>
        sortRawFunctions?: Ref<Record<string, TDataTableCompareFunction> | undefined>
    }
) {
    const sortedItems = computed(() => {
        if (!sortBy.value.length) return items.value

        return sortItems(items.value, sortBy.value, {
            transform: options?.transform,
            sortFunctions: {
                ...props.customKeySort,
                ...options?.sortFunctions?.value
            },
            sortRawFunctions: options?.sortRawFunctions?.value
        })
    })

    return {sortedItems}
}
