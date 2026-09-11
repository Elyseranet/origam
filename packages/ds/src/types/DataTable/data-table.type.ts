import OrigamDataTable from '../../components/DataTable/OrigamDataTable.vue'

import { DATA_TABLE_ROWS_SLOT_NAMES } from '../../consts/DataTable/data-table.const'
import { DATATABLE_SELECT_STRATEGY } from '../../enums/DataTable/data-table.enum'

import type { IDataTableItemKey } from '../../interfaces/DataTable/items.interface'

import type { TDataTableRowSlotName } from './data-table-rows.type'

export type TDataTableCompareFunction<T = any> = (a: T, b: T) => number | null

export type TDataTableHeaderCell =
    | Record<string, any>
    | ((data: Pick<IDataTableItemKey<any>, 'index' | 'item' | 'internalItem' | 'value'>) => Record<string, any>)

export type TDataTableRow<T> =
    | Record<string, any>
    | ((data: Pick<IDataTableItemKey<T>, 'index' | 'item' | 'internalItem'>) => Record<string, any>)

export type TDataTableCell<T> =
    | Record<string, any>
    | ((data: Pick<IDataTableItemKey<T>, 'index' | 'item' | 'internalItem' | 'value' | 'column'>) => Record<string, any>)

export type TDataTableSelectStrategy = `${DATATABLE_SELECT_STRATEGY}`

export type TOrigamDataTable = InstanceType<typeof OrigamDataTable>

/*********************************************************
 * TDataTableRowsSlotName
 *
 * @description
 * Tout nom de slot que `<OrigamDataTable>` relaie a
 * `<OrigamDataTableRows>` : les noms fixes de la constante, plus les deux
 * familles pilotees par colonne que l'enfant declare de son cote.
 ********************************************************/
export type TDataTableRowsSlotName = typeof DATA_TABLE_ROWS_SLOT_NAMES[number] | TDataTableRowSlotName
