import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IHeaderCellProps } from './header-cell-base.interface'
import type { IInternalDataTableHeader } from './data-table-header.interface'

/*********************************************************
 * IDataTableHeadersCellProps
 *
 * @description
 * Props for `<OrigamDataTableHeadersCell>` — the only consumer. Split
 * out of `interfaces/DataTable/headers.interface.ts` under issue
 * #364, which used to hold four distinct component surfaces
 * (Headers / HeadersCell / HeaderCell / HeadersCellMobile) in one
 * file.
 ********************************************************/
export interface IDataTableHeadersCellProps extends ICommonsComponentProps, IColorProps, IHeaderCellProps {
    headers: Array<Array<IInternalDataTableHeader>>
}

/*********************************************************
 * IDataTableHeadersCellSlots
 *
 * @description
 * `<OrigamDataTableHeadersCell>` renders no `<slot>` at all — it's a
 * pure repeater over `headers` forwarding into
 * `<origam-data-table-header-cell>`.
 ********************************************************/
export interface IDataTableHeadersCellSlots {}

/*********************************************************
 * IDataTableHeadersCellEmits
 *
 * @description
 * `<OrigamDataTableHeadersCell>` has no click/interaction handler of its
 * own — every column cell forwards to `<origam-data-table-header-cell>`.
 * Nothing is emitted upward.
 ********************************************************/
export interface IDataTableHeadersCellEmits {}
