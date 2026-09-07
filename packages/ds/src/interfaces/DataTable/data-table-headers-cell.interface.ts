import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDataTableHeaderCellColumnSlot } from './items.interface'
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
 * `<OrigamDataTableHeadersCell>` owns no slot CONTENT — it is a repeater
 * over `headers` — but it is a link in the `header.{key}` relay, so it
 * must declare the family to hand it to
 * `<origam-data-table-header-cell>`, which renders it.
 ********************************************************/
export interface IDataTableHeadersCellSlots {
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
}

/*********************************************************
 * IDataTableHeadersCellEmits
 *
 * @description
 * `<OrigamDataTableHeadersCell>` has no click/interaction handler of its
 * own — every column cell forwards to `<origam-data-table-header-cell>`.
 * Nothing is emitted upward.
 ********************************************************/
export interface IDataTableHeadersCellEmits {}
