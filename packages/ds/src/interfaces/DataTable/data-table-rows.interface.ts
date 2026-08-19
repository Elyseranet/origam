import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type {
    IDataTableGroup,
    IDataTableGroupHeaderSlot
} from './group.interface'
import type {
    IDataTableItem,
    IDataTableItemBaseSlot,
    IDataTableItemSlot
} from './items.interface'
import type { IDisplayProps } from '../Commons/display.interface'
import type { ILoaderProps } from '../Commons/loader.interface'

import type {
    TDataTableCell,
    TDataTableRow
} from '../../types/DataTable/data-table.type'

/*********************************************************
 * IDataTableRowsProps
 *
 * @description
 * Props for `<OrigamDataTableRows>` — the only consumer. Split out of
 * `interfaces/DataTable/row.interface.ts` under issue #364, which used
 * to hold two distinct component surfaces (Rows / Row) in one file.
 ********************************************************/
export interface IDataTableRowsProps extends ICommonsComponentProps, ILoaderProps, IDisplayProps {
    hideNoData?: boolean
    items?: Array<IDataTableItem | IDataTableGroup> | readonly (IDataTableItem | IDataTableGroup)[]
    noDataText?: string
    rowProps?: TDataTableRow<any>,
    cellProps?: TDataTableCell<any>
}

/** Slot signatures for `<OrigamDataTableRows>` — the list-level renderer
 *  (loading / empty states, then one `group-header` or `item` per row). */
export interface IDataTableRowsSlots<T = any> {
    loading?: () => any
    'no-data'?: () => any
    'group-header'?: (props: IDataTableGroupHeaderSlot) => any
    item?: (props: IDataTableItemSlot<T>) => any
    /**
     * Same base scope as `group-header` / `item` (index, item,
     * internalItem, columns + expand/select actions). The template used
     * to forward the local `slotProps` FUNCTION reference unevaluated
     * (`v-bind="slotProps"` instead of `v-bind="slotProps(item, index)"`),
     * which passed an empty object at runtime — fixed alongside this type
     * so declared and actual scope match.
     */
    'expanded-row'?: (props: IDataTableItemBaseSlot<T>) => any
}
