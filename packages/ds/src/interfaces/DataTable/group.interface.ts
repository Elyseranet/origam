import type { ComputedRef, Ref } from 'vue'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type {
    IDataTableItem,
    IDataTableItemBase
} from './items.interface'
import type { IDataTableSelectableItem } from './select.interface'
import type { IDataTableSortItem } from './sort.interface'
import type { IInternalDataTableHeader } from './data-table-header.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IDataTableGroupProps {
    groupBy?: Array<IDataTableSortItem>
}

export interface IDataTableGroupableItem<T = any> {
    type: 'item'
    raw: T
}

export interface IDataTableGroup<T = any> {
    type: 'group'
    depth: number
    id: string
    key: string
    value: any
    items: Array<(T | IDataTableGroup<T>)>
}

export interface IDataTableProvideGroup {
    sortByWithGroups: ComputedRef<Array<IDataTableSortItem>>
    toggleGroup: (group: IDataTableGroup) => void
    opened: Ref<Set<string> & Omit<Set<string>, keyof Set<any>>>
    groupBy: Ref<Array<IDataTableSortItem>>
    extractRows: (items: Array<IDataTableGroupableItem | IDataTableGroup<IDataTableGroupableItem>>) => Array<IDataTableGroupableItem>
    isGroupOpen: (group: IDataTableGroup) => boolean
}

export interface IDataTableGroupHeaderSlot<T = IDataTableGroup> extends IDataTableItemBase<T> {
    index: number
    item: T
    columns: IInternalDataTableHeader[]
    isExpanded: (item: IDataTableItem) => boolean
    toggleExpand: (item: IDataTableItem) => void
    isSelected: (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>) => boolean
    toggleSelect: (item: IDataTableSelectableItem) => void
    toggleGroup: (group: IDataTableGroup) => void
    isGroupOpen: (group: IDataTableGroup) => boolean
}

/*********************************************************
 * IDataTableGroupHeaderRowProps
 *
 * @description
 * ⛔ BREAKING (garde `unconsumed-props`) — cinq entrees ont ete retirees
 * de cette interface parce que le composant ne pouvait rien en faire :
 *
 *   - `IPaddingProps` (7 props). La racine rendue est un `<tr>` : le
 *     modele de boite CSS ignore `padding` sur `display: table-row`. La
 *     binder aurait produit un vert de facade. Le padding des cellules
 *     est deja porte par `<OrigamDataTableColumnCell>`, qui consomme
 *     `usePadding`. La ligne d'items sœur, `IDataTableRowProps`, n'a
 *     jamais etendu `IPaddingProps` — l'asymetrie etait accidentelle.
 *   - `internalItem`, `isExpanded`, `toggleExpand`. Une ligne d'en-tete de
 *     groupe n'expose AUCUNE affordance d'expand : il n'y avait pas de
 *     site de consommation a ecrire.
 *   - `toggleSelect`. Sa signature `(item) => void` BASCULE un item ; la
 *     case de groupe doit POSER une valeur sur toutes les lignes
 *     (`select(rows, v)`). Sur un groupe partiellement selectionne, la
 *     basculer par item inverserait chaque ligne au lieu de les aligner.
 *
 * @description
 * `isSelected` et `toggleGroup` restent declarees et sont desormais
 * reellement lues par le composant, la prop l'emportant sur le retour de
 * `useSelection()` / `useGroupBy()` — ce qui rend l'usage autonome (hors
 * `<OrigamDataTable>`) possible.
 ********************************************************/
export interface IDataTableGroupHeaderRowProps<T = IDataTableGroup> extends ICommonsComponentProps, IColorProps {
    index: number
    item: T
    columns: IInternalDataTableHeader[]
    isSelected: (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>) => boolean
    toggleGroup: (group: IDataTableGroup) => void
}

/** Scope for the `data-table-group` slot — the group's own toggle button
 *  (`props`) is pre-wired so a custom render can spread it onto any
 *  trigger element and still collapse/expand correctly. */
export interface IDataTableGroupHeaderRowGroupSlot<T = IDataTableGroup> {
    item: T
    count: number
    props: {
        icon: TIcon
        onClick: () => void
    }
}

/** Scope for the `data-table-select` slot — mirrors the group's row-select
 *  checkbox binding (`v-bind="props"` reproduces the default checkbox). */
export interface IDataTableGroupHeaderRowSelectSlot {
    props: {
        modelValue: boolean
        indeterminate: boolean
        'onUpdate:modelValue': (value: boolean) => void
    }
}

export interface IDataTableGroupHeaderRowSlots<T = IDataTableGroup> {
    'data-table-group'?: (props: IDataTableGroupHeaderRowGroupSlot<T>) => any
    'data-table-select'?: (props: IDataTableGroupHeaderRowSelectSlot) => any
}

/*********************************************************
 * IDataTableGroupHeaderRowEmits
 *
 * @description
 * `<OrigamDataTableGroupHeaderRow>` toggles group/selection state through
 * `useGroupBy` / `useSelection` (shared provide/inject state) — nothing
 * is emitted upward.
 ********************************************************/
export interface IDataTableGroupHeaderRowEmits {}
