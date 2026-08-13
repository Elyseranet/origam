import type { ComputedRef, Ref, UnwrapRef } from 'vue'
import { ALIGN } from '../../enums'
import type {
    IAdjacentEmits,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDataTableHeaderCellColumnSlot,
    IDataTableItem,
    IDataTableSortItem,
    IDisplayProps,
    IInternalListItem,
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

/**
 * Deliberately NOT `extends IAdjacentProps`. This cell has no
 * consumer-facing prepend/append icon prop — the `appendIcon` rendered
 * inside it is a purely internal computed (the multi-select checkbox
 * glyph, see `appendIcon` in `OrigamDataTableHeadersCellMobile.vue`)
 * forwarded to the nested `<OrigamSelect>`'s own `IAdjacentProps.appendIcon`.
 * There is no `prependIcon` counterpart because there is nothing for a
 * consumer to set — adding one would fabricate an API this component
 * doesn't have a use for.
 */
export interface IDataTableHeadersCellMobileProps extends ICommonsComponentProps, IHeaderCellProps, IColorProps {
    columns: Array<IInternalDataTableHeader>
    colspan?: number
}

/** Emits fired by `<OrigamDataTableHeadersCellMobile>` — clear button +
 *  prepend / append slot clicks. */
export interface IDataTableHeadersCellMobileEmits extends IAdjacentEmits {
    (e: 'click:clear', event: MouseEvent): void
}

/** Scope forwarded on the `select.chip` slot — the underlying list item
 *  behind the chip, its index, and the draft props the default chip
 *  render would receive (spread them to keep the built-in click/close
 *  wiring when only restyling the chip). */
export interface IDataTableHeadersCellMobileChipSlot {
    item: IInternalListItem
    index: number
    chipProps: Record<string, unknown>
}

/** Slot signatures for `<OrigamDataTableHeadersCellMobile>` — almost
 *  entirely pass-through onto the internal `<origam-select>` /
 *  `<origam-chip>` it renders (mobile "sort by" picker), so most slots
 *  carry no scope of their own; only `select.chip` exposes one. */
export interface IDataTableHeadersCellMobileSlots {
    'select.prepend'?: () => any
    'select.loader'?: () => any
    'select.prependInner'?: () => any
    'select.floatingLabel'?: () => any
    'select.label'?: () => any
    'select.prefix'?: () => any
    'select.chip'?: (props: IDataTableHeadersCellMobileChipSlot) => any
    'select.selection'?: () => any
    'select.noData'?: () => any
    'select.prependItem'?: () => any
    'select.item'?: () => any
    'select.appendItem'?: () => any
    'select.suffix'?: () => any
    'select.appendInner'?: () => any
    clear?: () => any
    'select.append'?: () => any
    'chip:prepend'?: () => any
    'chip:default'?: () => any
    'chip:append'?: () => any
    'chip:close'?: () => any
    'chip:filter'?: () => any
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

/** Slot signatures for `<OrigamDataTableHeaders>` — `mobile` renders
 *  instead of `default` once `useDisplay` flips to the mobile layout;
 *  `loader` (the in-progress sort indicator row) carries no scope. */
export interface IDataTableHeadersSlots {
    mobile?: (props: IDataTableHeadersSlotProps) => any
    default?: (props: IDataTableHeadersSlotProps) => any
    loader?: () => any
}

/** Slot signature for `<OrigamDataTableHeaderCell>` — the column-driven
 *  `header.{key}` name is only known at runtime (one column definition
 *  per header), so it's expressed as a template-literal index signature
 *  rather than a fixed key. */
export interface IDataTableHeaderCellSlots {
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
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
