import { useVModel } from '../../composables'

import { ORIGAM_DATA_TABLE_SORT_KEY } from '../../consts'
import { SORT_DIRECTION } from '../../enums'

import type {
    IDataTableProvideSort,
    IDataTableSortItem,
    IDataTableSortProps,
    IInternalDataTableHeader,
    IInternalItem
} from '../../interfaces'
import type { TDataTableCompareFunction } from '../../types'
import { sortItems } from '../../utils'

import { computed, inject, provide, Ref, toRef } from 'vue'

/*********************************************************
 * createSort
 ********************************************************/
export function createSort (props: IDataTableSortProps) {
    const sortBy = useVModel(props, 'sortBy', [])
    const mustSort = toRef(props, 'mustSort')
    const multiSort = toRef(props, 'multiSort')

    return {sortBy, mustSort, multiSort}
}

/*********************************************************
 * provideSort
 ********************************************************/
export function provideSort (options: {
    sortBy: Ref<Array<IDataTableSortItem>>
    mustSort: Ref<boolean>
    multiSort: Ref<boolean>
    page?: Ref<number>
}): IDataTableProvideSort {
    const {sortBy, mustSort, multiSort, page} = options

    const toggleSort = (column: IInternalDataTableHeader): void => {
        if (column.key == null) return

        let newSortBy = sortBy.value.map(x => ({...x})) ?? []
        const item = newSortBy.find(x => x.key === column.key)

        if (!item) {
            if (multiSort.value) newSortBy = [...newSortBy, {key: column.key, order: SORT_DIRECTION.ASC}]
            else newSortBy = [{key: column.key, order: SORT_DIRECTION.ASC}]
        } else if (item.order === SORT_DIRECTION.DESC) {
            if (mustSort.value) {
                item.order = SORT_DIRECTION.ASC
            } else {
                newSortBy = newSortBy.filter(x => x.key !== column.key)
            }
        } else {
            item.order = SORT_DIRECTION.DESC
        }

        sortBy.value = newSortBy
        if (page) page.value = 1
    }

    const isSorted = (column: IInternalDataTableHeader): boolean => {
        return !!sortBy.value.find((item) => item.key === column.key)
    }

    const data: IDataTableProvideSort = {sortBy, toggleSort, isSorted}

    provide(ORIGAM_DATA_TABLE_SORT_KEY, data)

    return data
}

/*********************************************************
 * useSort
 ********************************************************/
export function useSort () {
    const data = inject(ORIGAM_DATA_TABLE_SORT_KEY)

    if (!data) throw new Error('Missing sort!')

    return data
}

/*********************************************************
 * useSortedItems
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
