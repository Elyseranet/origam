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
