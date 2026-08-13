import type { UnwrapRef } from 'vue'
import type {
    ICommonsComponentEmits,
    IDataTableExpandProps,
    IDataTableFooterProps,
    IDataTableGroup,
    IDataTableGroupableItem,
    IDataTableGroupProps,
    IDataTableHeaderProps,
    IDataTableHeadersProps,
    IDataTableHeadersSlotProps,
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
    IDataTableSortItem,
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
    /**
     * `readonly … | undefined`, not `UnwrapRef<IDataTableProvideSort['sortBy']>`:
     * this is the pre-`provide()` value straight out of `createSort()`'s
     * `useVModel(props, 'sortBy', [])`, which mirrors the OPTIONAL
     * `IDataTableSortProps.sortBy` prop type — not the always-defined,
     * mutable array `IDataTableProvideSort` exposes to descendants after
     * `provideSort()` runs.
     */
    sortBy: readonly IDataTableSortItem[] | undefined
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
    /**
     * `IDataTableGroupableItem<T>`, not `IDataTableItem<T>`: this is
     * `extractRows()`'s return type (flattened groups, no `key` / `index` /
     * `columns` guaranteed by the type system — those DO exist on the real
     * objects at runtime, but only because `OrigamDataTable`'s call site
     * narrows the generic through an `as unknown as` cast upstream of
     * `extractRows`, which this field can't see through).
     */
    internalItems: Array<IDataTableGroupableItem<T>>
    /** `readonly`: straight from `usePaginatedItems()`'s `Ref<readonly (T | IDataTableGroup<T>)[]>`. */
    groupedItems: ReadonlyArray<IDataTableItem<T> | IDataTableGroup<IDataTableItem<T>>>
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

/** Slot signatures for `<OrigamDataTable>`. `default` / `colgroup` /
 *  `thead` / `prepend` / `body` / `append` all share `IDataTableSlotProps`
 *  (pagination, sort, selection and expansion state + actions). `header`
 *  and `header.mobile` forward `<OrigamDataTableHeaders>`'s own scope
 *  1:1. `top`, `header.loader` and `bottom` render with no scope — the
 *  header's own `loader` slot (forwarded as `header.loader`) never binds
 *  props from its default `<origam-progress>` render either. */
export interface IDataTableSlots<T = any> {
    top?: () => any
    default?: (props: IDataTableSlotProps<T>) => any
    colgroup?: (props: IDataTableSlotProps<T>) => any
    header?: (props: IDataTableHeadersSlotProps) => any
    'header.mobile'?: (props: IDataTableHeadersSlotProps) => any
    'header.loader'?: () => any
    thead?: (props: IDataTableSlotProps<T>) => any
    prepend?: (props: IDataTableSlotProps<T>) => any
    body?: (props: IDataTableSlotProps<T>) => any
    append?: (props: IDataTableSlotProps<T>) => any
    bottom?: () => any
}
