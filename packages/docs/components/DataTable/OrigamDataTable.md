# OrigamDataTable

`<OrigamDataTable>` is a full-featured data grid built on `<OrigamTable>`. It handles column headers, sortable columns, pagination, row selection, row expansion, grouping, and server-side data patterns.

## Basic usage

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" />
</template>

<script setup>
const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Age',  key: 'age',  sortable: true }
]
const items = [
    { name: 'Alice', age: 30 },
    { name: 'Bob',   age: 25 }
]
</script>
```

## Headers and items

| Prop | Type | Description |
|---|---|---|
| `headers` | `IDataTableHeaderProps[]` | Column definitions |
| `items` | `unknown[]` | Row data |
| `itemValue` | `string` | Key used to uniquely identify each row |
| `itemTitle` | `string` | Key used as the row display label |

## Sorting

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" :sort-by="[{ key: 'name', order: 'asc' }]" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `sortBy` | `IDataTableSortItem[]` | Active sort state |
| `multiSort` | `boolean` | Allow sorting by multiple columns |
| `mustSort` | `boolean` | Always maintain a sort (can't unsort) |

## Pagination

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" :items-per-page="10" v-model:page="page" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `itemsPerPage` | `number \| string` | `10` | Rows per page |
| `page` | `number` | `1` | Active page |
| `itemsPerPageOptions` | `array` | predefined | Items-per-page selector options |
| `hideDefaultFooter` | `boolean` | `false` | Hide the footer pagination bar |

## Selection

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" v-model="selected" show-select />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `showSelect` | `boolean` | Add a checkbox column |
| `modelValue` | `unknown[]` | Currently selected rows (v-model) |
| `selectStrategy` | `TSelectStrategy` | `'page'`, `'single'`, or `'all'` |

## Search

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" :search="query" />
</template>
```

## Display toggles

| Prop | Type | Description |
|---|---|---|
| `hideDefaultHeader` | `boolean` | Hide the `<thead>` |
| `hideDefaultBody` | `boolean` | Hide the `<tbody>` |
| `hideDefaultFooter` | `boolean` | Hide the footer |
| `loading` | `boolean \| string` | Show a loading state |

## Composition

`OrigamDataTable` is composed from these internal sub-components (not re-exported for public API, documented here for reference):

- `OrigamDataTableHeaders` — header row rendering
- `OrigamDataTableHeadersCell` / `OrigamDataTableHeaderCell` — individual header cells
- `OrigamDataTableRows` — body rows
- `OrigamDataTableRow` — individual row
- `OrigamDataTableColumnCell` — body cell
- `OrigamDataTableGroupHeaderRow` — grouping header
- `OrigamDataTableFooter` — pagination footer

## Slots

| Slot | Description |
|---|---|
| `top` | Content above the table |
| `bottom` | Replaces the footer entirely |
| `default` | Replaces `<colgroup>`, `<thead>`, and `<tbody>` |
| `colgroup` | `<colgroup>` override |
| `body` | Body rows override |
| `thead` | Additional `<thead>` content |
| `prepend` | Content before body rows |
| `append` | Content after body rows |
| `header` | Custom header row |
| `header.mobile` | Mobile-specific header |
| `header.loader` | Loader inside the header |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `unknown[]` | Selection changed |
| `update:page` | `number` | Active page changed |
| `update:itemsPerPage` | `number` | Items-per-page changed |
| `update:sortBy` | `IDataTableSortItem[]` | Sort state changed |
| `update:groupBy` | `IDataTableGroupByItem[]` | Group-by state changed |
| `update:expanded` | `string[]` | Expanded rows changed |

## Design tokens

Inherits all tokens from `OrigamTable` (`--origam-table---*`).
