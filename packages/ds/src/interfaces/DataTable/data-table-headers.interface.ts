import type { ComputedRef, Ref, UnwrapRef } from 'vue'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDataTableSortItem } from './sort.interface'
import type { IDisplayProps } from '../Commons/display.interface'
import type { IHeaderCellProps } from './header-cell-base.interface'
import type { IInternalDataTableHeader } from './data-table-header.interface'
import type { ILoaderProps } from '../Commons/loader.interface'

import type { TIcon } from '../../types/Icon/icon.type'

/*********************************************************
 * IDataTableHeadersProps
 *
 * @description
 * Props for `<OrigamDataTableHeaders>` — the only consumer. Split out
 * of `interfaces/DataTable/headers.interface.ts` under issue #364,
 * which used to hold four distinct component surfaces
 * (Headers / HeadersCell / HeaderCell / HeadersCellMobile) in one
 * file.
 ********************************************************/
export interface IDataTableHeadersProps extends ICommonsComponentProps, IColorProps, IDisplayProps, ILoaderProps, IHeaderCellProps {

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

/** `<OrigamDataTableHeaders>` toggles sort/select through `useSort` /
 *  `useSelection` (shared provide/inject state) — nothing is emitted
 *  upward. */
export interface IDataTableHeadersEmits {}
