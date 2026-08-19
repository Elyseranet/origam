import type { IColorProps, ICommonsComponentProps, IHeaderCellProps, IInternalDataTableHeader } from '../../interfaces'

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
