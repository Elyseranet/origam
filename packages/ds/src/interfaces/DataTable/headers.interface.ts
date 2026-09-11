import type { ComputedRef, Ref, UnwrapRef } from 'vue'
import { ALIGN } from '../../enums'
import type {
    IAdjacentEmits,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDataTableItem,
    IDataTableSortItem,
    IDisplayProps,
    ILoaderProps
} from '../../interfaces'

import type {
    TDataTableCompareFunction,
    TDataTableHeaderCell,
    TFilterFunction,
    TIcon,
    TSelectItemKey
} from '../../types'

export interface IHeaderCellProps extends ICommonsComponentProps, IColorProps {
    disableSort?: boolean
    headerProps?: any
    sticky?: boolean
    multiSort?: boolean
    sortAscIcon?: TIcon
    sortDescIcon?: TIcon
}

export interface IDataTableHeadersProps extends ICommonsComponentProps, IColorProps, IDisplayProps, ILoaderProps, IHeaderCellProps {

}

export interface IDataTableHeadersCellMobileProps extends ICommonsComponentProps, IHeaderCellProps, IColorProps {
    columns: Array<IInternalDataTableHeader>
    colspan?: number
}

/** Emits fired by `<OrigamDataTableHeadersCellMobile>` — clear button +
 *  prepend / append slot clicks. */
export interface IDataTableHeadersCellMobileEmits extends IAdjacentEmits {
    (e: 'click:clear', event: MouseEvent): void
}

export interface IDataTableHeadersCellProps extends ICommonsComponentProps, IColorProps, IHeaderCellProps {
    headers: Array<Array<IInternalDataTableHeader>>
}

export interface IDataTableHeaderCellProps extends ICommonsComponentProps, IHeaderCellProps, IColorProps, IBgColorProps {
    column: IInternalDataTableHeader
    x: number
    y: number
}

export interface IDataTableHeadersSlotProps {
    headers: Array<Array<IInternalDataTableHeader>>
    columns: Array<IInternalDataTableHeader>
    sortBy: UnwrapRef<Ref<Array<IDataTableSortItem>>>
    someSelected: UnwrapRef<ComputedRef<boolean>>
    allSelected: UnwrapRef<ComputedRef<boolean>>
    toggleSort: (column: IInternalDataTableHeader) => void
    selectAll: (value: boolean) => void
    getSortIcon: (column: IInternalDataTableHeader) => TIcon | undefined
    isSorted: (column: IInternalDataTableHeader) => boolean
}

export interface IDataTableHeaderProps {
    headers?: Array<IDataTableHeader>
    items?: Array<IDataTableItem>
}

export interface IDataTableHeader<T = any> {
    key?: 'data-table-group' | 'data-table-select' | 'data-table-expand' | (string & {})
    value?: TSelectItemKey<T>
    title?: string

    fixed?: boolean
    align?: ALIGN.START | ALIGN.END | ALIGN.CENTER

    width?: number | string
    minWidth?: string
    maxWidth?: string
    nowrap?: boolean

    headerProps?: any
    cellProps?: TDataTableHeaderCell

    sortable?: boolean
    sort?: TDataTableCompareFunction
    sortRaw?: TDataTableCompareFunction
    filter?: TFilterFunction

    mobile?: boolean

    children?: Array<IDataTableHeader<T>>
}

export interface IInternalDataTableHeader extends Omit<IDataTableHeader, 'key' | 'value' | 'children'> {
    key: string | null
    value: TSelectItemKey | null

    sortable: boolean
    fixedOffset?: number
    lastFixed?: boolean
    nowrap?: boolean
    padding?: string | number
    colspan?: number
    rowspan?: number

    children?: Array<IInternalDataTableHeader>
}
