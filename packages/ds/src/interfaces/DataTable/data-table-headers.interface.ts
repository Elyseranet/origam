import type { ComputedRef, Ref, UnwrapRef } from 'vue'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDataTableHeaderCellColumnSlot } from './items.interface'
import type { IDataTableSortItem } from './sort.interface'
import type { IDisplayProps } from '../Commons/display.interface'
import type { IHeaderCellProps } from './header-cell-base.interface'
import type { IInternalDataTableHeader } from './data-table-header.interface'
import type { ILoaderProps } from '../Commons/loader.interface'

import type { TIcon } from '../../types/Icon/icon.type'

/*********************************************************
 * IDataTableHeadersProps
 *
 * @description
 * Props for `<OrigamDataTableHeaders>` — the only consumer. Split out
 * of `interfaces/DataTable/headers.interface.ts` under issue #364,
 * which used to hold four distinct component surfaces
 * (Headers / HeadersCell / HeaderCell / HeadersCellMobile) in one
 * file.
 ********************************************************/
export interface IDataTableHeadersProps extends ICommonsComponentProps, IColorProps, IDisplayProps, ILoaderProps, IHeaderCellProps {

}

export interface IDataTableHeadersSlotProps {
    headers: Array<Array<IInternalDataTableHeader>>
    columns: Array<IInternalDataTableHeader>
    sortBy: UnwrapRef<Ref<Array<IDataTableSortItem>>>
    someSelected: UnwrapRef<ComputedRef<boolean>>
    allSelected: UnwrapRef<ComputedRef<boolean>>
    toggleSort: (column: IInternalDataTableHeader) => void
    selectAll: (value: boolean) => void
    getSortIcon: (column: IInternalDataTableHeader) => TIcon | undefined
    isSorted: (column: IInternalDataTableHeader) => boolean
}

/*********************************************************
 * IDataTableHeadersSlots
 *
 * @description
 * Signatures de slots pour `<OrigamDataTableHeaders>`. `mobile` rend a la
 * place de `default` des que `useDisplay` bascule en disposition mobile ;
 * `loader` — la ligne d'indicateur de tri en cours — ne porte aucune portee.
 *
 * @description
 * ⛔ La famille indexee `header.{cle}` porte le contenu d'un `<th>` pilote
 * par une colonne, et n'est rendue NULLE PART dans ce composant : elle est
 * relayee telle quelle a `<OrigamDataTableHeadersCell>`, qui la relaie a son
 * tour a `<OrigamDataTableHeaderCell>` — le seul maillon qui possede un
 * `<slot name="header.{cle}">`.
 ********************************************************/
export interface IDataTableHeadersSlots {
    mobile?: (props: IDataTableHeadersSlotProps) => any
    default?: (props: IDataTableHeadersSlotProps) => any
    loader?: () => any
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
}

/*********************************************************
 * IDataTableHeadersEmits
 *
 * @description
 * `<OrigamDataTableHeaders>` toggles sort/select through `useSort` /
 * `useSelection` (shared provide/inject state) — nothing is emitted
 * upward.
 ********************************************************/
export interface IDataTableHeadersEmits {}
