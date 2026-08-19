import type { ComputedRef, Ref, UnwrapRef } from 'vue'
import type {
    IColorProps,
    ICommonsComponentProps,
    IDataTableSortItem,
    IDisplayProps,
    IHeaderCellProps,
    IInternalDataTableHeader,
    ILoaderProps
} from '../../interfaces'

import type { TIcon } from '../../types'

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
