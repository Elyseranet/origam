import type { InjectionKey, Ref } from 'vue'
import type { IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'
import type { IDataTableGroup } from '../../interfaces/DataTable/group.interface'
import type { IDataTableItem } from '../../interfaces/DataTable/items.interface'
import type { IDataTableSelectStrategy } from '../../interfaces/DataTable/select.interface'
import type { IDataTableSortItem } from '../../interfaces/DataTable/sort.interface'
import { provideSelection } from '../../composables/DataTable/select.composable'

export const ORIGAM_DATA_TABLE_EXPAND_KEY: InjectionKey<{
    expand: (item: IDataTableItem, value: boolean) => void
    expanded: Ref<Set<string>>
    expandOnClick: Ref<boolean | undefined>
    isExpanded: (item: IDataTableItem) => boolean
    toggleExpand: (item: IDataTableItem) => void
}> = Symbol.for('origam:data-table-expand')

export const ORIGAM_DATA_TABLE_GROUP_KEY: InjectionKey<{
    opened: Ref<Set<string>>
    toggleGroup: (group: IDataTableGroup) => void
    isGroupOpen: (group: IDataTableGroup) => boolean
    sortByWithGroups: Ref<Array<IDataTableSortItem>>
    groupBy: Ref<Array<IDataTableSortItem>>
    extractRows: (items: Array<IDataTableItem | IDataTableGroup<IDataTableItem>>) => Array<IDataTableItem>
}> = Symbol.for('origam:data-table-group')

export const ORIGAM_DATA_TABLE_HEADERS_KEY: InjectionKey<{
    headers: Ref<Array<Array<IInternalDataTableHeader>>>
    columns: Ref<Array<IInternalDataTableHeader>>
}> = Symbol.for('origam:data-table-headers')

export const DEFAULT_HEADER = {title: '', sortable: false}
export const DEFAULT_ACTION_HEADER = {...DEFAULT_HEADER, width: 48}

export const ORIGAM_DATA_TABLE_PAGINATION_KEY: InjectionKey<{
    page: Ref<number>
    itemsPerPage: Ref<number>
    startIndex: Ref<number>
    stopIndex: Ref<number>
    pageCount: Ref<number>
    itemsLength: Ref<number>
    prevPage: () => void
    nextPage: () => void
    setPage: (value: number) => void
    setItemsPerPage: (value: number) => void
}> = Symbol.for('origam:data-table-pagination')

/*********************************************************
 * DATA_TABLE_DEFAULT_PAGE
 *
 * @description
 * Pagination in this DS is ONE-based: the first page is `1`, never `0`.
 * The value doubles as the fallback `createPagination` coerces an
 * undefined `page` prop to, as the lower clamp bound of `nextPage` /
 * `prevPage` / `setPage`, and as the page `setItemsPerPage` resets to.
 ********************************************************/
export const DATA_TABLE_DEFAULT_PAGE = 1

/*********************************************************
 * DATA_TABLE_DEFAULT_ITEMS_PER_PAGE
 *
 * @description
 * Rows rendered per page when the consumer passes no `itemsPerPage`.
 ********************************************************/
export const DATA_TABLE_DEFAULT_ITEMS_PER_PAGE = 10

/*********************************************************
 * DATA_TABLE_ITEMS_PER_PAGE_ALL
 *
 * @description
 * Sentinel `itemsPerPage` value meaning "no pagination — show every
 * row". It is NOT a count: `startIndex` collapses to `0`, `stopIndex`
 * to `itemsLength`, and `pageCount` to `DATA_TABLE_MIN_PAGE_COUNT`.
 * `-1` rather than `0` because `0` is a legitimate "empty page" value
 * a consumer could reach by binding a numeric input.
 ********************************************************/
export const DATA_TABLE_ITEMS_PER_PAGE_ALL = -1

/*********************************************************
 * DATA_TABLE_MIN_PAGE_COUNT
 *
 * @description
 * Floor of `pageCount`. An empty table still has one (empty) page —
 * returning `0` would make the one-based `page` ref unclampable and
 * `watchEffect` would drive it to `0`, a page that cannot exist.
 ********************************************************/
export const DATA_TABLE_MIN_PAGE_COUNT = 1

/*********************************************************
 * DATA_TABLE_PAGINATION_MISSING_ERROR
 *
 * @description
 * Thrown by `usePagination` when no ancestor called
 * `providePagination`.
 ********************************************************/
export const DATA_TABLE_PAGINATION_MISSING_ERROR = 'Missing pagination!'

export const ORIGAM_DATA_TABLE_SELECT_KEY: InjectionKey<ReturnType<typeof provideSelection>> = Symbol.for('origam:data-table-selection')

export const ORIGAM_DATA_TABLE_SHOW_SELECT_KEY: InjectionKey<Ref<boolean>> = Symbol.for('origam:data-table-show-select')

export const singleSelectStrategy: IDataTableSelectStrategy = {
    showSelectAll: false,
    allSelected: () => [],
    select: ({items, value}) => {
        return new Set(value && items.length > 0 ? [items[0].value] : [])
    },
    selectAll: ({selected}) => selected
}

export const pageSelectStrategy: IDataTableSelectStrategy = {
    showSelectAll: true,
    allSelected: ({currentPage}) => currentPage,
    select: ({items, value, selected}) => {
        for (const item of items) {
            if (value) selected.add(item.value)
            else selected.delete(item.value)
        }

        return selected
    },
    selectAll: ({value, currentPage, selected}) => pageSelectStrategy.select({items: currentPage, value, selected})
}

export const allSelectStrategy: IDataTableSelectStrategy = {
    showSelectAll: true,
    allSelected: ({allItems}) => allItems,
    select: ({items, value, selected}) => {
        for (const item of items) {
            if (value) selected.add(item.value)
            else selected.delete(item.value)
        }

        return selected
    },
    selectAll: ({value, allItems, selected}) => allSelectStrategy.select({items: allItems, value, selected})
}

export const ORIGAM_DATA_TABLE_SORT_KEY: InjectionKey<{
    sortBy: Ref<Array<IDataTableSortItem>>
    toggleSort: (column: IInternalDataTableHeader) => void
    isSorted: (column: IInternalDataTableHeader) => boolean
}> = Symbol.for('origam:data-table-sort')
