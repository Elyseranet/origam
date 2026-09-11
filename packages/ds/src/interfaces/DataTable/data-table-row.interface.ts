import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type {
    IDataTableHeaderCellColumnSlot,
    IDataTableItem,
    IDataTableItemKey
} from './items.interface'
import type { IDisplayProps } from '../Commons/display.interface'

import type { TDataTableCell } from '../../types/DataTable/data-table.type'

/*********************************************************
 * IDataTableRowProps / IDataTableRowEmits / IDataTableRowSlots
 *
 * @description
 * Props/emits/slots for `<OrigamDataTableRow>` — the only consumer.
 * Split out of `interfaces/DataTable/row.interface.ts` under issue
 * #364, which used to hold two distinct component surfaces
 * (Rows / Row) in one file.
 ********************************************************/
export interface IDataTableRowProps extends ICommonsComponentProps, IDisplayProps {
    item: IDataTableItem
    cellProps?: TDataTableCell<any>
}

/** Emits fired by `<OrigamDataTableRow>` — row-level expand / select. */
export interface IDataTableRowEmits {
    (e: 'expand', payload?: { item: IDataTableItem, value: boolean }): void
    (e: 'select', payload?: { item: IDataTableItem, value: boolean }): void
}

/** Slot signatures for `<OrigamDataTableRow>` — one row's per-column
 *  content. Column-driven slot names (`item.{key}` / `header.{key}`) are
 *  only known at runtime, so they're expressed as template-literal index
 *  signatures rather than a fixed key list. The two built-in system
 *  columns (`data-table-select`, `data-table-expand`) are also listed
 *  explicitly for IDE discoverability — both already satisfy the
 *  `item.${string}` pattern. */
export interface IDataTableRowSlots {
    'item.data-table-select'?: (props: IDataTableItemKey) => any
    'item.data-table-expand'?: (props: IDataTableItemKey) => any
    [key: `item.${string}`]: ((props: IDataTableItemKey) => any) | undefined
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
}
