import type { ComputedRef, Ref } from 'vue'
import type {
    IDataTableGroupableItem,
    IDataTableSelectableItem,
    IDataTableSortItem,
    IInternalDataTableHeader,
    IInternalItem
} from '../../interfaces'

import type { TDataTableCell, TDataTableRow, TIcon, TSelectItemKey } from '../../types'

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

export interface IDataTableHeaderCellColumnSlot {
    column: IInternalDataTableHeader
    selectAll: (value: boolean) => void
    isSorted: (column: IInternalDataTableHeader) => boolean
    toggleSort: (column: IInternalDataTableHeader) => void
    sortBy: Ref<Array<IDataTableSortItem>>
    someSelected: ComputedRef<boolean>
    allSelected: ComputedRef<boolean>
    getSortIcon: (column: IInternalDataTableHeader) => TIcon
}
