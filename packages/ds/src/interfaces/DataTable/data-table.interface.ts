import type { UnwrapRef } from 'vue'
import type {
    ICommonsComponentEmits,
    IDataTableExpandProps,
    IDataTableFooterProps,
    IDataTableGroup,
    IDataTableGroupProps,
    IDataTableHeaderProps,
    IDataTableHeadersProps,
    IDataTableItem,
    IDataTableItemsProps,
    IDataTablePaginationProps,
    IDataTableProvideExpanded,
    IDataTableProvideGroup,
    IDataTableProvidePagination,
    IDataTableProvideSelection,
    IDataTableProvideSort,
    IDataTableRowProps,
    IDataTableSelectProps,
    IDataTableSortProps,
    IFiltersProps,
    IInternalDataTableHeader,
    ITableProps
} from '../../interfaces'

export interface IDataTableProps extends ITableProps, IDataTableRowProps, IDataTableExpandProps, IDataTableGroupProps, IDataTableHeaderProps, IDataTableItemsProps, IDataTableSelectProps, IDataTableSortProps, IDataTableHeadersProps, IDataTablePaginationProps, IFiltersProps, IDataTableFooterProps {
    hideDefaultBody?: boolean
    hideDefaultFooter?: boolean
    hideDefaultHeader?: boolean
    search?: string
}

export interface IDataTableSlotProps<T> {
    page: number
    itemsPerPage: number
    sortBy: UnwrapRef<IDataTableProvideSort['sortBy']>
    pageCount: number
    toggleSort: IDataTableProvideSort['toggleSort']
    setItemsPerPage: IDataTableProvidePagination['setItemsPerPage']
    someSelected: boolean
    allSelected: boolean
    isSelected: IDataTableProvideSelection['isSelected']
    select: IDataTableProvideSelection['select']
    selectAll: IDataTableProvideSelection['selectAll']
    toggleSelect: IDataTableProvideSelection['toggleSelect']
    isExpanded: IDataTableProvideExpanded['isExpanded']
    toggleExpand: IDataTableProvideExpanded['toggleExpand']
    isGroupOpen: IDataTableProvideGroup['isGroupOpen']
    toggleGroup: IDataTableProvideGroup['toggleGroup']
    items: T[]
    internalItems: Array<IDataTableItem>
    groupedItems: Array<IDataTableItem<T> | IDataTableGroup<IDataTableItem<T>>>
    columns: Array<IInternalDataTableHeader>
    headers: Array<Array<IInternalDataTableHeader>>
}

/** Emits fired by `<OrigamDataTable>` — pagination, sorting, grouping,
 *  expansion, selection, and the v-model that ties them together. */
export interface IDataTableEmits extends ICommonsComponentEmits {
    (e: 'update:page', value: number): void
    (e: 'update:itemsPerPage', value: number): void
    (e: 'update:sortBy', value: UnwrapRef<IDataTableProvideSort['sortBy']>): void
    (e: 'update:options', value: Record<string, unknown>): void
    (e: 'update:groupBy', value: UnwrapRef<IDataTableProvideGroup['groupBy']>): void
    (e: 'update:expanded', value: ReadonlySet<unknown>): void
    (e: 'update:currentItems', value: Array<IDataTableItem>): void
}
