import type {
    ICommonsComponentProps,
    IDataTableGroup,
    IDataTableItem,
    IDisplayProps,
    ILoaderProps
} from '../../interfaces'

import type { TDataTableCell, TDataTableRow } from '../../types'

export interface IDataTableRowsProps extends ICommonsComponentProps, ILoaderProps, IDisplayProps {
    hideNoData?: boolean
    items?: Array<IDataTableItem | IDataTableGroup> | readonly (IDataTableItem | IDataTableGroup)[]
    noDataText?: string
    rowProps?: TDataTableRow<any>,
    cellProps?: TDataTableCell<any>
}

export interface IDataTableRowProps extends ICommonsComponentProps, IDisplayProps {
    item: IDataTableItem
    cellProps?: TDataTableCell<any>
}

/** Emits fired by `<OrigamDataTableRow>` — row-level expand / select. */
export interface IDataTableRowEmits {
    (e: 'expand', payload?: { item: IDataTableItem, value: boolean }): void
    (e: 'select', payload?: { item: IDataTableItem, value: boolean }): void
}
