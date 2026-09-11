import type { IDataTableSortItem } from '../../interfaces'
import { deepEqual, getCurrentInstance } from '../../utils'
import { computed, Ref, watch } from 'vue'

/*********************************************************
 * useOptions
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
