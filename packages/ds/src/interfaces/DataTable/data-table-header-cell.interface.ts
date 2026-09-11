import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDataTableHeaderCellColumnSlot } from './items.interface'
import type { IHeaderCellProps } from './header-cell-base.interface'
import type { IInternalDataTableHeader } from './data-table-header.interface'

/*********************************************************
 * IDataTableHeaderCellProps / IDataTableHeaderCellSlots
 *
 * @description
 * Props/slots for `<OrigamDataTableHeaderCell>` — the only consumer.
 * Split out of `interfaces/DataTable/headers.interface.ts` under issue
 * #364, which used to hold four distinct component surfaces
 * (Headers / HeadersCell / HeaderCell / HeadersCellMobile) in one
 * file.
 ********************************************************/
export interface IDataTableHeaderCellProps extends ICommonsComponentProps, IHeaderCellProps, IColorProps, IBgColorProps {
    column: IInternalDataTableHeader
    x: number
    y: number
}

/** Slot signature for `<OrigamDataTableHeaderCell>` — the column-driven
 *  `header.{key}` name is only known at runtime (one column definition
 *  per header), so it's expressed as a template-literal index signature
 *  rather than a fixed key. */
export interface IDataTableHeaderCellSlots {
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
}

/*********************************************************
 * IDataTableHeaderCellEmits
 *
 * @description
 * `<OrigamDataTableHeaderCell>` toggles sort through `useSort` (shared
 * provide/inject state) and toggles select-all through `useSelection` —
 * nothing is emitted upward.
 ********************************************************/
export interface IDataTableHeaderCellEmits {}
