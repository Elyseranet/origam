import type { IDataTableGroupableItem } from './group.interface'
import type { IDataTableSelectableItem } from './select.interface'
import type { IDataTableSortItem } from './sort.interface'
import type { IInternalDataTableHeader } from './data-table-header.interface'
import type { IInternalItem } from '../List/list-children.interface'

import type {
    TDataTableCell,
    TDataTableRow
} from '../../types/DataTable/data-table.type'
import type { TIcon } from '../../types/Icon/icon.type'
import type { TSelectItemKey } from '../../types/Commons/commons.type'

export interface IDataTableItemsProps {
    items?: Array<IDataTableItem>
    itemValue?: TSelectItemKey
    itemSelectable?: TSelectItemKey
    rowProps?: TDataTableRow<any>
    cellProps?: TDataTableCell<any>
    returnObject?: boolean
}

export interface IDataTableItem<T = any> extends IInternalItem<T>, IDataTableGroupableItem<T>, IDataTableSelectableItem {
    key: any
    index: number
    columns: {
        [key: string]: any
    }
}

export interface IDataTableItemBase<T = any> {
    index: number
    item: T
    internalItem: IDataTableItem<T>
    isExpanded: (item: IDataTableItem) => boolean
    toggleExpand: (item: IDataTableItem) => void
    isSelected: (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>) => boolean
    toggleSelect: (item: IDataTableSelectableItem) => void
}

export interface IDataTableItemKey<T = any> extends IDataTableItemBase<T> {
    value: any
    column: IInternalDataTableHeader
}

export interface IDataTableItemBaseSlot<T = any> extends IDataTableItemBase<T> {
    columns: IInternalDataTableHeader[]
}

export interface IDataTableItemSlot<T = any> extends IDataTableItemBase<T> {
    columns: IInternalDataTableHeader[]
    props: any
}

/**
 * Scope shared by the `header.{key}` slot on `<OrigamDataTableHeaderCell>`
 * and its forward on `<OrigamDataTableRow>` (mobile column-title cell).
 * `sortBy` / `someSelected` / `allSelected` are the UNWRAPPED values
 * (`ref.value`) both call sites pass — not the `Ref` / `ComputedRef`
 * containers themselves.
 */
export interface IDataTableHeaderCellColumnSlot {
    column: IInternalDataTableHeader
    selectAll: (value: boolean) => void
    isSorted: (column: IInternalDataTableHeader) => boolean
    toggleSort: (column: IInternalDataTableHeader) => void
    sortBy: Array<IDataTableSortItem>
    someSelected: boolean
    allSelected: boolean
    getSortIcon: (column: IInternalDataTableHeader) => TIcon | undefined
}
