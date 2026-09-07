import type { UnwrapRef } from 'vue'
import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type {
    IDataTableExpandProps,
    IDataTableProvideExpanded
} from './expand.interface'
import type { IDataTableFooterProps } from './footer.interface'
import type {
    IDataTableGroup,
    IDataTableGroupableItem,
    IDataTableGroupHeaderRowGroupSlot,
    IDataTableGroupHeaderRowSelectSlot,
    IDataTableGroupHeaderSlot,
    IDataTableGroupProps,
    IDataTableProvideGroup
} from './group.interface'
import type {
    IDataTableHeaderProps,
    IInternalDataTableHeader
} from './data-table-header.interface'
import type {
    IDataTableHeadersProps,
    IDataTableHeadersSlotProps
} from './data-table-headers.interface'
import type {
    IDataTableItem,
    IDataTableItemBaseSlot,
    IDataTableItemKey,
    IDataTableItemSlot,
    IDataTableItemsProps
} from './items.interface'
import type {
    IDataTablePaginationProps,
    IDataTableProvidePagination
} from './pagination.interface'
import type {
    IDataTableProvideSelection,
    IDataTableSelectProps
} from './select.interface'
import type {
    IDataTableProvideSort,
    IDataTableSortItem,
    IDataTableSortProps
} from './sort.interface'
import type { IDataTableRowProps } from './data-table-row.interface'
import type { IFiltersProps } from '../Commons/filters.interface'
import type { ITableProps } from '../Table/table.interface'

export interface IDataTableProps extends ITableProps, IDataTableRowProps, IDataTableExpandProps, IDataTableGroupProps, IDataTableHeaderProps, IDataTableItemsProps, IDataTableSelectProps, IDataTableSortProps, IDataTableHeadersProps, IDataTablePaginationProps, IFiltersProps, IDataTableFooterProps {
    hideDefaultBody?: boolean
    hideDefaultFooter?: boolean
    hideDefaultHeader?: boolean
    search?: string
}

export interface IDataTableSlotProps<T> {
    page: number
    itemsPerPage: number
    /**
     * `readonly … | undefined`, not `UnwrapRef<IDataTableProvideSort['sortBy']>`:
     * this is the pre-`provide()` value straight out of `createSort()`'s
     * `useVModel(props, 'sortBy', [])`, which mirrors the OPTIONAL
     * `IDataTableSortProps.sortBy` prop type — not the always-defined,
     * mutable array `IDataTableProvideSort` exposes to descendants after
     * `provideSort()` runs.
     */
    sortBy: readonly IDataTableSortItem[] | undefined
    pageCount: number
    toggleSort: IDataTableProvideSort['toggleSort']
    setItemsPerPage: IDataTableProvidePagination['setItemsPerPage']
    someSelected: boolean
    allSelected: boolean
    isSelected: IDataTableProvideSelection['isSelected']
    select: IDataTableProvideSelection['select']
    selectAll: IDataTableProvideSelection['selectAll']
    toggleSelect: IDataTableProvideSelection['toggleSelect']
    isExpanded: IDataTableProvideExpanded['isExpanded']
    toggleExpand: IDataTableProvideExpanded['toggleExpand']
    isGroupOpen: IDataTableProvideGroup['isGroupOpen']
    toggleGroup: IDataTableProvideGroup['toggleGroup']
    items: T[]
    /**
     * `IDataTableGroupableItem<T>`, not `IDataTableItem<T>`: this is
     * `extractRows()`'s return type (flattened groups, no `key` / `index` /
     * `columns` guaranteed by the type system — those DO exist on the real
     * objects at runtime, but only because `OrigamDataTable`'s call site
     * narrows the generic through an `as unknown as` cast upstream of
     * `extractRows`, which this field can't see through).
     */
    internalItems: Array<IDataTableGroupableItem<T>>
    /** `readonly`: straight from `usePaginatedItems()`'s `Ref<readonly (T | IDataTableGroup<T>)[]>`. */
    groupedItems: ReadonlyArray<IDataTableItem<T> | IDataTableGroup<IDataTableItem<T>>>
    columns: Array<IInternalDataTableHeader>
    headers: Array<Array<IInternalDataTableHeader>>
}

/*********************************************************
 * IDataTableEmits
 *
 * @description
 * Emits de `<OrigamDataTable>` — pagination, tri, expansion, selection, et
 * le v-model qui les relie.
 *
 * @description
 * `expand` et `select` signalent l'activation de la bascule de depliage et
 * de la case a cocher d'une ligne, relayees depuis `<OrigamDataTableRow>` a
 * travers `<OrigamDataTableRows>` ; leur charge nomme la ligne et l'etat
 * atteint. ⛔ Leur relation aux `update:` correspondants est constante :
 * `update:expanded` et `update:modelValue` portent l'ENSEMBLE resultant,
 * ces deux-la portent la ligne qui l'a provoque.
 *
 * @description
 * ⛔ `update:groupBy` n'est deliberement PAS declare ici. `groupBy` est une
 * prop en lecture seule vue de l'interieur : `toggleGroup()` (expose par
 * `provideGroupBy`) ne fait qu'ouvrir ou fermer une section deja groupee —
 * il n'ecrit jamais `groupBy.value`, et rien d'autre dans l'arbre ne le fait
 * (`grep -rn "groupBy\.value\s*=" packages/ds/src/` ne rend aucune ligne).
 * Declarer un emit que Vue n'emet jamais ne fait que retirer l'ecouteur
 * `@update:group-by` d'un consommateur de `$attrs`, pour rien — voir le
 * garde `unemitted-declarations`. Retire par l'audit qui a corrige
 * #373/#376/#416/#430/#446.
 ********************************************************/
export interface IDataTableEmits extends ICommonsComponentEmits {
    (e: 'update:page', value: number): void
    (e: 'update:itemsPerPage', value: number): void
    (e: 'update:sortBy', value: UnwrapRef<IDataTableProvideSort['sortBy']>): void
    (e: 'update:options', value: Record<string, unknown>): void
    (e: 'update:expanded', value: ReadonlySet<unknown>): void
    (e: 'update:currentItems', value: Array<IDataTableItem>): void
    (e: 'expand', payload?: { item: IDataTableItem, value: boolean }): void
    (e: 'select', payload?: { item: IDataTableItem, value: boolean }): void
}

/*********************************************************
 * IDataTableSlots
 *
 * @description
 * Signatures de slots pour `<OrigamDataTable>`. `default` / `colgroup` /
 * `thead` / `prepend` / `body` / `append` partagent tous
 * `IDataTableSlotProps` (etat et actions de pagination, tri, selection,
 * expansion). `header` et `header.mobile` relaient 1:1 la portee propre
 * d'`<OrigamDataTableHeaders>`. `top`, `header.loader` et `bottom` rendent
 * sans portee — le slot `loader` de l'en-tete, relaye en `header.loader`,
 * ne lie rien non plus depuis son `<origam-progress>` par defaut.
 *
 * @description
 * Les quatre slots de LIGNE sont relayes a `<OrigamDataTableRows>`, qui les
 * possede : `loading` remplace la ligne « chargement », `no-data` la ligne
 * « aucune donnee », `item` une ligne de donnees entiere (`<tr>` compris,
 * avec la liaison exacte qu'aurait recue le `<OrigamDataTableRow>` par
 * defaut), et `expanded-row` la ligne supplementaire rendue sous une ligne
 * depliee. ⛔ Tous rendent DANS `<tbody>` : leur contenu doit avoir la forme
 * d'un `<tr>`.
 *
 * @description
 * `group-header` remplace une ligne d'en-tete de groupe. Ses deux cellules
 * — `data-table-group` (la bascule) et `data-table-select` (le tout
 * selectionner) — voyagent sur DEUX sauts, via `<OrigamDataTableRows>` puis
 * `<OrigamDataTableGroupHeaderRow>`.
 *
 * @description
 * Deux familles indexees par colonne ferment l'interface. `item.{cle}` porte
 * le contenu d'une cellule, `{cle}` etant la `key` d'une definition de
 * colonne ; `item.data-table-select` et `item.data-table-expand` adressent
 * les deux colonnes systeme integrees. `header.{cle}` porte le contenu d'un
 * en-tete et atteint les DEUX bouts de la table : le `<th>`, et le titre par
 * cellule dans la disposition mobile.
 *
 * @description
 * ⛔ `header.mobile` et `header.loader` ne font PAS partie de cette derniere
 * famille : ce sont les deux slots nommes plus haut, adresses a
 * `<OrigamDataTableHeaders>` lui-meme.
 ********************************************************/
export interface IDataTableSlots<T = any> {
    top?: () => any
    default?: (props: IDataTableSlotProps<T>) => any
    colgroup?: (props: IDataTableSlotProps<T>) => any
    header?: (props: IDataTableHeadersSlotProps) => any
    'header.mobile'?: (props: IDataTableHeadersSlotProps) => any
    'header.loader'?: () => any
    thead?: (props: IDataTableSlotProps<T>) => any
    prepend?: (props: IDataTableSlotProps<T>) => any
    body?: (props: IDataTableSlotProps<T>) => any
    append?: (props: IDataTableSlotProps<T>) => any
    bottom?: () => any
    loading?: () => any
    'no-data'?: () => any
    item?: (props: IDataTableItemSlot<T>) => any
    'group-header'?: (props: IDataTableGroupHeaderSlot) => any
    'expanded-row'?: (props: IDataTableItemBaseSlot<T>) => any
    'data-table-group'?: (props: IDataTableGroupHeaderRowGroupSlot) => any
    'data-table-select'?: (props: IDataTableGroupHeaderRowSelectSlot) => any
    [key: `item.${string}`]: ((props: IDataTableItemKey) => any) | undefined
    [key: `header.${string}`]: ((props: any) => any) | undefined
}
