# Composants Affichage de données & média

Ce document constitue la spécification technique ultra-détaillée des composants d'affichage de données et de média du design system **origam**. Chaque section est bâtie sur la lecture directe du code source (`packages/ds/src/`). Aucune information n'a été inventée : ce qui ne peut pas être confirmé par le code est signalé comme tel.

---

## Périmètre

Les composants couverts sont : `OrigamDataTable`, `OrigamTable`, `OrigamDataList`, `OrigamList`, `OrigamTimeline`, `OrigamTreeview`, `OrigamChart`, `OrigamAvatar`, `OrigamBadge`, `OrigamChip`, `OrigamIcon`, `OrigamImg`, `OrigamMediaController`, `OrigamVideo`, `OrigamAudio`.

Pour les familles composées (DataTable, List, Chart, Media) les sous-composants internes sont décrits dans la section du composant racine.

---

## Architecture transversale

Tous les composants de ce périmètre partagent trois invariants issus du CLAUDE.md projet :

1. **CSS-first, tokens-first.** Chaque propriété visuelle (couleur, spacing, radius, ombre) est exposée via une CSS custom-property `--origam-{component}---{property}`. Aucune valeur ne doit être codée en dur dans les SFC.
2. **Strategy A (classes + styles en parallèle).** Les composables transversaux (`useColor`, `useBorder`, `useRounded`, etc.) retournent à la fois `*Classes` (valeur tokenisée → classe utilitaire `.origam--{group}-{value}`) et `*Styles` (valeur custom → inline style). Les deux bindings sont toujours appliqués ; le côté vide est inoffensif.
3. **`filterProps` exposé.** Chaque composant expose `filterProps` via `defineExpose` afin que les composants parents puissent le restreindre aux props qu'ils connaissent, sans courir de risque de prop-fallthrough.

---

## `OrigamTable`

**Fichier :** `packages/ds/src/components/Table/OrigamTable.vue`

**Rôle / utilité.** Conteneur bas niveau d'un tableau HTML sémantique. `OrigamDataTable` en est le consommateur direct, mais n'importe quel composant nécessitant une `<table>` peut l'utiliser de manière autonome.

### Entrées (props)

`ITableProps` étend les interfaces Commons suivantes : `ITagProps`, `IDensityProps`, `IDimensionProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IPaddingProps`, `IMarginProps`, `IHoverProps`, et des propriétés propres :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine (le `<table>` est à l'intérieur du wrapper) |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Contrôle les paddings des `<th>` et `<td>` via variables CSS |
| `fixedHeader` | `boolean` | — | Applique `position: sticky; top: 0` sur les `<thead th>` |
| `fixedFooter` | `boolean` | — | Applique `position: sticky; bottom: 0` sur les `<tfoot>` |
| `caption` | `string` | — | Texte de la `<caption>` du tableau |
| `captionVisible` | `boolean` | — | Quand `false` (défaut implicite) la caption est clipée hors écran (SR uniquement) ; `true` l'affiche visuellement |
| `ariaRowcount` | `number` | — | Transmis à `aria-rowcount` sur le `<table>` |
| `height`, `width`, etc. | `IDimensionProps` | — | Transmis en inline styles via `useDimension` |
| `border`, `rounded`, `elevation` | interfaces Commons | — | Via `useStateEffect` (réactif au hover) |

### Sorties

- **Slots :**
  - `top` — zone au-dessus du wrapper scrollable (ex. : toolbar de recherche)
  - `wrapper` — remplace le `<table>` natif entier si fourni
  - `default` — contenu standard : `<thead>`, `<tbody>`, `<tfoot>`, etc.
  - `bottom` — zone sous le wrapper (typiquement la pagination)
- **Expose :** `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`

### Dépendances

- Composables : `useDensity`, `useDimension`, `useHover`, `useStateEffect`, `useStyle`, `useProps`
- Enum : `DENSITY`
- Interface : `ITableProps`

### Comportement notable

**Densité.** Trois variantes — `compact`, `default`, `comfortable` — modifient `--origam-table__header-cell---padding-block/inline` et `--origam-table__cell---padding-block/inline` via des modificateurs BEM en SCSS. La table n'interagit pas avec le contexte de densité global ; chaque instance porte sa propre valeur.

**Header/footer fixes.** Lorsque `fixedHeader` ou `fixedFooter` est vrai, `overflow-y: auto` est activé sur `.origam-table__wrapper` et les cellules cibles reçoivent `position: sticky`. Un stacking context est implicitement créé par la valeur `z-index: 1` posée sur ces cellules.

**Caption accessible.** Sans `captionVisible`, la caption est visuellement cachée avec la technique `clip: rect(0,0,0,0)` (compatible SR) plutôt qu'un `display: none` — les lecteurs d'écran l'annoncent donc systématiquement. Avec `captionVisible: true`, une règle `--visible` restaure les valeurs visibles.

**Hover de ligne.** `useHover` expose un `hoverState` réactif passé à `useStateEffect`, ce qui permet d'appliquer des classes et styles de hover non seulement sur les cellules (via le sélecteur `:deep(tr:hover td)`) mais potentiellement sur la racine selon ce que le consommateur décide de binder.

**SSR.** Pas d'effet de side-effect DOM au rendu serveur — toutes les dépendances réactives (hover) sont initialisées à `false`, les classes résultantes sont stables côté serveur.

### Exemple d'usage

```vue
<origam-table
  density="compact"
  fixed-header
  caption="Rapport annuel"
  caption-visible
  :height="400"
>
  <thead>
    <tr><th>Nom</th><th>Valeur</th></tr>
  </thead>
  <tbody>
    <tr><td>Alpha</td><td>42</td></tr>
  </tbody>
</origam-table>
```

---

## `OrigamDataTable`

**Fichiers :**
- `packages/ds/src/components/DataTable/OrigamDataTable.vue` (racine)
- `packages/ds/src/components/DataTable/OrigamDataTableHeaders.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableHeadersCell.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableHeadersCellMobile.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableHeaderCell.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableRows.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableRow.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableColumnCell.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableGroupHeaderRow.vue`
- `packages/ds/src/components/DataTable/OrigamDataTableFooter.vue`

**Rôle / utilité.** DataTable complète avec tri, filtre, pagination, sélection, expansion de lignes, groupement, chargement (progress/skeleton) et mode mobile. Orchestrateur de haut niveau : agrège environ douze composables spécialisés via un système `provide`/`inject` et délègue le rendu à `OrigamTable` (base scrollable) et à ses sous-composants.

### Entrées (props)

`IDataTableProps` étend l'union de : `ITableProps` · `IDataTableRowProps` · `IDataTableExpandProps` · `IDataTableGroupProps` · `IDataTableHeaderProps` · `IDataTableItemsProps` · `IDataTableSelectProps` · `IDataTableSortProps` · `IDataTableHeadersProps` · `IDataTablePaginationProps` · `IFiltersProps` · `IDataTableFooterProps`.

Les props propres à l'orchestrateur :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page courante (v-model) |
| `itemsPerPage` | `number` | `10` | Nombre de lignes par page |
| `tag` | `string` | `'div'` | Tag de la racine `OrigamTable` |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Densité visuelle |
| `hideDefaultBody` | `boolean` | `false` | Désactive le rendu automatique de `<tbody>` |
| `hideDefaultFooter` | `boolean` | `false` | Masque le footer pagination |
| `hideDefaultHeader` | `boolean` | `false` | Masque le header de colonnes |
| `search` | `string` | — | Texte de recherche globale (filtrage réactif) |
| `loading` | `boolean \| string` | — | Active un indicateur (progress ou skeleton) |
| `showSelect` | `boolean` | — | Affiche la colonne de checkboxes |
| `showExpand` | `boolean` | — | Affiche la colonne d'expansion |
| `sortBy` | `IDataTableSortItem[]` | — | Tri courant (v-model) |
| `multiSort` | `boolean` | — | Tri multi-colonnes |
| `mustSort` | `boolean` | — | Interdit de retirer le tri |
| `groupBy` | `IDataTableSortItem[]` | — | Clé de groupement (v-model) |
| `expanded` | `ReadonlySet` | — | Lignes développées (v-model) |
| `mobileBreakpoint` | `string \| number` | `'xs'` | Seuil de basculement mobile. **Défaut `'xs'` intentionnel** (voir commentaire code) |
| `sortAscIcon` | `string` | `MDI_ICONS.ARROW_UP` | Icône tri ascendant |
| `sortDescIcon` | `string` | `MDI_ICONS.ARROW_DOWN` | Icône tri descendant |
| `headers` | `IDataTableHeaderCellProps[]` | — | Définition des colonnes |
| `items` | `T[]` | — | Données source |
| `itemValue` | `string \| (item) => any` | — | Clé d'identifiant d'item |
| `rowProps` | `object \| (fn) => object` | — | Props statiques ou dynamiques pour chaque `<tr>` |
| `cellProps` | `object \| (fn) => object` | — | Props pour chaque `<td>` |

#### Footer (propagé automatiquement via `filterProps`)

| Prop | Type | Défaut |
|---|---|---|
| `itemsPerPageOptions` | `{value, title}[]` | `[10, 25, 50, 100, -1 (Tous)]` |
| `itemsPerPageText` | `string` | i18n `origam.dataFooter.itemsPerPageText` |
| `pageText` | `string` | i18n `origam.dataFooter.pageText` |
| `showCurrentPage` | `boolean` | `true` |

### Sorties

#### Emits

| Événement | Payload | Signification |
|---|---|---|
| `update:page` | `number` | Changement de page |
| `update:itemsPerPage` | `number` | Changement du nombre de lignes |
| `update:sortBy` | `IDataTableSortItem[]` | Changement du tri |
| `update:options` | `Record<string, unknown>` | Toute option (multi-bind v-model options) |
| `update:groupBy` | `IDataTableSortItem[]` | Changement du groupement |
| `update:expanded` | `ReadonlySet<unknown>` | Changement de l'expansion |
| `update:currentItems` | `IDataTableItem[]` | Items de la page courante |

#### Slots scoped (via `slotProps`)

Le slot `default` reçoit `IDataTableSlotProps<T>` avec : `page`, `itemsPerPage`, `sortBy`, `pageCount`, `toggleSort`, `setItemsPerPage`, `someSelected`, `allSelected`, `isSelected`, `select`, `selectAll`, `toggleSelect`, `isExpanded`, `toggleExpand`, `isGroupOpen`, `toggleGroup`, `items` (raw), `internalItems`, `groupedItems`, `columns`, `headers`.

| Slot | Scoped props | Usage |
|---|---|---|
| `top` | — | Toolbar au-dessus du tableau |
| `default` | `IDataTableSlotProps` | Remplacement complet du rendu |
| `colgroup` | `IDataTableSlotProps` | Injection d'un `<colgroup>` |
| `header` | props headers | Remplacement de la ligne de header |
| `header.mobile` | props headers | Header en mode mobile |
| `header.loader` | loader props | Remplacement du progress bar dans les headers |
| `thead` | `IDataTableSlotProps` | Ajout avant le `<tbody>` |
| `prepend` | `IDataTableSlotProps` | Avant les lignes |
| `body` | `IDataTableSlotProps` | Remplacement du `<tbody>` entier |
| `append` | `IDataTableSlotProps` | Après les lignes |
| `item` | `IDataTableItemSlot` | Template d'une ligne |
| `item.{key}` | `IDataTableItemKey` | Template d'une cellule de colonne |
| `header.{key}` | `IDataTableHeaderCellColumnSlot` | Template d'un header de colonne |
| `item.data-table-select` | slot props | Checkbox de sélection |
| `item.data-table-expand` | slot props | Bouton d'expansion |
| `expanded-row` | `IDataTableItemBaseSlot` | Contenu de la ligne expandée |
| `group-header` | `IDataTableGroupHeaderSlot` | Header d'un groupe |
| `no-data` | — | État vide |
| `loading` | — | État chargement (text) |
| `bottom` | — | Remplacement du footer complet |

### Dépendances (liens)

**Composables DataTable** (`packages/ds/src/composables/DataTable/`) :

| Composable | Rôle |
|---|---|
| `createGroupBy` / `provideGroupBy` / `useGroupBy` | Gestion du groupement via `provide/inject` sur clé `ORIGAM_DATA_TABLE_GROUP_KEY` |
| `createSort` / `provideSort` / `useSort` / `useSortedItems` | Tri : `toggleSort` cycle ASC → DESC → none (sauf `mustSort`) ; multi-colonnes si `multiSort` |
| `createPagination` / `providePagination` / `usePagination` / `usePaginatedItems` | Calcul `startIndex`, `stopIndex`, `pageCount`, `setItemsPerPage` via inject |
| `createHeaders` / `useHeaders` / `useHeadersCell` | Normalisation des colonnes en `IInternalDataTableHeader[]` ; injection des colonnes select/expand |
| `useDataTableItems` | Transformation `items[]` → `IDataTableItem[]` via `transformDataTableItems` |
| `useFilter` | Filtrage texte sur `item.columns` avec support de `customKeyFilter` par colonne |
| `useGroupedItems` | Flat items + opened groups → items/groups paginables |
| `provideSelection` / `useSelection` | Checkboxes multi-sélection via inject |
| `provideExpanded` / `useExpanded` | Expansion de lignes |
| `useOptions` | Émet `update:options` à chaque changement de page/tri/groupBy/search |
| `useDisplay` | Détection du mode mobile selon `mobileBreakpoint` |
| `useLoader` | Gestion état loading (line/skeleton/circular) |
| `useCell` | `getPadding(column)` : padding effectif d'une cellule |
| `useStyle` | Injection CSS dynamique avec id unique |

**Consts :** `ORIGAM_DATA_TABLE_SHOW_SELECT_KEY` (inject de `showSelect` vers les lignes)

**Enums :** `DENSITY`, `MDI_ICONS`, `SIZES`, `PROGRESS_TYPE`

**Utils :** `getObjectValueByPath`, `getPrefixedEventHandlers`, `getCurrentInstance`

**Interfaces clés :**
- `IDataTableProps`, `IDataTableEmits`, `IDataTableSlotProps`
- `IDataTableSortItem`, `IInternalDataTableHeader`
- `IDataTableGroup`, `IDataTableGroupableItem`, `IDataTableSelectableItem`
- `IDataTableRowProps`, `IDataTableRowEmits`
- `IDataTableHeadersProps`, `IDataTableHeadersSlotProps`
- `IDataTableFooterProps`, `IDataTableRowsProps`

**Autres composants :** `OrigamTable`, `OrigamDivider`, `OrigamPagination`, `OrigamSelect`, `OrigamSkeleton`, `OrigamProgress`, `OrigamCheckboxBtn`, `OrigamBtn`, `OrigamRow`

### Comportement notable

**Pipeline de données.** Le flux est : `items` → `useDataTableItems` → `useFilter` (search) → `useSortedItems` (sortBy) → `useGroupedItems` (groupBy) → `usePaginatedItems` (page/itemsPerPage). Ce pipeline est entièrement réactif : chaque étape est une `computed`.

**`mobileBreakpoint: 'xs'` par défaut.** Le défaut fixé à `'xs'` (= 0 px) désactive de fait le mode mobile sauf si le consommateur spécifie un breakpoint plus large. Ce choix est documenté dans le code : le fallback global `'lg'` (1280 px) forçait le rendu mobile sur tous les viewports — comportement signalé comme « buggé ». La propagation du breakpoint à chaque `OrigamDataTableRow` est également corrigée via `mobileBreakpoint: props.mobileBreakpoint` dans `itemSlotProps`, car la ligne lit ce prop via sa propre instance de `useDisplay`.

**Mode skeleton.** Quand `loading` contient `{kind: 'skeleton'}`, `OrigamDataTableRows` rend 5 lignes de `<origam-skeleton variant="text">` avec `aria-busy="true"` sur chaque `<tr>`. La constante `SKELETON_ROW_COUNT = 5` est définie en dur dans le composant.

**Mode mobile.** Chaque `OrigamDataTableRow` applique la classe `.origam-data-table-row--mobile` via `useDisplay`. En mode mobile, chaque `<td>` devient un `display: grid; grid-template-columns: repeat(2, 1fr)` qui place le libellé de colonne à gauche et la valeur à droite, sans header horizontal.

**Sélection.** `provideSelection` gère `isSelected`, `select`, `selectAll`, `toggleSelect`, `someSelected`, `allSelected`. `ORIGAM_DATA_TABLE_SHOW_SELECT_KEY` est `provide`d depuis la racine pour que les lignes sachent si elles doivent afficher `aria-selected`.

**`aria-rowindex` et `aria-rowcount`.** Chaque `<tr>` reçoit `aria-rowindex = startIndex + index + 2` (le +2 compte le header row à l'index 1). Le `<table>` porte `aria-rowcount` égal à `itemsLength` (total filtré+groupé, avant pagination).

**`rowProps` / `cellProps`.** Ces props acceptent un objet statique OU une fonction `({item, index, internalItem}) => object`. La résolution se fait dans `itemSlotProps` et `columnCellProps` dans `OrigamDataTableRow`.

### Exemple d'usage

```vue
<origam-data-table
  v-model:sort-by="sortBy"
  v-model:page="page"
  :headers="[
    { title: 'Nom', key: 'name', sortable: true },
    { title: 'Rôle', key: 'role' }
  ]"
  :items="users"
  :items-per-page="25"
  show-select
  show-expand
  search="admin"
>
  <template #item.name="{ item }">
    <strong>{{ item.name }}</strong>
  </template>
  <template #expanded-row="{ item }">
    <tr><td colspan="3">Détails de {{ item.name }}</td></tr>
  </template>
</origam-data-table>
```

---

## `OrigamDataList`

**Fichiers :**
- `packages/ds/src/components/DataList/OrigamDataList.vue`
- `packages/ds/src/components/DataList/OrigamDataTitle.vue`
- `packages/ds/src/components/DataList/OrigamDataText.vue`

**Rôle / utilité.** Liste de données sémantique (`<dl>`) avec deux modes : `avatar` (liste d'éléments avec icônes/avatars, titres, textes) et `kv` (liste de paires clé/valeur). Couvre les cas d'usage de type « fiche détail » ou « liste de propriétés ».

### Entrées (props) — `IDataListProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `mode` | `'avatar' \| 'kv'` | `'avatar'` | Détermine le template rendu |
| `items` | `IDataItem[] \| IDataListKVItem[] \| Record<string, IDataItem>` | — | Données source |
| `color`, `bgColor` | `TColor` | — | Via `useBothColor` |
| `density` | `DENSITY` | — | Via `useDensity` |
| `elevation` | — | — | Via `useElevation` |
| `rounded`, `border`, `padding`, `margin` | interfaces Commons | — | Via composables respectifs |
| `loading` | — | — | Via `useLoader` (classes CSS) |
| `appendAvatar`, `appendIcon`, `prependAvatar`, `prependIcon` | `string` | — | Propagés aux `OrigamDataTitle` enfants en mode `avatar` |

#### `IDataListKVItem`

```ts
{
  id?: string
  key: string
  value: string | number | VNode | IDataListKVItemValueComponent
}
```

`IDataListKVItemValueComponent` est `{ component: string | Component, props?: Record<string, unknown>, children?: string | number }`. La garde de type `isDataListKVItemValueComponent` vit dans `src/utils/`.

### Sorties

**Mode `kv` — slots :**
- `default` avec `{items: kvItems}` — remplacement complet
- `key` avec `{key, item, index}` — template d'un libellé `<dt>`
- `value` avec `{key, value, item, index}` — template d'une valeur `<dd>`
- `item-{index}.key` — override ciblé par index
- `item-{index}.value` — idem

**Mode `avatar` — slots :**
- `default` avec `{items: avatarItems}` — remplacement complet
- `item` avec `{item, index}` — template d'un élément
- `item-{index}` — override ciblé par index
- `item.title` (+ variante indexée) — template du `<OrigamDataTitle>`
- `item.title.prepend`, `item.title.append` — slots adjacents du titre
- `item.text` (+ variante indexée) — template du `<OrigamDataText>`
- `item.text.prepend`, `item.text.append` — slots adjacents du texte

**Classes :** racine `.origam-data-list`, `.origam-data-list--mode-{mode}`, classes couleur/border/padding/margin/density/elevation/loader/rounded.

### Dépendances

- Composables : `useBorder`, `useBothColor`, `useDensity`, `useElevation`, `useLoader`, `useMargin`, `usePadding`, `useRounded`, `useStyle`, `useProps`
- Utils : `isDataListKVItemValueComponent`, `isEmpty`, `toKebabCase`
- Interfaces : `IDataListProps`, `IDataListKVItem`, `IDataListKVItemValueComponent`, `IDataItem`
- Composants internes : `OrigamDataTitle`, `OrigamDataText`

### `OrigamDataTitle` et `OrigamDataText`

Ces deux micro-composants partagent la même architecture :
- `OrigamDataTitle` rend un `<dt>` ; `OrigamDataText` rend un `<dd>`.
- Tous deux acceptent `prependAvatar`, `prependIcon`, `appendAvatar`, `appendIcon`, `density`, `text`/slot `default`, `color`, `bgColor`, `hoverColor`, `hoverBgColor`, `padding`, `margin`.
- `useAdjacent` gère la présence et les clics sur les zones prepend/append.
- Un `shallowRef isHover = false` est utilisé pour les computed `hoverColor` / `hoverBgColor`, mais l'événement déclencheur n'est pas câblé dans ces sous-composants (ils s'appuient sur le parent pour propagation).

### Comportement notable

**Mode KV.** Les items en objet (`Record<string, IDataListKVItem>`) sont normalisés via `Object.values()` pour garantir un ordre et un accès kebab-casé `data-cy`. Chaque ligne `<div.origam-data-list__kv-row>` utilise un CSS grid à deux colonnes ; la largeur de la clé est pilotée par `--origam-data-list__kv---key-width` (défaut 160 px).

**Valeur composant.** Quand `item.value` est un `IDataListKVItemValueComponent`, le `<component :is>` permet d'injecter n'importe quel composant origam (ex. : badge, chip) directement dans une `<dd>`. La garde de type `isVNode` versus `isDataListKVItemValueComponent` distingue les deux chemins.

**SSR.** Pas de DOM-API utilisée. Rendu 100 % côté serveur.

### Exemple d'usage

```vue
<origam-data-list
  mode="kv"
  :items="[
    { key: 'Statut', value: { component: OrigamBadge, props: { content: 'Actif', color: 'success' } } },
    { key: 'Date', value: '2025-01-15' }
  ]"
/>
```

---

## `OrigamList`

**Fichiers :**
- `packages/ds/src/components/List/OrigamList.vue`
- `packages/ds/src/components/List/OrigamListItem.vue`
- `packages/ds/src/components/List/OrigamListChildren.vue`
- `packages/ds/src/components/List/OrigamListGroup.vue`
- `packages/ds/src/components/List/OrigamListGroupActivator.vue`
- `packages/ds/src/components/List/OrigamListSubheader.vue`

**Rôle / utilité.** Composant de liste polyvalent avec rôle `listbox`, navigation clavier (ArrowUp/Down/Home/End), support des groupes/sous-entêtes/dividers, sélection (single leaf ou multiple), stratégies d'ouverture configurables. Base de `Select`, `Menu`, `CommandPalette` et de nombreux autres composants du DS.

### Entrées (props) — `IListProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Racine |
| `lines` | `LINES` enum | `LINES.ONE` | Nombre de lignes de subtitle (1/2/3) |
| `selectStrategy` | `SELECT_STRATEGY` | `SINGLE_LEAF` | Stratégie de sélection |
| `openStrategy` | `OPEN_STRATEGY` | `LIST` | Stratégie d'ouverture des groupes |
| `itemType` | `string` | `'type'` | Clé discriminante de type dans un item |
| `items` | `any[]` | `[]` | Items normalisés via `useItems` |
| `itemTitle` | `string` | `'title'` | Clé du libellé |
| `itemValue` | `string` | `'value'` | Clé de la valeur |
| `itemChildren` | `string` | `'children'` | Clé des enfants |
| `itemProps` | `string` | `'props'` | Clé des props passées au `OrigamListItem` |
| `valueComparator` | `(a, b) => boolean` | `deepEqual` | Comparateur de valeurs pour la sélection |
| `nav` | `boolean` | — | Mode navigation (padding inline réduit, police plus petite) |
| `slim` | `boolean` | — | Réduit `--origam-list-group---prepend-width` |
| `disabled` | `boolean` | — | `pointer-events: none` sur la liste entière |
| `color`, `bgColor` | `TColor` | — | Propagés en default à tous les `OrigamListItem` via `provideDefaults` |
| `density`, `elevation`, `rounded`, `border`, `padding`, `margin`, `dimension` | interfaces Commons | — | Via composables respectifs |

### Sorties

**Emits :** `IListEmits` (wrapping des emits `useNested` : `update:selected`, `update:opened`, `click:select`)

**Slots :**
- `default` — contenu libre (contourne `OrigamListChildren`)
- `item` avec `{itemProps}` — template d'un item
- `group` avec `{itemProps}` — template d'un groupe
- `groupActivator` avec `{props, isOpen, events, toggleIcon}` — template de l'activateur d'un groupe
- `childrenItem` avec `{item, index}` — items enfants
- `subheader` avec `{itemProps}` — sous-entête
- `divider` avec `{itemProps}` — divider

**Expose :** `open`, `select`, `focus`, `children`, `parents`, `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`

### Dépendances

- Composables : `useBorder`, `useBothColor`, `useCreateList`, `useDensity`, `useDimension`, `useElevation`, `useItems`, `useMargin`, `useNested`, `usePadding`, `useRounded`, `useStyle`, `useProps`
- Utils : `deepEqual`, `focusChild`
- Enums : `DENSITY`, `KEYBOARD_VALUES`, `LINES`, `OPEN_STRATEGY`, `SELECT_STRATEGY`
- Types : `TFocusLocation`
- Composants : `OrigamDefaultsProvider`, `OrigamListChildren`

### `OrigamListItem` — entrées clés

`IListItemProps` étend `ITagProps`, `IDensityProps`, `IDimensionProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IPaddingProps`, `IMarginProps`, `IColorProps`, `IHoverProps`, plus :

| Prop | Type | Description |
|---|---|---|
| `title` | `string \| number` | Titre affiché dans `.origam-list-item__title` |
| `subtitle` | `string \| number` | Sous-titre (clamp selon `lines`) |
| `value` | `any` | Valeur de sélection |
| `active` | `boolean` | Force l'état actif |
| `activeClass` | `string` | Classe CSS custom pour l'état actif |
| `link` | `boolean` | Active le mode lien/navigable |
| `prependAvatar`, `appendAvatar` | `string` | Images prepend/append |
| `prependIcon`, `appendIcon` | `string` | Icônes prepend/append |
| `disabled` | `boolean` | Désactivé (opacity + pointer-events) |
| `nav` | `boolean` | Mode nav (police plus petite) |
| `slim` | `boolean` | Mode slim (prepend width réduit) |
| `ripple` | `boolean` | Active le ripple sur click |
| `lines` | `LINES` | Override local du clamping |

**`isClickable` — logique corrigée.** Le calcul est : `!props.disabled && (props.link || link.isClickable.value || (props.value != null && !!list))`. L'ancienne implémentation avait `props.link &&` au début, ce qui empêchait cursor/ripple/keyboard sur les items Select (qui ne portent pas `link`). La correction supprime la précondition redondante et laisse le OU gérer tous les cas.

**Défaults héritées.** `useDefaults(_props)` résout les props contre la déclaration `provideDefaults({'origam-list-item': {density, color, bgColor}})` du parent `OrigamList`, permettant la propagation de couleur et densité sans prop-drilling explicite.

**`useNestedItem`.** Gère la sélection/déselection dans le contexte du `useNested` parent, expose `isSelected`, `isIndeterminate`, `select`, `openOnSelect`.

**`tabindex`.** Vaut `-2` si le parent est une liste interactive (pour la navigation via `focusChild`), `0` s'il est utilisé standalone, `undefined` s'il n'est pas clickable.

### Comportement notable

**Navigation clavier.** `OrigamList` capte `ArrowUp`/`ArrowDown`/`Home`/`End` via `handleKeydown`, qui délègue à `focusChild(contentRef, location)`. Cette fonction lit les éléments `[tabindex="-2"]` dans la liste et met le focus sur le suivant/précédent/premier/dernier.

**`useCreateList` et `useList`.** `useCreateList` `provide`s un objet avec `hasPrepend`, `hasAppend` (refs), et `updateHasPrepend`/`updateHasAppend`. Chaque `OrigamListItem` appelle `list?.updateHasPrepend(hasPrepend)` au montage pour signaler au parent s'il contient des éléments prepend, permettant à la liste d'aligner automatiquement les items sans prepend (classe `.origam-list-item--prepend`).

**Rôle `listbox`.** `OrigamList` porte `role="listbox"`. `OrigamListItem` n'ajoute pas de `role="option"` automatiquement — le consommateur qui implémente un `Select` doit s'en charger ou utiliser le composant `OrigamSelect` qui le gère.

### Exemple d'usage

```vue
<origam-list
  :items="navItems"
  nav
  select-strategy="single-leaf"
  color="primary"
  density="compact"
>
  <template #item="{ itemProps }">
    <origam-list-item v-bind="itemProps" />
  </template>
</origam-list>
```

---

## `OrigamTimeline`

**Fichiers :**
- `packages/ds/src/components/Timeline/OrigamTimeline.vue`
- `packages/ds/src/components/Timeline/OrigamTimelineItem.vue`

**Rôle / utilité.** Affichage d'une chronologie verticale ou horizontale. Les items portent un point coloré, un connecteur optionnel, et une zone de contenu (titre, sous-titre, description ou slot `body`). Support `provide/inject` pour propager le contexte parent vers les items rendus manuellement dans le slot `default`.

### Entrées (props) — `ITimelineProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Racine |
| `side` | `'start' \| 'end' \| 'alternating'` | `'start'` | Côté du contenu. `'alternating'` alterne pair/impair |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Axe principal |
| `truncateLine` | `boolean` | `false` | Masque le connecteur du dernier item |
| `color` | `TColor` | — | Couleur de dot transmise aux items via context |
| `size` | `SIZES` | — | Via `useSize` ; modifie dot-size, track-width, gap, font-sizes |
| `density` | `DENSITY` | — | Via `useDensity` |
| `items` | `ITimelineEntry[]` | — | Items en mode données (champs `title`, `subtitle`, `description`, `icon`, `intent`) |
| `ariaLabel` | `string` | — | `aria-label` de la racine |

**Context provide.** `TIMELINE_CONTEXT_KEY` fournit `{ side, truncateLine, orientation, color }` à tous les `OrigamTimelineItem` enfants.

### `ITimelineItemProps` (et prop `description` inline)

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — | Titre |
| `subtitle` | `string` | — | Sous-titre (date, heure…) |
| `description` | `string` | — | Texte de la zone `body` |
| `icon` | `string` | — | Icône dans le dot |
| `intent` | `TIntent` | — | Colorisation du dot (overrides `color` du contexte) |
| `isLast` | `boolean` | `false` | Supprime le connecteur si `truncateLine` |
| `index` | `number` | `0` | Utilisé pour alternating (pair/impair) |
| `side`, `orientation`, `truncateLine` | — | — | Override local si hors contexte |

**Résolution de couleur des dots.** `intentToBgToken(intent)` et `intentToFgToken(intent)` mappent les intents vers les tokens CSS d'action (`action--{intent}---bg/fg`) pour `primary/secondary/ghost/neutral` et vers les tokens feedback (`feedback--{intent}---bg/fg`) pour `success/warning/danger/info`. Fallback : `action--primary---bg/fg`.

### Sorties

**Slots `OrigamTimeline` :**
- `default` — items libres (bénéficient du contexte)

**Slots `OrigamTimelineItem` :**
- `dot` — contenu personnalisé du point (remplace `OrigamIcon`)
- `default` — remplacement complet du contenu (header + body)
- `body` — zone corps seule

**Classes.** `.origam-timeline--orientation-{v/h}`, `.origam-timeline--side-{start/end}`, `.origam-timeline--truncate-line`, `.origam-timeline--size-{xs/sm/default/lg/xl}`, `.origam-timeline--density-{default/compact/comfortable}`.

### Comportement notable

**Mode horizontal.** Quand `orientation='horizontal'`, les items sont enveloppés dans `.origam-timeline__track-wrapper` avec `scroll-snap-type: x mandatory` et `scrollbar-width: none`. Chaque item devient une colonne avec `scroll-snap-align: start`. Le connecteur passe d'un bar vertical à un bar horizontal via les modificateurs `--orientation-horizontal`.

**Mode alternating.** `contentSide` est calculé comme `index % 2 === 0 ? 'start' : 'end'`. La classe `.origam-timeline-item--content-end` applique `flex-direction: row-reverse` et renverse l'alignement du header.

**`aria-hidden` sur `.origam-timeline-item__track`.** Le track (dot + connecteur) est `aria-hidden="true"`. Le rôle ARIA du composant racine est `role="list"`, chaque item porte `role="listitem"`.

### Exemple d'usage

```vue
<origam-timeline
  orientation="vertical"
  side="alternating"
  :truncate-line="true"
  :items="[
    { title: 'Lancement', subtitle: 'Jan 2024', intent: 'primary', icon: 'mdi-rocket' },
    { title: 'Beta', subtitle: 'Mar 2024', intent: 'success' }
  ]"
/>
```

---

## `OrigamTreeview`

**Fichiers :**
- `packages/ds/src/components/Treeview/OrigamTreeview.vue`
- `packages/ds/src/components/Treeview/OrigamTreeviewNode.vue`

**Rôle / utilité.** Arborescence navigable (file tree, organisation hiérarchique). Gère l'expansion et la sélection de nœuds via `provide/inject`. Navigation clavier ARIA complète.

### Entrées (props) — `ITreeviewProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `ITreeviewNode[]` | — | Arbre de données |
| `selectMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | Mode de sélection |
| `selectableNodes` | `'leaf' \| 'all'` | `'leaf'` | Nœuds sélectionnables |
| `showLines` | `boolean` | `true` | Affiche les guides visuels d'indentation |
| `expandOnClick` | `boolean` | `false` | Cliquer sur la ligne (pas seulement le chevron) déplie |
| `modelValue` | `string[] \| string` | — | Valeur sélectionnée (v-model) |
| `expandedValue` | `string[]` | — | Nœuds dépliés (v-model) |
| `color` | `TColor` | — | Via `useStateEffect` |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Via `useDensity` |
| `size` | `SIZES` | `SIZES.DEFAULT` | Via `useSize` |
| `ariaLabel` | `string` | — | `aria-label` de la racine |

**`ITreeviewNode`** : `{ id: string, label: string, children?: ITreeviewNode[], icon?: string, size?: string, disabled?: boolean, expandable?: boolean }`

**Context provide.** `ORIGAM_TREEVIEW_KEY` expose `{ toggleExpanded, toggleSelected, isExpanded, isSelected, selectMode, selectableNodes, showLines, expandOnClick, color }` à toutes les instances de `OrigamTreeviewNode`.

### Sorties

**Emits :**
- `update:modelValue` : `string[] | string`
- `update:expandedValue` : `string[]`
- `select` : `(id: string) => void`
- `toggle` : `(id: string, expanded: boolean) => void`

**Expose :** `filterProps`, `isExpanded`, `isSelected`, `toggleExpanded`, `toggleSelected`, `css`, `id`, `load`, `unload`, `isLoaded`

**Slot `OrigamTreeviewNode` :**
- `node` avec `{node, depth, isExpanded, isSelected}` — template personnalisé d'un nœud. La transmission récursive du slot aux enfants est gérée explicitement dans le composant.

### Dépendances

- Composables : `useDensity`, `useSize`, `useStateEffect`, `useStyle`, `useProps`
- Consts : `ORIGAM_TREEVIEW_KEY`
- Enums : `DENSITY`, `SIZES`
- Interfaces : `ITreeviewProps`, `ITreeviewNodeProps`

### Comportement notable

**Navigation clavier ARIA Pattern 1 (`role="tree"` + `role="treeitem"`).** L'implémentation est conforme au pattern W3C Tree View :
- `OrigamTreeview` capte `ArrowDown` / `ArrowUp` via `handleKeydown` sur tous les `[role="treeitem"]:not([aria-disabled])` visibles.
- `OrigamTreeviewNode` gère localement `Enter`/`Space` (toggle sélection ou expansion), `ArrowRight` (expand ou focus premier enfant), `ArrowLeft` (collapse ou focus parent).
- `aria-expanded` est posé uniquement sur les nœuds avec enfants.
- `aria-selected` est posé uniquement quand `selectMode !== 'none'`.

**Sélection `single`.** En mode `single`, le `Set` est vidé puis peuplé d'un seul id. L'emit émet une string (pas un tableau) quand exactement un item est sélectionné, sinon `''`.

**Guides visuels.** `.origam-treeview-node__guide` est un element `<span>` de 1 px de largeur par niveau de profondeur, contrôlé par `--origam-treeview---guide-thickness`. Il est `aria-hidden="true"`.

**`expandable` override.** Si un nœud porte `expandable: true` mais pas de `children`, il sera rendu comme nœud parent visuel (chevron visible) sans aucun enfant réel. Utile pour le chargement lazy.

**Rendu récursif.** `OrigamTreeviewNode` se rend récursivement en passant `depth + 1` à ses enfants. Le padding inline gauche vaut `depth * --origam-treeview---indent-size` (défaut 16 px).

### Exemple d'usage

```vue
<origam-treeview
  v-model="selectedIds"
  v-model:expanded-value="expandedIds"
  :items="fileTree"
  select-mode="multiple"
  selectable-nodes="leaf"
  show-lines
>
  <template #node="{ node, isSelected }">
    <span :class="{ 'font-bold': isSelected }">{{ node.label }}</span>
  </template>
</origam-treeview>
```

---

## `OrigamChart`

**Fichiers :**
- `packages/ds/src/components/Chart/OrigamChart.vue` — dispatcher/shell
- `packages/ds/src/components/Chart/OrigamChartCartesian.vue` — line/area/bar/column/scatter/spline/stepped-line
- `packages/ds/src/components/Chart/OrigamChartPolar.vue` — pie/donut
- `packages/ds/src/components/Chart/OrigamChartRadar.vue`
- `packages/ds/src/components/Chart/OrigamChartGauge.vue`
- `packages/ds/src/components/Chart/OrigamChartPyramid.vue`
- `packages/ds/src/components/Chart/OrigamChartHoneycomb.vue`
- `packages/ds/src/components/Chart/OrigamChartTreemap.vue`
- `packages/ds/src/components/Chart/OrigamChartSankey.vue`
- `packages/ds/src/components/Chart/OrigamChartWordCloud.vue`
- `packages/ds/src/components/Chart/OrigamChartHeatmap.vue`
- `packages/ds/src/components/Chart/OrigamChartSunburst.vue`
- `packages/ds/src/components/Chart/OrigamChartBoxPlot.vue`
- `packages/ds/src/components/Chart/OrigamChartPictorial.vue`
- `packages/ds/src/components/Chart/OrigamChartCandlestick.vue`
- `packages/ds/src/components/Chart/OrigamChartStreamgraph.vue`
- `packages/ds/src/components/Chart/OrigamChartVariwide.vue`
- `packages/ds/src/components/Chart/OrigamChartPolarBar.vue`
- `packages/ds/src/components/Chart/OrigamChartBullet.vue`
- `packages/ds/src/components/Chart/OrigamChartPareto.vue`
- `packages/ds/src/components/Chart/OrigamChartMap.vue`
- `packages/ds/src/components/Chart/OrigamChartSparkline.vue`
- `packages/ds/src/components/Chart/OrigamChartAxis.vue`
- `packages/ds/src/components/Chart/OrigamChartLegend.vue`
- `packages/ds/src/components/Chart/OrigamChartTooltip.vue`
- `packages/ds/src/components/Chart/OrigamChartRangeSelector.vue`

**Rôle / utilité.** Shell de routage vers 20 types de graphiques différents. Zéro dépendance externe (pas de Chart.js, ECharts, etc.) — toute la génération de paths SVG est faite en pur TypeScript via des utils dans `src/utils/Chart/path.util.ts`. La famille cartésienne est la plus riche : zoom/pan, drilldown, annotations, plot bands/lines, secondary Y axis, range selector.

### Entrées (props) — `IChartProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `TChartType` | `'line'` | Type de graphique |
| `series` | `IChartSeries[]` | — | Séries de données |
| `categories` | `string[]` | `[]` | Labels axe X |
| `height` | `number` | `300` | Hauteur en px |
| `title`, `subtitle` | `string` | — | Titres |
| `showLegend` | `boolean` | `true` | Légende |
| `legendPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Position légende |
| `showTooltip` | `boolean` | `true` | Tooltip hover |
| `showGrid`, `showAxis` | `boolean` | `true` | Grilles et axes |
| `animated` | `boolean` | `true` | Animations SVG |
| `animationDuration` | `number` | `600` | Durée en ms |
| `stacked` | `boolean` | `false` | Empilage |
| `stacking` | `'normal' \| 'percent'` | — | Mode d'empilage |
| `donutHoleSize` | `number` | `0.6` | Taille trou donut (0–1) |
| `colorScheme` | `string[]` | `[]` | Palette de couleurs custom |
| `xAxisFormat`, `yAxisFormat` | `(v) => string` | — | Formateurs d'axes |
| `aspectRatio` | `string` | — | CSS aspect-ratio (remplace height) |
| `smoothing` | `'none' \| 'monotone' \| ...` | `'none'` | Lissage des courbes |
| `yMin`, `yMax` | `number` | — | Borne d'axe Y |
| `gaugeMin`, `gaugeMax` | `number` | `0` / `100` | Bornes jauge |
| `gaugeUnit` | `string` | `''` | Unité jauge |
| `plotBands` | `IChartPlotBand[]` | — | Zones colorées d'arrière-plan |
| `plotLines` | `IChartPlotLine[]` | — | Lignes de référence |
| `annotations` | `IChartAnnotation[]` | — | Annotations (arrow, label, circle, bracket) |
| `secondaryYAxis` | `IChartSecondaryYAxis` | — | Axe Y secondaire |
| `drilldown` | `IChartDrilldown` | — | Configuration du drilldown |
| `zoomable` | `boolean` | `false` | Zoom/pan à la souris (Shift+scroll + drag) |
| `rangeSelector` | `IChartRangeSelector` | — | Boutons de plage temporelle |

#### `IChartSeries`

```ts
{
  name: string
  data: Array<number | IChartSeriesPoint>
  type?: TChartCartesianKind  // override de type par série
  color?: string | TIntent
  yAxis?: 0 | 1              // axe principal ou secondaire
  visible?: boolean           // contrôlé par la légende
}
```

### Sorties

**Emits** (`IChartEmits`) :
- `point-click` : `(point: IChartPoint, event: MouseEvent | KeyboardEvent) => void`
- `legend-click` : `(series: IChartSeries, index: number) => void`
- `series-toggle` : `(series: IChartSeries, visible: boolean) => void`
- `drill` / `drill-up` / `zoom` / `reset-zoom` : émis par `OrigamChartCartesian`

**Slots (propagés via `$slots` forwarding)** :
- `title` — header personnalisé
- `tooltip` avec `{point, series, category, xAxisFormat, yAxisFormat}` — tooltip custom
- `legend-item` avec `{item, onClick}` — légende custom
- `empty` — état vide

### Dépendances clés

**Composable `useChart`** (`packages/ds/src/composables/Chart/chart.composable.ts`) :

Reçoit un ensemble de thunks réactifs (`() => props.type`, `() => props.series`, etc.) et retourne :
- `viewBox` — string SVG
- `paths` — array de `IChartPath` (kind: `'path'` / `'rect'` / `'circle'`)
- `ticks` — labels des axes X et Y
- `secondaryTicks` — labels axe Y secondaire
- `legend` — `IChartLegendItem[]`
- `plot` — coordonnées de la zone de dessin `{x0, x1, y0, y1}`
- `scales` — fonctions de projection data→px
- `yRange` — `{min, max}`
- `slotCount` — nombre de catégories visibles
- `effectiveStacking` — `'normal' | 'percent'`
- `percentValues` — `Map<seriesIndex, number[]>` pour stacking percent
- `onPointHover` — méthode pour mettre à jour l'état hover

**`useChartZoom`** (`chart-zoom.composable.ts`) : gère la fenêtre de zoom `[zoomStart, zoomEnd]`, l'état `isDragging`, `dragStartPx`/`dragEndPx`, `isZoomed`, `zoomTo`, `zoomReset`, `zoomBy`, `pxToCategoryIndex`.

**Utils `src/utils/Chart/path.util.ts`** : `linePath`, `areaPath`, `monotonePath`, `smoothPath`, `steppedPath`, `arcPath`, `polygonPath`, `polarToCartesian`, `computePathLength`, `steppedPathLength`.

**Résolution des couleurs.** `resolveColor` dans le composable mappe les intent `TIntent` vers les tokens CSS via `intentBgExpr()`. Les couleurs raw (hex, rgb, var(…)) passent directement.

**Palette par défaut.** `DEFAULT_PALETTE` = les 8 intents DS (`primary`, `success`, `warning`, `danger`, `info`, `secondary`, `ghost`, `neutral`), cyclés par index de série.

### Comportement notable

**Dispatcher sans remontage.** Le shell `OrigamChart` utilise `v-if`/`v-else-if` successifs (pas de `<component :is>`) pour router vers la famille. Le changement de `type` swipe la famille sans remonter les données.

**Visibility series / légende.** Le shell maintient un `ref<Set<string>> hiddenSeries`. `seriesWithVisibility` clone chaque série en ajoutant `visible: !hiddenSeries.has(s.name)`. `onSeriesToggle` update le Set et émet. La légende garde toutes les séries (même cachées, avec opacité réduite et texte barré) pour permettre de les réafficher.

**Drilldown.** `drillStack` est un tableau de frames. Chaque clic sur un point avec `drilldown` lookup le dataset dans `props.drilldown.datasets`. Un cycle est détecté si l'id est déjà dans le stack. Le breadcrumb est rendu avec `<nav>` + `<ol>` + `<li>` sémantiques. Back va au frame précédent ; clic sur un item du breadcrumb coupe le stack à cette profondeur.

**Zoom/pan.** L'événement `wheel` avec `Shift` pressed + le drag (mousedown + mousemove + mouseup attachés sur `window`) déclenchent `zoomTo`. La conversion pixel → index se fait via le ratio `SVG_WIDTH / rect.width`. Le zoom reset émet `reset-zoom`. Un rectangle de sélection semi-transparent est dessiné pendant le drag.

**Annotations.** Quatre types : `'arrow'` (line + arrowhead polygon + text), `'label'` (leader line + callout rect + text), `'circle'` (cercle + text), `'bracket'` (path + text). Tous `aria-hidden="true"`.

**A11y SVG.** Le `<svg>` porte `role="img"`, `<title>` et `<desc>` générés automatiquement. Les `<rect>` et `<circle>` interactifs portent `tabindex="0"`, `role="button"`, `aria-label` formaté (series, catégorie, valeur, % si stacking percent). Keyboard : Enter/Space active le point.

**`prefers-reduced-motion`.** Un media query `@media (prefers-reduced-motion: reduce)` dans le SCSS désactive toutes les animations (`animation: none; stroke-dashoffset: 0`).

### Exemple d'usage

```vue
<origam-chart
  type="area"
  :series="[{ name: 'Revenus', data: [10, 40, 35, 50, 49] }]"
  :categories="['Jan', 'Fév', 'Mar', 'Avr', 'Mai']"
  :height="300"
  title="Évolution des revenus"
  stacked
  zoomable
  :drilldown="drilldownConfig"
  @point-click="onPointClick"
/>
```

---

## `OrigamAvatar`

**Fichier :** `packages/ds/src/components/Avatar/OrigamAvatar.vue`

**Rôle / utilité.** Représentation visuelle d'une entité (personne, organisation). Trois modes de contenu en priorité décroissante : image → icône → texte. Support de tous les states visuels (hover, active, elevation, rounded, border).

### Entrées (props) — `IAvatarProps`

Étend `ITagProps`, `IDensityProps`, `ISizeProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IPaddingProps`, `IMarginProps`, `IColorProps`, `IHoverProps`, `IActiveProps` + :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Racine |
| `size` | `SIZES` | `'default'` | 5 tailles de xs (24 px) à xl (56 px) |
| `image` | `string \| ISrcObject` | — | URL ou objet src pour l'image |
| `icon` | `string` | — | Icône MDI/custom |
| `text` | `string` | — | Initiales ou texte court |
| `start`, `end` | `boolean` | — | Contexte inline (modifie le display) |
| `color`, `bgColor` | `TColor` | — | Tint via `useStateEffect` |
| `hoverColor`, `hoverBgColor` | — | — | Couleurs au hover |

**Défaults héritées.** `useDefaults(_props)` permet à `OrigamAvatarGroup` d'injecter des defaults (taille, density) via `provideDefaults`.

**Mode image.** Si `image` est un objet `ISrcObject`, ses propriétés (`src`, `alt`, `srcset`, `lazySrc`, `aspectRatio`) sont extraites et passées à `OrigamImg` avec `cover eager aspectRatio=1`.

**Stacking context `__image`.** La div `.origam-avatar__image` porte `position: relative; overflow: hidden; border-radius: inherit`. Le `OrigamImg` interne utilise `--origam-img__picture---z-index: auto` pour annuler le `z-index: -1` standard de l'img, qui sinon se retrouverait derrière le fond de l'avatar.

### Sorties

- **Emits :** `IAvatarEmits` (click, mouseenter, mouseleave)
- **Slots :** `default` (override complet), `avatar` (custom image), `icon` (custom icône), `text` (custom texte)

### Dépendances

- Composables : `useActive`, `useDefaults`, `useDensity`, `useHover`, `useSize`, `useStateEffect`, `useStyle`, `useProps`
- Interfaces : `IAvatarProps`, `ISrcObject`
- Utils : `isEmpty`
- Composants : `OrigamIcon`, `OrigamImg`

### Comportement notable

**Tailles avec densité.** `height/width = calc(--origam-avatar---height - --origam-avatar---density)`. Densité `compact` ajoute 8 px de soustraction, `comfortable` enlève 8 px.

**Status colors.** Des modificateurs CSS (`--warning`, `--success`, `--info`, `--error`) remappent `background-color` et `color` vers les tokens feedback correspondants.

---

## `OrigamBadge`

**Fichier :** `packages/ds/src/components/Badge/OrigamBadge.vue`

**Rôle / utilité.** Pastille de notification positionnée relativement à son contenu par défaut. Trois modes : floating (position absolue calculée par `useLocation`), inline (flux normal), dot (point coloré sans contenu).

### Entrées (props) — `IBadgeProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Wrapper racine |
| `modelValue` | `boolean` | — | Visibilité via `v-show` (géré par `useActive`) |
| `content` | `string \| number` | — | Contenu textuel |
| `max` | `number` | — | Plafond affiché (ex. `99+`) |
| `dot` | `boolean` | — | Affiche un point sans texte |
| `floating` | `boolean` | — | Position absolue relative au wrapper |
| `inline` | `boolean` | — | Rendu dans le flux normal |
| `location` | `string` | `'top right'` | Positionnement (`useLocation`) |
| `offsetX`, `offsetY` | `number` | — | Décalage en px |
| `label` | `string` | `'origam.badge'` | Clé i18n pour `aria-label` |
| `icon`, `prependIcon`, `appendIcon` | `string` | — | Icônes (via `useStatus`) |
| `color`, `bgColor` | `TColor` | — | Couleur de la pastille |
| `transition` | `TTransitionProps` | `{component: OrigamFade}` | Transition d'entrée/sortie |
| `border`, `rounded`, `elevation` | interfaces Commons | — | Via `useStateEffect` |

**Séparation des attrs.** `badgeAttrs` extrait `aria-atomic`, `aria-label`, `aria-live`, `role`, `title` des attrs pour les poser sur le `<span>` pastille. `restAttrs` va sur la racine.

### Sorties

- **Slots :** `default` (contenu wrappé), `badge` (contenu de la pastille), `prepend`, `append`
- **Classes racine :** `.origam-badge--dot`, `.origam-badge--floating`, `.origam-badge--inline`
- **Classes pastille :** colorClasses, roundedClasses, borderClasses, elevationClasses

### Comportement notable

**`aria-live="polite"` + `role="status"`.** La pastille est une annonce live — les SR lisent le changement de contenu sans interruption.

**Contenu capé.** Si `content` est un nombre et `max` est défini, retourne `String(content)` si `≤ max`, sinon `"${max}+"`.

**Transition.** La valeur par défaut est `{component: OrigamFade}` — un objet, pas une string — pour garantir que le style de `OrigamFade` est injecté même sans autre instance de ce composant dans la page.

**Location offset.** `useLocation` reçoit une fonction de calcul d'offset : `base + offsetY/X` selon le côté. `base` vaut `dot ? 2 : 4` pour floating et `dot ? 8 : 12` sinon.

---

## `OrigamChip`

**Fichier :** `packages/ds/src/components/Chip/OrigamChip.vue`

**Rôle / utilité.** Composant de tag compact avec support de fermeture (`closable`), filtre visuel sélectionnable (`filter`), lien (`link`), groupe (`OrigamChipGroup`). Très proche d'un button interactif.

### Entrées (props) — `IChipProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'span'` | Racine |
| `size` | `SIZES` | `SIZES.DEFAULT` | Tailles xs→xl |
| `text` | `string` | — | Libellé (si pas de slot default) |
| `modelValue` | `boolean` | `true` | Visibilité (v-model) |
| `closable` | `boolean` | — | Affiche le bouton close |
| `closeIcon` | `string` | `MDI_ICONS.CLOSE_CIRCLE_OUTLINE` | Icône de fermeture |
| `closeLabel` | `string` | i18n `origam.close` | `aria-label` du bouton close |
| `filter` | `boolean` | — | Active l'icône de filtre sélectionné |
| `filterIcon` | `string` | `MDI_ICONS.CHECK` | Icône de filtre |
| `pill` | `boolean` | — | Coins encore plus arrondis |
| `label` | `boolean` | — | Coins carrés (border-radius: 4px) |
| `draggable` | `boolean` | — | Attribut HTML `draggable` |
| `link`, `ripple` | `boolean` | — | Mode lien + ripple |
| `prependAvatar`, `appendAvatar`, `prependIcon`, `appendIcon` | `string` | — | Médias adjacents |
| `color`, `bgColor` | `TColor` | — | Via `useBothColor` |
| `border`, `rounded`, `elevation`, `padding`, `margin`, `size`, `density` | interfaces Commons | — |

**`isClickable`.** `!props.disabled && props.link && (!!group || props.link || link.isClickable.value)`. Commande cursor, ripple, keyboard, tabindex.

**Groupe.** `useGroupItem(props, ORIGAM_CHIP_GROUP_KEY, false)` connecte le chip à son parent `OrigamChipGroup`. `isSelected` reflète l'état du groupe. `filter` n'a d'effet que si le chip est dans un groupe.

### Sorties

- **Emits :** `IChipEmits` : `click`, `click:close`
- **Slots :** `default` avec `contentProps`, `prepend`, `append`, `filter`, `close`

### Comportement notable

**Bouton `close` natif.** Le bouton de fermeture est un `<button type="button">` sémantique, accessible clavier nativement, avec `.stop.prevent` pour éviter la propagation.

**`OrigamExpandX` pour le filtre.** Le slot filter est enveloppé dans `<origam-expand-x>` pour une animation de dépliage horizontal à l'activation.

**Défaults via `useDefaults`.** `useDefaults(_props)` résout les props contre un éventuel `provideDefaults({'origam-chip': {...}})` du parent `OrigamChipGroup`.

---

## `OrigamIcon`

**Fichiers :**
- `packages/ds/src/components/Icon/OrigamIcon.vue` — dispatcher
- `packages/ds/src/components/Icon/OrigamClassIcon.vue` — icônes par classe CSS
- `packages/ds/src/components/Icon/OrigamSvgIcon.vue` — SVG inline
- `packages/ds/src/components/Icon/OrigamLigatureIcon.vue` — ligatures (Material Icons)
- `packages/ds/src/components/Icon/OrigamComponentIcon.vue` — composant icône

**Rôle / utilité.** Adaptateur universel pour les icônes. `useIcon` résout le type de l'icône (MDI class, SVG path, ligature, composant) et retourne `{component, icon}` permettant le rendu via `<component :is>`.

### Entrées (props) — `IIconComponentProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | `string \| object` | — | Identifiant ou objet icône |
| `tag` | `string` | `'i'` | Tag HTML du wrapper |
| `size` | `SIZES` | — | Via `useSize` |
| `color`, `bgColor` | `TColor` | — | Via `useBothColor` |
| `border`, `rounded`, `padding`, `margin`, `dimension` | interfaces Commons | — |

### Comportement notable

**`aria-hidden` automatique.** `aria-hidden = !attrs.onClick` — l'icône est cachée aux SR par défaut, sauf si elle porte un listener de clic, auquel cas elle reçoit `role="button"`.

**Slot texte.** Si le slot `default` est fourni avec un nœud texte, son contenu est extrait via `flattenFragments` et utilisé comme icône (pattern ligature).

**`--origam-icon---font-size`.** Cinq tailles via `useSize`, de `1em` (xs) à `2em` (xl), relatives au contexte typographique parent.

---

## `OrigamImg`

**Fichier :** `packages/ds/src/components/Img/OrigamImg.vue`

**Rôle / utilité.** Composant image avec chargement progressif (lazy + intersect), placeholder, état d'erreur, cover/contain, gradient overlay, gestion de srcset/lazySrc, aspect-ratio automatique via les dimensions naturelles.

### Entrées (props) — `IImgProps`

| Prop | Type | Description |
|---|---|---|
| `src` | `string \| ISrcObject` | Source principale |
| `lazySrc` | `string` | LQIP (Low Quality Image Placeholder) |
| `srcset` | `string` | HTML srcset |
| `sizes` | `string` | HTML sizes |
| `alt` | `string` | Attribut alt |
| `cover` | `boolean` | `object-fit: cover` |
| `aspectRatio` | `number \| string` | Ratio cible |
| `eager` | `boolean` | Charge sans attendre l'intersection |
| `gradient` | `string` | Expression CSS `linear-gradient(…)` |
| `position` | `string` | `object-position` |
| `crossorigin` | `string` | Attribut HTML `crossorigin` |
| `referrerpolicy` | `string` | Attribut HTML `referrerpolicy` |
| `draggable` | `boolean` | Attribut HTML `draggable` |
| `options` | `IntersectionObserverInit` | Options du `vIntersect` |
| `color`, `bgColor`, `border`, `rounded`, `padding`, `margin`, `inline`, `height/width/…` | interfaces Commons | — |

### État de chargement (machine à états)

`TImgState` = `'idle' | 'loading' | 'loaded' | 'error'` (enum `IMG_STATE`).

**`isBooted`.** Démarre à `false`. Passe à `true` après deux `requestAnimationFrame` une fois qu'un aspect-ratio valide est connu (via `watch(aspectRatio, markBooted)` + appel immédiat si la valeur est déjà truthy au montage). Sans `isBooted`, la classe `.origam-img--booting` désactive la transition du sizer pour éviter un flash au premier rendu.

**`pollForSize`.** Si le ratio naturel n'est pas connu immédiatement, un polling toutes les 100 ms sur `img.naturalWidth`/`img.naturalHeight` est lancé jusqu'à obtenir des valeurs.

### Sorties

- **Emits :** `IImgEmits` : `loadstart`, `load`, `error`
- **Slots :** `default` (overlay sur l'image), `placeholder`, `error`
- **Expose :** `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`, `styleIsLoaded`

### Comportement notable

**Directive `vIntersect`.** L'initialisation de la charge est déclenchée par l'intersection observer sauf si `eager` est `true` ou `SUPPORTS_INTERSECTION` est `false`.

**SSR.** `onBeforeMount(() => init())` — l'init ne se déclenche qu'en client. L'img est donc toujours `isBooted: false` côté serveur, ce qui évite un mismatch hydration sur le `<picture>`.

**`lazySrc` blur.** La classe `.origam-img__picture--preload` applique `filter: blur(4px)` sur l'image LQ pendant le chargement de l'image HD.

---

## `OrigamMediaController` (et `OrigamMediaScrubber`, `OrigamMediaVolumeControl`)

**Fichiers :**
- `packages/ds/src/components/Media/OrigamMediaController.vue`
- `packages/ds/src/components/Media/OrigamMediaScrubber.vue`
- `packages/ds/src/components/Media/OrigamMediaVolumeControl.vue`

**Rôle / utilité.** Barre de contrôles média universelle, partagée par `OrigamVideo` et `OrigamAudio`. Reçoit l'état réactif (`IMediaPlayerState`) et les méthodes (`IMediaPlayerMethods`) du composable du parent — elle n'a aucune référence directe à l'élément HTML média.

### Entrées (props) — `IMediaControllerProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `IMediaPlayerState` | — | Objet d'état réactif du lecteur |
| `methods` | `IMediaPlayerMethods` | — | Méthodes du lecteur |
| `inset` | `boolean` | `false` | Overlay sur le bas du lecteur (auto-hide) |
| `visible` | `boolean` | `true` | Visibilité de la barre |
| `playbackRates` | `number[]` | `[0.5, 0.75, 1, 1.25, 1.5, 2]` | Vitesses disponibles |
| `allowRemotePlayback` | `boolean` | `false` | Bouton Cast |
| `downloadable` | `boolean` | `false` | Bouton télécharger |
| `downloadUrl`, `downloadFilename` | `string` | — | URL et nom de fichier |
| `qualityOptions` | `{quality, label}[]` | `[]` | Options de qualité |
| `currentQuality` | `string` | — | Qualité active |
| `showPrevious`, `showNext` | `boolean` | `false` | Boutons piste précédente/suivante |
| `showLoop`, `showShuffle` | `boolean` | `false` | Boutons loop/shuffle |
| `loopMode` | `TAudioLoopMode` | `'none'` | Mode de boucle (v-model) |
| `shuffle` | `boolean` | `false` | Shuffle (v-model) |

**`IMediaPlayerState`.** Refs réactifs : `playing`, `paused`, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `playbackRate`, `ready`, `loading`, `error`, `remoteAvailable`, `remoteState`, `fullscreen`, `pip`.

**`IMediaPlayerMethods`.** `play`, `pause`, `seek`, `setVolume`, `toggleMute`, `skipForward`, `skipBackward`, `setPlaybackRate`, `toggleFullscreen`, `togglePip`, `requestRemotePlayback`.

### Sorties

**Emits :** `IMediaControllerEmits` : `previous`, `next`, `quality-change`, `download`, `update:loopMode`, `update:shuffle`

**Slots :** `header`, `waveform` avec `{state, methods}`, `extraControlsLeft`, `extraControlsRight`, `footer`, `prepend-transport`, `append-transport`

**Expose :** `configMenuOpen`, `resolvedLoopMode`, `internalShuffle`

### Comportement notable

**Menu config (cog).** Construit un arbre d'items `IConfigMenuItem[]` pour `<origam-menu>`. Chaque feuille porte son propre `onClick`. L'arborescence couvre vitesse, qualité, téléchargement. Le menu est affiché uniquement si `hasConfigContent` (vitesses > 1 ou qualités ≥ 2 ou téléchargeable ou slot `configExtra`).

**Téléchargement cross-origin.** La stratégie de download est :
1. Même origine / `data:` / `blob:` → `<a download>` natif, aucune intervention JS.
2. Cross-origin → `event.preventDefault()`, `fetch(url, {mode: 'cors'})` → blob → `URL.createObjectURL` → click programmatique. `URL.revokeObjectURL` après 30 secondes.
3. CORS refusé → `window.open(url, '_blank', 'noopener,noreferrer')`.

**Loop tri-état.** Cycle `none → all → one → none` géré par `cycleLoopMode`. Icône différente pour `one` (`MDI_ICONS.REPEAT_ONCE`). `isLoopActive` est vrai pour `all` et `one`.

**`aria-label` traduits.** Tous les labels ARIA sont calculés comme `computed<string>` via `t()` dans le `<script>` (pas dans le template), conformément à la règle CLAUDE.md « no logic in templates ».

---

## `OrigamVideo`

**Fichier :** `packages/ds/src/components/Video/OrigamVideo.vue`

**Rôle / utilité.** Lecteur vidéo HTML5 avec trois modes de contrôles (`'custom'` / `'native'` / `'none'`), aspect-ratio automatique depuis les métadonnées, overlay poster, gestion des pistes texte, PIP, plein écran, qualité multiple, téléchargement, double-tap skip, pulse play/pause.

### Entrées (props) — `IVideoProps` (+ props inline)

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `src` | `string \| IVideoSource[]` | — | Source(s) vidéo |
| `poster` | `string` | — | Image d'affiche |
| `tracks` | `IVideoTrack[]` | `[]` | Pistes de sous-titres/captions |
| `autoplay` | `boolean` | `false` | Lecture automatique |
| `muted` | `boolean` | `false` | Muet initial |
| `loop` | `boolean` | `false` | Boucle |
| `controls` | `'custom' \| 'native' \| 'none'` | `'custom'` | Mode contrôles |
| `playsInline` | `boolean` | `true` | Inline sur mobile |
| `preload` | `string` | `'metadata'` | Attribut HTML `preload` |
| `aspectRatio` | `string \| number` | `'16/9'` | Ratio initial |
| `skipSeconds` | `number` | `30` | Secondes sautées par double-tap |
| `showCenterControls` | `boolean` | `true` | Overlay central |
| `inset` | `boolean` | `true` | Barre en overlay auto-masquée |
| `doubleTapToSkip` | `boolean` | `true` | Double-tap skip |
| `playbackRates` | `number[]` | `[0.25, 0.5, …, 2]` | Vitesses |
| `playbackRate` | `number` | `1` | Vitesse initiale (v-model) |
| `allowRemotePlayback` | `boolean` | `true` | Cast |
| `downloadable`, `downloadUrl`, `downloadFilename` | — | — | Téléchargement |
| `qualityOptions`, `currentQuality` | — | — | Qualité multiple |
| `crossorigin` | `string` | — | Attribut CORS |
| `disablePictureInPicture` | `boolean` | `false` | PIP désactivé |
| `color`, `bgColor`, `border`, `rounded`, `elevation`, `margin`, `padding`, `dimension` | interfaces Commons | — | Via composables |

**`IVideoSource`.** `{ src: string, type?: string, quality?: string, label?: string }`

**`IVideoTrack`.** `{ kind: string, src: string, srclang: string, label?: string, default?: boolean }`

### Sorties

**Emits :** `IVideoEmits` : `play`, `pause`, `ended`, `timeupdate`, `volumechange`, `loadedmetadata`, `error`, `enterpip`, `exitpip`, `enterfullscreen`, `exitfullscreen`, `skip`, `quality-change`, `download`, `update:playbackRate`

**Slots :** `poster`, `loading`, `error` avec `{error}`, `controls` avec `slotBindings`

**Expose :** `videoRef`, `state`, `methods`

### Composable `useVideoPlayer`

Construit dans `packages/ds/src/composables/Video/video-player.composable.ts`. Étend `useMediaPlayer` en ajoutant `toggleFullscreen`, `togglePip`, `skipForward`, `skipBackward`. Retourne `{ videoRef, state, methods }`.

### Comportement notable

**Autoplay + `prefers-reduced-motion`.** `shouldSuppressAutoplay()` retourne `true` si le media query `prefers-reduced-motion: reduce` est actif. `resolvedMuted` force `muted=true` si `autoplay=true` (navigateurs exigent `muted` pour l'autoplay non-interactif).

**Double-tap YouTube-style.** `onVideoTap` enregistre `{time, side}`. Si un second tap arrive dans 300 ms sur le même côté, le toggle play en attente est annulé et `skipBy` est appelé à la place. Sinon, `schedulePendingTogglePlay` démarre un timeout de 280 ms avant le toggle. Compatible `pointer-events: touch`, `mouse`, `pen`.

**Qualité.** `qualityOptions` est déduit de `props.src` (array avec `quality` field dédupliqué). `onQualityClick` sauvegarde `currentTime`, swap `video.src`, écoute `loadedmetadata` pour restaurer la position et reprendre si nécessaire.

**Captions.** `toggleCaptions` bascule le `mode` des `TextTrack` entre `'showing'` et `'disabled'`. L'état initial est détecté via `Array.from(el.textTracks).some(t => t.mode === 'showing')` au moment où `state.ready` devient `true`.

**Pulse + skip feedback.** Overlay d'icône play/pause centré (`statePulse`) affiché 600 ms via CSS transition. Overlay skip latéral (disque YouTube-style avec 3 chevrons animés en vague) affiché 700 ms.

**`OrigamResponsive`.** La racine est `<origam-responsive :aspect-ratio>` — gère l'espace réservé (sizer) pour éviter un CLS, et expose le slot `#additional` pour injecter la `<video>` et les overlays.

**Scrubber couleur.** `scrubberColorStyle` : blanc par défaut (fond noir de la vidéo) → `currentColor` si `color`/`bgColor` est passé (pour que le thème de couleur de l'intent soit respecté).

---

## `OrigamAudio`

**Fichier :** `packages/ds/src/components/Audio/OrigamAudio.vue`

**Rôle / utilité.** Lecteur audio avec interface inspirée du studio-strip (cover vinyl, métadonnées, waveform, transport). Deux variantes : `'expanded'` (plein strip) et `'compact'` (dock minimal). Support playlist complète avec shuffle, loop tri-état, navigation piste précédente/suivante.

### Entrées (props) — `IAudioProps`

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `src` | `string \| IAudioSource \| IAudioSource[]` | — | Source audio |
| `variant` | `'expanded' \| 'compact'` | `'expanded'` | Variante visuelle |
| `coverPosition` | `'left' \| 'right'` | `'left'` | Position de la pochette |
| `title`, `artist`, `album` | `string` | — | Métadonnées track standalone |
| `cover` | `string \| ISrcObject` | — | Pochette d'album |
| `playlist` | `IAudioTrack[]` | — | Playlist (surpasse `src` si présente) |
| `currentTrackIndex` | `number` | `0` | Index actif (v-model) |
| `loop` | `boolean` | `false` | Boucle simple (legacy) |
| `loopMode` | `TAudioLoopMode` | `'none'` | Boucle tri-état (v-model) |
| `shuffle` | `boolean` | `false` | Shuffle (v-model) |
| `waveform` | `boolean \| 'auto'` | `false` | Waveform SVG via `useWaveform` |
| `waveformColor` | `string` | `'currentColor'` | Couleur de la waveform |
| `controls` | `'custom' \| 'native'` | `'custom'` | Mode contrôles |
| `autoplay`, `muted`, `preload`, `playbackRate`, `playbackRates`, `crossorigin`, `allowRemotePlayback`, `downloadable`, `downloadUrl`, `downloadFilename` | — | — | Voir OrigamVideo |
| `position`, `top`, `bottom`, `left`, `right` | `IPositionProps` | — | Via `usePosition` |
| `color`, `bgColor`, `border`, `rounded`, `elevation`, `padding`, `margin` | interfaces Commons | — | Via composables |

**`IAudioTrack`.** `{ id?: string, src: string | IAudioSource | IAudioSource[], title?: string, artist?: string, album?: string, cover?: string, duration?: number }`

**`TAudioLoopMode`.** `'none' | 'all' | 'one'`

### Composables audio

**`useAudioPlayer`** (`use-audio-player.composable.ts`) : étend `useMediaPlayer` avec `audioRef: Ref<HTMLAudioElement | null>`.

**`useWaveform`** (`use-waveform.composable.ts`) : décode l'audio via `OfflineAudioContext.decodeAudioData()` et normalise en `N` bins (défaut 200). Retourne `peaks: Ref<ReadonlyArray<number>>`. Si le contexte audio n'est pas disponible (pas de `window.OfflineAudioContext`, CORS bloqué, HLS source) les pics restent vides — le composant injecte alors un waveform synthétique déterministe (somme de 3 sinus, 120 bins, amplitude 0.12–1.0) pour garantir un rendu audio-like à tout moment.

### Sorties

**Emits :** `IAudioEmits` : `play`, `pause`, `ended`, `timeupdate`, `volumechange`, `loadedmetadata`, `error`, `previous`, `next`, `track-change`, `waveform`, `update:currentTrackIndex`, `update:loopMode`, `update:shuffle`, `update:playbackRate`, `download`

**Slots :** `header`, `cover`, `metadata` (+ `title`), `waveform` avec `{peaks, currentTime, duration}`, `playlist` avec `{tracks, currentIndex, select}`, `loading`, `error` avec `{error}`

**Expose :** `audioRef`, `state`, `methods`

### Comportement notable

**Playlist state machine.** `internalTrackIndex` est la source de vérité. `setActiveTrack(nextIndex)` : snapshoote `state.playing.value` avant de muter l'index (la réactivité Vue pauserait la lecture avant qu'on puisse lire l'état), set `pendingResumeOnLoad = true` si on était en lecture, puis émet `update:currentTrackIndex` et `track-change`. Un watcher sur `audioRef` écoute `loadeddata` : quand il tire, si `pendingResumeOnLoad` est vrai, il appelle `methods.play()`.

**Shuffle sans répétition.** `pickRandomIndex()` : `(current + 1 + floor(random * (total - 1))) % total` — garantit que l'index suivant est toujours différent du courant.

**Legacy `loop: boolean` → `loopMode`.** Un watcher sur `props.loop` mappe `true → 'one'` et `false → 'none'` dans `internalLoopMode`, sauf si `loopMode` est explicitement fourni.

**`audioLoopAttr`.** Vaut `true` uniquement pour `loopMode === 'one'` — l'attribut HTML `loop` gère le cas single-track loop nativement. Pour `'all'`, `onNativeEnded` avance programmatiquement.

**Compact mode.** Variante `compact` (ou alias `minimal`) transforme le layout via des règles SCSS scoped avec `:deep()` : `origam-media-controller` devient un `display: grid` deux colonnes (header | transport), le progress bar est `position: absolute; bottom: 0` sur toute la largeur.

**Vinyle CSS.** La pochette `.origam-audio__cover` porte des pseudo-éléments `::before` (sillons concentriques via `repeating-radial-gradient`) et `::after` (disque central label). Un `mask` perce un trou de broche (spindle hole) au centre. En lecture, l'animation `vinyl-spin` tourne à 3.5 s/tour. `prefers-reduced-motion: reduce` supprime cette animation.

**Playlist vinyle.** Les avatars de la playlist (`OrigamListItem :prepend-avatar`) bénéficient du même traitement vinyle via `:deep(.origam-avatar)` avec `mask` + `::before`/`::after` en SCSS scoped.

---

## Tableau récapitulatif

| Composant | Sémantique HTML | Rôle ARIA | Navigation clavier | States gérés | SSR safe |
|---|---|---|---|---|---|
| `OrigamTable` | `<table>` + `<caption>` | table native | — | hover | Oui |
| `OrigamDataTable` | `<table><thead><tbody>` | `aria-rowcount`, `aria-rowindex`, `aria-selected`, `aria-busy` | — | loading/skeleton, empty, no-data, hover | Oui |
| `OrigamDataList` | `<dl><dt><dd>` | — | — | loading | Oui |
| `OrigamList` | `<div role="listbox">` | `listbox` + items focusables | ArrowUp/Down/Home/End | disabled, selected, active | Oui |
| `OrigamListItem` | `<div>` ou `<a>` | — | Enter/Space (clickable) | active, disabled, hover, link | Oui |
| `OrigamTimeline` | `<div role="list">` | `list` / `listitem` | — | — | Oui |
| `OrigamTreeview` | `<div role="tree">` | `tree` / `treeitem` / `group` | ArrowUp/Down/Left/Right/Enter/Space | expanded, selected, disabled | Oui |
| `OrigamChart` | `<div role="figure">` + `<svg role="img">` | `figure`, `img`, `button` (points/bars) | Enter/Space sur les datapoints | empty, loading (via parent), animated | Partiel (SVG statique) |
| `OrigamAvatar` | `<div>` | — | — | hover, active, disabled | Oui |
| `OrigamBadge` | `<div>` + `<span role="status">` | `status` | — | modelValue (show/hide) | Oui |
| `OrigamChip` | `<span>` ou `<a>` | — | Enter/Space (clickable) | active, disabled, filter, selected | Oui |
| `OrigamIcon` | `<i>` (ou custom) | `aria-hidden` par défaut / `button` si onClick | — | — | Oui |
| `OrigamImg` | `<img>` | `img` (si alt) | — | idle, loading, loaded, error | Oui (init client) |
| `OrigamMediaController` | `<div>` + `<nav aria-label>` | `nav` | Natif (buttons) | playing, paused, muted, casting | Non (DOM API) |
| `OrigamVideo` | `<video>` dans `OrigamResponsive` | `role="img"` (poster) | Natif HTML5 | playing, paused, loading, error, fullscreen, pip | Non (DOM API) |
| `OrigamAudio` | `<article>` + `<audio>` | — | Natif HTML5 | playing, paused, loading, error, loop, shuffle | Non (DOM API) |

---

*Spec rédigée à partir de la lecture directe du code source commit `feature/marketing-v5-phase1` — juin 2026.*
