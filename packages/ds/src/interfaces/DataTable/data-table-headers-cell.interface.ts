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
