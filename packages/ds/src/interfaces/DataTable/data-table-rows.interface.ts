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
/*********************************************************
 * IDataTableRowsProps
 *
 * @description
 * ⛔ N'etend PAS `ICommonsComponentProps` : `<OrigamDataTableRows>` rend un
 * FRAGMENT — plusieurs `<tr>` cote a cote, sans racine unique. `id`, `class`
 * et `style` n'ont aucun element sur lequel atterrir, et Vue n'a rien a quoi
 * appliquer un fallthrough.
 *
 * @description
 * Les declarer etait pire que de les omettre : une prop declaree sort de
 * `$attrs`, donc un consommateur qui ecrivait `class="x"` perdait sa classe
 * en silence. Meme cas structurel qu'`<OrigamDefaultsProvider>`, dont le
 * template est un `<slot/>` nu. Issue #550, critere C1.
 ********************************************************/
export interface IDataTableRowsProps extends ILoaderProps, IDisplayProps {
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

/*********************************************************
 * IDataTableRowsEmits
 *
 * @description
 * `<OrigamDataTableRows>` forwards row/group interaction through
 * `useExpanded` / `useSelection` / `useGroupBy` (shared provide/inject
 * state) and the `:row.*` / `:group-header.*` attr-forwarded handlers —
 * nothing is emitted upward via `defineEmits`.
 ********************************************************/
export interface IDataTableRowsEmits {}
