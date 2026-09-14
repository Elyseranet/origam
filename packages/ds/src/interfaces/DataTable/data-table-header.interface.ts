import { ALIGN } from '../../enums/Commons/align.enum'
import type { IDataTableItem } from './items.interface'
import type {
    TDataTableCompareFunction,
    TDataTableHeaderCell
} from '../../types/DataTable/data-table.type'
import type { TFilterFunction } from '../../types/Commons/filters.type'
import type { TSelectItemKey } from '../../types/Commons/commons.type'

/*********************************************************
 * IDataTableHeaderProps / IDataTableHeader / IInternalDataTableHeader
 *
 * @description
 * The column-descriptor types consumed across the whole DataTable
 * family (its own `IDataTableProps`, the `useHeaders` / `useSort` /
 * `useCell` composables, `headers.util.ts`, `items.util.ts`, …) — not
 * tied to any single header-related component. Intra-family sharing,
 * own file for the same reason as `IHeaderCellProps`.
 ********************************************************/
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
