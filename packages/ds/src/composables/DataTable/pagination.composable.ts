import { computed, inject, provide, Ref, watch, watchEffect } from 'vue'
import { useVModel } from '../../composables'
import { ORIGAM_DATA_TABLE_PAGINATION_KEY } from '../../consts'

import type { IDataTableGroup, IDataTablePaginationProps, IDataTableProvidePagination } from '../../interfaces'
import { clamp, getCurrentInstance } from '../../utils'

/*********************************************************
 * createPagination
 ********************************************************/
export function createPagination (props: IDataTablePaginationProps) {
    const page = useVModel(props, 'page', undefined, value => +(value ?? 1))
    const itemsPerPage = useVModel(props, 'itemsPerPage', undefined, value => +(value ?? 10))

    return {page, itemsPerPage}
}

/*********************************************************
 * providePagination
 ********************************************************/
export function providePagination (options: {
    page: Ref<number>
    itemsPerPage: Ref<number>
    itemsLength: Ref<number>
}): IDataTableProvidePagination {
    const {page, itemsPerPage, itemsLength} = options

    const startIndex = computed(() => {
        if (itemsPerPage.value === -1) return 0

        return itemsPerPage.value * (page.value - 1)
    })
    const stopIndex = computed(() => {
        if (itemsPerPage.value === -1) return itemsLength.value

        return Math.min(itemsLength.value, startIndex.value + itemsPerPage.value)
    })
    const pageCount = computed(() => {
        if (itemsPerPage.value === -1 || itemsLength.value === 0) return 1

        return Math.ceil(itemsLength.value / itemsPerPage.value)
    })

    watchEffect(() => {
        if (page.value > pageCount.value) {
            page.value = pageCount.value
        }
    })

    const setItemsPerPage = (value: number) => {
        itemsPerPage.value = value
        page.value = 1
    }
    const nextPage = () => {
        page.value = clamp(page.value + 1, 1, pageCount.value)
    }
    const prevPage = () => {
        page.value = clamp(page.value - 1, 1, pageCount.value)
    }
    const setPage = (value: number) => {
        page.value = clamp(value, 1, pageCount.value)
    }

    const data: IDataTableProvidePagination = {
        page,
        itemsPerPage,
        startIndex,
        stopIndex,
        pageCount,
        itemsLength,
        nextPage,
        prevPage,
        setPage,
        setItemsPerPage
    }

    provide(ORIGAM_DATA_TABLE_PAGINATION_KEY, data)

    return data
}

/*********************************************************
 * usePagination
 ********************************************************/
export function usePagination () {
    const data = inject(ORIGAM_DATA_TABLE_PAGINATION_KEY)

    if (!data) throw new Error('Missing pagination!')

    return data
}

/*********************************************************
 * usePaginatedItems
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
