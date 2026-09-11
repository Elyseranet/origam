import type { Ref } from 'vue'
import { computed, watch } from 'vue'
import type { IDataTableGroup } from '../../interfaces/DataTable/group.interface'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * usePaginatedItems
 *
 * @description
 * Pure item-slicing hook: slices a plain items array to the current
 * `[startIndex, stopIndex)` window and emits `update:currentItems`.
 * Independent from `usePagination` / `providePagination` /
 * `createPagination` (own file) — it consumes `startIndex` / `stopIndex`
 * / `itemsPerPage` refs as plain arguments, never the
 * `ORIGAM_DATA_TABLE_PAGINATION_KEY` injection those manage.
 ********************************************************/
export function usePaginatedItems<T> (options: {
    items: Ref<readonly (T | IDataTableGroup<T>)[]>
    startIndex: Ref<number>
    stopIndex: Ref<number>
    itemsPerPage: Ref<number>
}) {
    const vm = getCurrentInstance('usePaginatedItems')

    const {items, startIndex, stopIndex, itemsPerPage} = options
    const paginatedItems = computed(() => {
        if (itemsPerPage.value <= 0) return items.value

        return items.value.slice(startIndex.value, stopIndex.value)
    })

    watch(paginatedItems, (val) => {
        vm.emit('update:currentItems', val)
    })

    return {paginatedItems}
}
