import type { UnwrapRef } from 'vue'
import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type {
    IDataTableExpandProps,
    IDataTableProvideExpanded
} from './expand.interface'
import type { IDataTableFooterProps } from './footer.interface'
import type {
    IDataTableGroup,
    IDataTableGroupableItem,
    IDataTableGroupHeaderRowGroupSlot,
    IDataTableGroupHeaderRowSelectSlot,
    IDataTableGroupHeaderSlot,
    IDataTableGroupProps,
    IDataTableProvideGroup
} from './group.interface'
import type {
    IDataTableHeaderProps,
    IInternalDataTableHeader
} from './data-table-header.interface'
import type {
    IDataTableHeadersProps,
    IDataTableHeadersSlotProps
} from './data-table-headers.interface'
import type {
    IDataTableItem,
    IDataTableItemBaseSlot,
    IDataTableItemKey,
    IDataTableItemSlot,
    IDataTableItemsProps
} from './items.interface'
import type {
    IDataTablePaginationProps,
    IDataTableProvidePagination
} from './pagination.interface'
import type {
    IDataTableProvideSelection,
    IDataTableSelectProps
} from './select.interface'
import type {
    IDataTableProvideSort,
    IDataTableSortItem,
    IDataTableSortProps
} from './sort.interface'
import type { IDataTableRowProps } from './data-table-row.interface'
import type { IFiltersProps } from '../Commons/filters.interface'
import type { ITableProps } from '../Table/table.interface'

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

/** Emits fired by `<OrigamDataTable>` — pagination, sorting, expansion,
 *  selection, and the v-model that ties them together.
 *
 *  ⛔ `update:groupBy` is deliberately NOT declared here. `groupBy` is a
 *  read-only-from-the-inside prop: `toggleGroup()` (exposed via
 *  `provideGroupBy`) only opens/closes an already-grouped section — it
 *  never writes `groupBy.value`, and nothing else in the component tree
 *  does either (`grep -rn "groupBy\.value\s*=" packages/ds/src/` → zero
 *  matches). Declaring an emit Vue never fires only removes a consumer's
 *  `@update:group-by` listener from `$attrs` for nothing — see
 *  `unemitted-declarations` guard. Removed under the same audit that
 *  fixed #373/#376/#416/#430/#446. */
export interface IDataTableEmits extends ICommonsComponentEmits {
    (e: 'update:page', value: number): void
    (e: 'update:itemsPerPage', value: number): void
    (e: 'update:sortBy', value: UnwrapRef<IDataTableProvideSort['sortBy']>): void
    (e: 'update:options', value: Record<string, unknown>): void
    (e: 'update:expanded', value: ReadonlySet<unknown>): void
    (e: 'update:currentItems', value: Array<IDataTableItem>): void
    /**
     * A row's expand toggle was activated. Relayed from
     * `<OrigamDataTableRow>` through `<OrigamDataTableRows>`; the payload
     * names the row and the state it moved to. `update:expanded` carries
     * the resulting SET — this one carries the row that caused it.
     */
    (e: 'expand', payload?: { item: IDataTableItem, value: boolean }): void
    /**
     * A row's select checkbox was activated. Same relay and same
     * relationship to `update:modelValue` as `expand` has to
     * `update:expanded`.
     */
    (e: 'select', payload?: { item: IDataTableItem, value: boolean }): void
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
    /**
     * Replaces the single "loading…" row. Relayed to
     * `<OrigamDataTableRows>`, which owns it. Renders inside `<tbody>`,
     * so the content must be `<tr>`-shaped.
     */
    loading?: () => any
    /** Replaces the single "no data" row. Same relay and same `<tr>` shape. */
    'no-data'?: () => any
    /**
     * Replaces a whole data row (the `<tr>` included). Relayed to
     * `<OrigamDataTableRows>`; `props` carries the exact binding the
     * default `<OrigamDataTableRow>` would have received.
     */
    item?: (props: IDataTableItemSlot<T>) => any
    /** Replaces a whole group-header row. Relayed to `<OrigamDataTableRows>`. */
    'group-header'?: (props: IDataTableGroupHeaderSlot) => any
    /** Extra row rendered under an expanded row. Relayed to `<OrigamDataTableRows>`. */
    'expanded-row'?: (props: IDataTableItemBaseSlot<T>) => any
    /**
     * The group-header's toggle cell. Travels two hops — through
     * `<OrigamDataTableRows>` to `<OrigamDataTableGroupHeaderRow>`.
     */
    'data-table-group'?: (props: IDataTableGroupHeaderRowGroupSlot) => any
    /** The group-header's select-all cell. Same two-hop relay. */
    'data-table-select'?: (props: IDataTableGroupHeaderRowSelectSlot) => any
    /**
     * Per-column cell content, `{key}` being a column definition's `key`.
     * Relayed through `<OrigamDataTableRows>` to `<OrigamDataTableRow>`.
     * `item.data-table-select` / `item.data-table-expand` address the two
     * built-in system columns.
     */
    [key: `item.${string}`]: ((props: IDataTableItemKey) => any) | undefined
    /**
     * Per-column header content. Reaches BOTH ends of the table: the
     * `<th>` (through `<OrigamDataTableHeaders>` →
     * `<OrigamDataTableHeadersCell>` → `<OrigamDataTableHeaderCell>`) and,
     * in mobile layout, the per-cell title inside each row.
     *
     * ⛔ `header.mobile` and `header.loader` are NOT part of this family
     * — they are the two named slots above, addressed to
     * `<OrigamDataTableHeaders>` itself.
     */
    [key: `header.${string}`]: ((props: any) => any) | undefined
}
