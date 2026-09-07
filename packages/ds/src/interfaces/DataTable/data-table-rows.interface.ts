import type {
    IDataTableGroup,
    IDataTableGroupHeaderRowGroupSlot,
    IDataTableGroupHeaderRowSelectSlot,
    IDataTableGroupHeaderSlot
} from './group.interface'
import type {
    IDataTableHeaderCellColumnSlot,
    IDataTableItem,
    IDataTableItemBaseSlot,
    IDataTableItemKey,
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
 * ⛔ `class`, `style` et `tag` sont RETIRES de la surface heritee de
 * `ILoaderProps` (qui etend lui-meme `ICommonsComponentProps` et
 * `ITagProps`). `<OrigamDataTableRows>` rend un FRAGMENT — jusqu'a cinq
 * `<tr>` squelettes, ou une ligne par item — sans racine unique, donc sans
 * rien sur quoi Vue puisse appliquer un fallthrough. `tag` n'a pas d'objet
 * non plus : le contenu d'un `<tbody>` ne peut etre qu'un `<tr>`.
 *
 * @description
 * Les declarer etait PIRE que de les omettre : une prop declaree sort de
 * `$attrs`, donc un consommateur qui ecrivait `class="x"` perdait sa classe
 * en silence, sans meme l'avertissement « Extraneous non-props attributes »
 * que Vue emet sur un fragment. Mesure : `packages/tests/TU/components/
 * DataTable/data-table-rows-dead-props.spec.ts`. Meme cas structurel
 * qu'`<OrigamDefaultsProvider>`, dont le template est un `<slot/>` nu.
 * Issue #550, critere C1.
 *
 * @description
 * `id` reste : il sert de racine aux identifiants de ligne generes
 * (`${id}-row-${index}`, `${id}-skeleton-row-${index}`). `color` reste et
 * est desormais CABLE — il peint la ligne de chargement et la ligne
 * « aucune donnee » via `useTextColor`, ce que le controle « Loader Color »
 * de la story annoncait deja sans effet.
 ********************************************************/
export interface IDataTableRowsProps extends Omit<ILoaderProps, 'class' | 'style' | 'tag'>, IDisplayProps {
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
    /**
     * Relayed verbatim to `<OrigamDataTableGroupHeaderRow>` — the group's
     * own toggle cell. Declared here so the name survives the hop from
     * `<OrigamDataTable>`; this component renders no `<slot>` under that
     * name itself.
     */
    'data-table-group'?: (props: IDataTableGroupHeaderRowGroupSlot) => any
    /**
     * Relayed verbatim to `<OrigamDataTableGroupHeaderRow>` — the group's
     * select-all checkbox cell. Same relay-only status as
     * `data-table-group`.
     */
    'data-table-select'?: (props: IDataTableGroupHeaderRowSelectSlot) => any
    /**
     * Column-driven cell content, relayed to `<OrigamDataTableRow>`. The
     * `{key}` half is a column definition's `key`, known only at runtime.
     */
    [key: `item.${string}`]: ((props: IDataTableItemKey) => any) | undefined
    /**
     * Column title rendered next to the value once the row flips to the
     * mobile layout, relayed to `<OrigamDataTableRow>`.
     */
    [key: `header.${string}`]: ((props: IDataTableHeaderCellColumnSlot) => any) | undefined
}

/*********************************************************
 * IDataTableRowsEmits
 *
 * @description
 * Group interaction travels through `useExpanded` / `useSelection` /
 * `useGroupBy` (shared provide/inject state) and the `:row.*` /
 * `:group-header.*` attr-forwarded handlers.
 *
 * @description
 * `expand` / `select` are the exception: they are ROW-level events, and
 * `<OrigamDataTableRow>` is mounted here, so this component is the only
 * place that can carry them up to `<OrigamDataTable>`. Both are re-fired
 * verbatim — same payload, no enrichment.
 ********************************************************/
export interface IDataTableRowsEmits {
    (e: 'expand', payload?: { item: IDataTableItem, value: boolean }): void
    (e: 'select', payload?: { item: IDataTableItem, value: boolean }): void
}
