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

Cree l'etat « quelles lignes sont depliees » d'un `<origam-data-table>` et
le `provide` sous `ORIGAM_DATA_TABLE_EXPAND_KEY`, pour que les lignes le
consomment sans que le tableau ait a le faire descendre par props.

L'etat est un `Set` de valeurs de ligne, expose en v-model via `useVModel`
avec conversion dans les deux sens : tableau cote consommateur, `Set` en
interne. Le consommateur n'a donc jamais a manipuler un `Set`.

Retourne `{ expand, expanded, expandOnClick, isExpanded, toggleExpand }` —
le meme objet que celui qui est fourni, pour que le composant appelant
puisse s'en servir directement sans re-injecter.

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

Cree l'etat de selection d'un `<origam-data-table>` et le `provide` sous
`ORIGAM_DATA_TABLE_SELECT_KEY`. Prend en second argument `allItems` et
`currentPage` : la selection a besoin des deux, puisque « tout selectionner »
ne veut pas dire la meme chose selon la strategie.

La strategie vient de `props.selectStrategy` : `single`, `all`, ou `page`
(le defaut). Un OBJET peut aussi etre passe a la place d'un mot-cle, auquel
cas il est utilise tel quel — c'est le point d'extension pour une regle de
selection maison.

Seuls les elements dont `selectable` est vrai entrent dans les calculs :
`allSelectable` et `currentPageSelectable` filtrent en amont, donc une ligne
non selectionnable ne fausse jamais l'etat « tout est selectionne ».

La comparaison des valeurs passe par `props.valueComparator`, avec
`deepEqual` par defaut — necessaire des que la valeur d'une ligne est un
objet plutot qu'une cle primitive.

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

Resout le `padding` d'une cellule de `<origam-data-table>` a partir de sa
colonne. Retourne `{ getPadding }`.

⛔ Les deux colonnes de chrome — `data-table-select` et `data-table-expand`
— recoivent un padding FIXE de `'0 8'` qui prime sur `column.padding`. Ce
sont des colonnes de controle, pas de donnees : leur largeur doit rester
constante quel que soit le reglage du consommateur, sinon la case a cocher
et le chevron se decalent d'une ligne a l'autre.

Pour toute autre colonne, `column.padding` est rendu tel quel, et
`undefined` quand rien n'est defini — la cellule garde alors le padding de
la feuille de style.

**Source** : `packages/ds/src/composables/DataTable/cell.composable.ts`

**Consommateurs** (3) : `components/DataTable/OrigamDataTableHeaderCell.vue`, `components/DataTable/OrigamDataTableRow.vue`, `interfaces/DataTable/data-table-header.interface.ts`

## `useDataTableItems`

```ts
export function useDataTableItems (props: IDataTableItemsProps, columns: Ref<Array<IInternalDataTableHeader>>)
```

Transforme les donnees brutes de `props.items` en lignes internes de
`<origam-data-table>`, via `transformDataTableItems`. Retourne `{ items }`.

Depend des COLONNES autant que des donnees : la transformation extrait une
valeur par colonne declaree. Les colonnes sont donc passees en `Ref` et non
en valeur, pour que le calcul se refasse quand elles changent — un tableau
dont les colonnes sont dynamiques recalculerait sinon ses lignes sur
l'ancien jeu.

**Source** : `packages/ds/src/composables/DataTable/items.composable.ts`

**Consommateurs** (1) : `components/DataTable/OrigamDataTable.vue`

## `useExpanded`

```ts
export function useExpanded ()
```

Cote consommateur de `provideExpanded` : recupere l'etat de depliage fourni
par le `<origam-data-table>` ancetre.

⛔ LEVE si aucun ancetre ne l'a fourni (`Missing expand!`), plutot que de
retourner `undefined`. Un composant de ligne utilise hors d'un tableau est
une erreur de montage, pas un cas a gerer : echouer bruyamment au montage
vaut mieux qu'un `isExpanded` qui repond toujours `false` sans rien dire.

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

Regroupe pagination, tri, groupement et recherche en un seul objet
`options`, et emet `update:options` sur `<origam-data-table>` a chaque
changement reel. C'est le point unique par lequel un consommateur en mode
serveur apprend qu'il doit recharger.

Ne retourne RIEN : ce composable est un effet de bord, pas une source de
valeur. Les refs qu'il surveille appartiennent deja a l'appelant.

⛔ Deux protections contre les emissions parasites. Un `deepEqual` avec
l'objet precedent evite d'emettre quand une ref a ete reassignee sans que
son contenu change. Et un changement de `search` REMET LA PAGE A 1 avant
d'emettre — sans quoi une recherche depuis la page 4 demanderait la page 4
d'un jeu de resultats qui n'en a peut-etre qu'une.

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

Cote consommateur de `provideSelection` : recupere l'etat de selection
fourni par le `<origam-data-table>` ancetre.

⛔ LEVE si aucun ancetre ne l'a fourni, pour la meme raison que
`useExpanded` : une ligne montee hors de son tableau est une erreur de
structure, et un echec silencieux la rendrait invisible.

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

