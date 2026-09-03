import type { Ref } from 'vue'
import { computed, inject, provide, watchEffect } from 'vue'
import { useVModel } from '../Commons/vModel.composable'
import {
    DATA_TABLE_DEFAULT_ITEMS_PER_PAGE,
    DATA_TABLE_DEFAULT_PAGE,
    DATA_TABLE_ITEMS_PER_PAGE_ALL,
    DATA_TABLE_MIN_PAGE_COUNT,
    DATA_TABLE_PAGINATION_MISSING_ERROR,
    ORIGAM_DATA_TABLE_PAGINATION_KEY
} from '../../consts/DataTable/data-table.const'
import type { IDataTableProvidePagination, IDataTablePaginationProps } from '../../interfaces/DataTable/pagination.interface'
import { clamp } from '../../utils/Commons/commons.util'

/*********************************************************
 * createPagination
 *
 * @description
 * Reads the `page` / `itemsPerPage` props into the v-model refs
 * `providePagination` expects. Kept alongside `usePagination` /
 * `providePagination` in this file — all three address the same
 * `ORIGAM_DATA_TABLE_PAGINATION_KEY` contract. `usePaginatedItems`
 * (own file) is the pure item-slicing sibling and does not depend on
 * any of the three.
 ********************************************************/
export function createPagination (props: IDataTablePaginationProps) {
    const page = useVModel(props, 'page', undefined, value => +(value ?? DATA_TABLE_DEFAULT_PAGE))
    const itemsPerPage = useVModel(props, 'itemsPerPage', undefined, value => +(value ?? DATA_TABLE_DEFAULT_ITEMS_PER_PAGE))

    return {page, itemsPerPage}
}

/*********************************************************
 * providePagination
 *
 * @description
 * Provider-side hook: derives `startIndex` / `stopIndex` / `pageCount`
 * plus the `nextPage` / `prevPage` / `setPage` / `setItemsPerPage`
 * mutators, and provides `ORIGAM_DATA_TABLE_PAGINATION_KEY` for
 * `usePagination` consumers down the tree.
 ********************************************************/
export function providePagination (options: {
    page: Ref<number>
    itemsPerPage: Ref<number>
    itemsLength: Ref<number>
}): IDataTableProvidePagination {
    const {page, itemsPerPage, itemsLength} = options

    const startIndex = computed(() => {
        if (itemsPerPage.value === DATA_TABLE_ITEMS_PER_PAGE_ALL) return 0

        return itemsPerPage.value * (page.value - DATA_TABLE_DEFAULT_PAGE)
    })
    const stopIndex = computed(() => {
        if (itemsPerPage.value === DATA_TABLE_ITEMS_PER_PAGE_ALL) return itemsLength.value

        return Math.min(itemsLength.value, startIndex.value + itemsPerPage.value)
    })
    const pageCount = computed(() => {
        if (itemsPerPage.value === DATA_TABLE_ITEMS_PER_PAGE_ALL || itemsLength.value === 0) return DATA_TABLE_MIN_PAGE_COUNT

        return Math.ceil(itemsLength.value / itemsPerPage.value)
    })

    watchEffect(() => {
        if (page.value > pageCount.value) {
            page.value = pageCount.value
        }
    })

    const setItemsPerPage = (value: number) => {
        itemsPerPage.value = value
        page.value = DATA_TABLE_DEFAULT_PAGE
    }
    const nextPage = () => {
        page.value = clamp(page.value + 1, DATA_TABLE_DEFAULT_PAGE, pageCount.value)
    }
    const prevPage = () => {
        page.value = clamp(page.value - 1, DATA_TABLE_DEFAULT_PAGE, pageCount.value)
    }
    const setPage = (value: number) => {
        page.value = clamp(value, DATA_TABLE_DEFAULT_PAGE, pageCount.value)
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
 *
 * @description
 * Reads the injected pagination state provided by `providePagination`.
 * Independent from `usePaginatedItems` (own file) — that hook slices a
 * plain items array and never touches this injection.
 ********************************************************/
export function usePagination () {
    const data = inject(ORIGAM_DATA_TABLE_PAGINATION_KEY)

    if (!data) throw new Error(DATA_TABLE_PAGINATION_MISSING_ERROR)

    return data
}
