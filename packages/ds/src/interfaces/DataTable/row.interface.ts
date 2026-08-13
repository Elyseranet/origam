import type {
    ICommonsComponentProps,
    IDataTableGroup,
    IDataTableGroupHeaderSlot,
    IDataTableHeaderCellColumnSlot,
    IDataTableItem,
    IDataTableItemBaseSlot,
    IDataTableItemKey,
    IDataTableItemSlot,
    IDisplayProps,
    ILoaderProps
} from '../../interfaces'

import type { TDataTableCell, TDataTableRow } from '../../types'

export interface IDataTableRowsProps extends ICommonsComponentProps, ILoaderProps, IDisplayProps {
    hideNoData?: boolean
    items?: Array<IDataTableItem | IDataTableGroup> | readonly (IDataTableItem | IDataTableGroup)[]
    noDataText?: string
    rowProps?: TDataTableRow<any>,
    cellProps?: TDataTableCell<any>
}

export interface IDataTableRowProps extends ICommonsComponentProps, IDisplayProps {
    item: IDataTableItem
    cellProps?: TDataTableCell<any>
}

/** Emits fired by `<OrigamDataTableRow>` — row-level expand / select. */
export interface IDataTableRowEmits {
    (e: 'expand', payload?: { item: IDataTableItem, value: boolean }): void
    (e: 'select', payload?: { item: IDataTableItem, value: boolean }): void
}

/** Slot signatures for `<OrigamDataTableRows>` — the list-level renderer
 *  (loading / empty states, then one `group-header` or `item` per row). */
export interface IDataTableRowsSlots<T = any> {
    loading?: () => any
    'no-data'?: () => any
    'group-header'?: (props: IDataTableGroupHeaderSlot) => any
    item?: (props: IDataTableItemSlot<T>) => any
    /**
     * Same base scope as `group-header` / `item` (index, item,
     * internalItem, columns + expand/select actions). The template used
     * to forward the local `slotProps` FUNCTION reference unevaluated
     * (`v-bind="slotProps"` instead of `v-bind="slotProps(item, index)"`),
     * which passed an empty object at runtime — fixed alongside this type
     * so declared and actual scope match.
     */
    'expanded-row'?: (props: IDataTableItemBaseSlot<T>) => any
}

/** Slot signatures for `<OrigamDataTableRow>` — one row's per-column
 *  content. Column-driven slot names (`item.{key}` / `header.{key}`) are
 *  only known at runtime, so they're expressed as template-literal index
 *  signatures rather than a fixed key list. The two built-in system
 *  columns (`data-table-select`, `data-table-expand`) are also listed
 *  explicitly for IDE discoverability — both already satisfy the
 *  `item.${string}` pattern. */
export interface IDataTableRowSlots {
    'item.data-table-select'?: (props: IDataTableItemKey) => any
    'item.data-table-expand'?: (props: IDataTableItemKey) => any
    [key: `item.${string}`]: ((props: IDataTableItemKey) => any) | undefined
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
}
