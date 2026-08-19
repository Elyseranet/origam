import type { IBgColorProps, IColorProps, ICommonsComponentProps, IDataTableHeaderCellColumnSlot, IHeaderCellProps, IInternalDataTableHeader } from '../../interfaces'

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
