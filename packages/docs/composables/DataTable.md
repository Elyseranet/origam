# Composables — DataTable

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

22 symbole(s) exporte(s).

## `createGroupBy`

```ts
export function createGroupBy (props: IDataTableGroupProps)
```

Reads the `groupBy` prop into the v-model ref `provideGroupBy`
expects. Kept alongside `useGroupBy` / `provideGroupBy` in this file
— all three address the same `ORIGAM_DATA_TABLE_GROUP_KEY` contract.
`useGroupedItems` (own file) is the pure item-grouping sibling and
does not depend on any of the three.

**Source** : `packages/ds/src/composables/DataTable/group.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `createHeaders`

```ts
export function createHeaders ( props: IDataTableHeaderProps, options?:
```

Normalises the raw `headers` prop (or infers columns from the first
item) into the internal multi-row header + column + sort/filter
function maps, and provides `ORIGAM_DATA_TABLE_HEADERS_KEY` for
`useHeaders` consumers down the tree. Kept alongside `useHeaders` in
this file — the two address the same contract. `useHeadersCell` (own
file) is the per-cell sort-icon sibling and depends on `useSort`
instead, not on this injection.

**Source** : `packages/ds/src/composables/DataTable/headers.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `createPagination`

```ts
export function createPagination (props: IDataTablePaginationProps)
```

Reads the `page` / `itemsPerPage` props into the v-model refs
`providePagination` expects. Kept alongside `usePagination` /
`providePagination` in this file — all three address the same
`ORIGAM_DATA_TABLE_PAGINATION_KEY` contract. `usePaginatedItems`
(own file) is the pure item-slicing sibling and does not depend on
any of the three.

**Source** : `packages/ds/src/composables/DataTable/pagination.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `consts/DataTable/data-table.const.ts`

## `createSort`

```ts
export function createSort (props: IDataTableSortProps)
```

Reads the `sortBy` / `mustSort` / `multiSort` props into the v-model
+ refs shape `provideSort` expects. Kept alongside `useSort` /
`provideSort` in this file — all three address the same
`ORIGAM_DATA_TABLE_SORT_KEY` contract. `useSortedItems` (own file)
is the pure item-sorting sibling and does not depend on any of the
three.

**Source** : `packages/ds/src/composables/DataTable/sort.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `interfaces/DataTable/data-table.interface.ts`

## `provideExpanded`

```ts
export function provideExpanded (props: IDataTableExpandProps): IDataTableProvideExpanded
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/expand.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/expand.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `provideGroupBy`

```ts
export function provideGroupBy (options:
```

Provider-side hook: derives `sortByWithGroups` plus the
`toggleGroup` / `isGroupOpen` / `extractRows` helpers, and provides
`ORIGAM_DATA_TABLE_GROUP_KEY` for `useGroupBy` consumers down the
tree.

**Source** : `packages/ds/src/composables/DataTable/group.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `interfaces/DataTable/data-table.interface.ts`

## `providePagination`

```ts
export function providePagination (options:
```

Provider-side hook: derives `startIndex` / `stopIndex` / `pageCount`
plus the `nextPage` / `prevPage` / `setPage` / `setItemsPerPage`
mutators, and provides `ORIGAM_DATA_TABLE_PAGINATION_KEY` for
`usePagination` consumers down the tree.

**Source** : `packages/ds/src/composables/DataTable/pagination.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `consts/DataTable/data-table.const.ts`

## `provideSelection`

```ts
export function provideSelection ( props: IDataTableSelectProps,
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/select.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/select.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `consts/DataTable/data-table.const.ts`

## `provideSort`

```ts
export function provideSort (options:
```

Provider-side hook: wires `toggleSort` / `isSorted` on top of the
`sortBy` / `mustSort` / `multiSort` refs (typically built by
`createSort`) and provides `ORIGAM_DATA_TABLE_SORT_KEY` for `useSort`
consumers down the tree.

**Source** : `packages/ds/src/composables/DataTable/sort.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `interfaces/DataTable/data-table.interface.ts`

## `useCell`

```ts
export function useCell ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/cell.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/cell.composable.ts`

**Consommateurs** (3) : `components/DataTable/OrigamDataTableHeaderCell.vue`, `components/DataTable/OrigamDataTableRow.vue`, `interfaces/DataTable/data-table-header.interface.ts`

## `useDataTableItems`

```ts
export function useDataTableItems (props: IDataTableItemsProps, columns: Ref<Array<IInternalDataTableHeader>>)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/items.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/items.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `useExpanded`

```ts
export function useExpanded ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/expand.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/expand.composable.ts`

**Consommateurs** (3) : `components/DataTable/OrigamDataTableRow.vue`, `components/DataTable/OrigamDataTableRows.vue`, `interfaces/DataTable/data-table-rows.interface.ts`

## `useGroupBy`

```ts
export function useGroupBy ()
```

Reads the injected group state provided by `provideGroupBy`.
Independent from `useGroupedItems` (own file) — that hook groups a
plain items array and never touches this injection.

**Source** : `packages/ds/src/composables/DataTable/group.composable.ts`

**Consommateurs** (4) : `components/DataTable/OrigamDataTableGroupHeaderRow.vue`, `components/DataTable/OrigamDataTableRows.vue`, `interfaces/DataTable/data-table-rows.interface.ts`, `interfaces/DataTable/group.interface.ts`

## `useGroupedItems`

```ts
export function useGroupedItems<T extends IDataTableGroupableItem> ( items: ComputedRef<Array<T>>, groupBy: Ref<Array<IDataTableSortItem>>, opened: Ref<Set<string>> )
```

Pure item-grouping hook: builds the grouped tree (via `groupItems`)
and flattens it back to a display list honouring `opened` groups.
Independent from `useGroupBy` / `provideGroupBy` / `createGroupBy`
(own file) — it consumes `groupBy` / `opened` refs as plain
arguments, never the `ORIGAM_DATA_TABLE_GROUP_KEY` injection those
manage.

**Source** : `packages/ds/src/composables/DataTable/groupedItems.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `useHeaders`

```ts
export function useHeaders ()
```

Reads the injected headers state provided by `createHeaders`.
Independent from `useHeadersCell` (own file) — that hook resolves a
per-cell sort icon via `useSort` and never touches this injection.

**Source** : `packages/ds/src/composables/DataTable/headers.composable.ts`

**Consommateurs** (5) : `components/DataTable/OrigamDataTableGroupHeaderRow.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableRow.vue`, `components/DataTable/OrigamDataTableRows.vue`, `interfaces/DataTable/data-table-header.interface.ts`

## `useHeadersCell`

```ts
export function useHeadersCell (props: IHeaderCellProps)
```

Resolves which sort icon (asc/desc) a header cell should show for
the current `sortBy` state — reads `useSort`'s injection, NOT the
`ORIGAM_DATA_TABLE_HEADERS_KEY` injection `useHeaders` (own file)
manages, so the two hooks are independent despite living in the
same domain folder.

**Source** : `packages/ds/src/composables/DataTable/headersCell.composable.ts`

**Consommateurs** (3) : `components/DataTable/OrigamDataTableHeaderCell.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableHeadersCellMobile.vue`

## `useOptions`

```ts
export function useOptions (
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/options.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/options.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `usePaginatedItems`

```ts
export function usePaginatedItems<T> (options:
```

Pure item-slicing hook: slices a plain items array to the current
`[startIndex, stopIndex)` window and emits `update:currentItems`.
Independent from `usePagination` / `providePagination` /
`createPagination` (own file) — it consumes `startIndex` / `stopIndex`
/ `itemsPerPage` refs as plain arguments, never the
`ORIGAM_DATA_TABLE_PAGINATION_KEY` injection those manage.

**Source** : `packages/ds/src/composables/DataTable/paginatedItems.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `interfaces/DataTable/data-table.interface.ts`

## `usePagination`

```ts
export function usePagination ()
```

Reads the injected pagination state provided by `providePagination`.
Independent from `usePaginatedItems` (own file) — that hook slices a
plain items array and never touches this injection.

**Source** : `packages/ds/src/composables/DataTable/pagination.composable.ts`

**Consommateurs** (3) : `components/DataTable/OrigamDataTableFooter.vue`, `components/DataTable/OrigamDataTableRows.vue`, `consts/DataTable/data-table.const.ts`

## `useSelection`

```ts
export function useSelection ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/DataTable/select.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/DataTable/select.composable.ts`

**Consommateurs** (10) : `components/DataTable/OrigamDataTableGroupHeaderRow.vue`, `components/DataTable/OrigamDataTableHeaderCell.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableHeadersCellMobile.vue`, `components/DataTable/OrigamDataTableRow.vue`, `components/DataTable/OrigamDataTableRows.vue`, `interfaces/DataTable/data-table-header-cell.interface.ts`, `interfaces/DataTable/data-table-headers.interface.ts`, …

## `useSort`

```ts
export function useSort ()
```

Reads the injected sort state provided by `provideSort`.
Independent from `useSortedItems` (own file) — that hook sorts a
plain items array and never touches this injection.

**Source** : `packages/ds/src/composables/DataTable/sort.composable.ts`

**Consommateurs** (7) : `components/DataTable/OrigamDataTableHeaderCell.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableHeadersCellMobile.vue`, `components/DataTable/OrigamDataTableRow.vue`, `interfaces/DataTable/data-table-header-cell.interface.ts`, `interfaces/DataTable/data-table-header.interface.ts`, `interfaces/DataTable/data-table-headers.interface.ts`

## `useSortedItems`

```ts
export function useSortedItems<T extends IInternalItem> ( props:
```

Pure item-sorting hook: applies `sortBy` (+ optional custom compare
functions) to a plain items array. Independent from `useSort` /
`provideSort` / `createSort` (own file) — it consumes a `sortBy` ref
as a plain argument, never the `ORIGAM_DATA_TABLE_SORT_KEY`
injection those manage.

**Source** : `packages/ds/src/composables/DataTable/sortedItems.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

