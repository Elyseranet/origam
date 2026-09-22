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

## Sticky header

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" sticky height="320" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `sticky` | `boolean` | Keep the header row(s) pinned to the top of the table's own scroll wrapper while the body scrolls |

⛔ `sticky` needs a bounded `height` (or `maxHeight`) **on `OrigamDataTable`
itself** — it does not work through an outer scrolling `<div>` wrapped
around the table. `OrigamTable`'s own wrapper (`.origam-table__wrapper`)
always computes a non-`visible` overflow (its `overflow-x: auto` forces
`overflow-y` to compute to `auto` too, per the CSS spec rule for mismatched
overflow axes), so it is always the nearest scrolling ancestor for a sticky
header cell — an outer wrapper's scroll never reaches past it. Measured in
Chromium: wrapping the table in an external `overflow-y: auto` div left the
header moving pixel-for-pixel with the scroll (not stuck); giving
`OrigamDataTable` its own `height` made `.origam-table__wrapper` the real
scrollport and the header stuck correctly. See the
`Prop — sticky (scroll-then-stick)` story variant.

This is a sibling mechanism to `fixedHeader` (inherited from `OrigamTable`),
not a replacement for it: both rely on the SAME internal scroll wrapper.
`fixedHeader` pins the header to a flat `top: 0` (single header row).
`sticky` computes each header row's offset as
`--origam-table__header-cell---height × row index`, so it is meant to also
support stacking more than one header row — but only when every row
genuinely shares that height. That part is **not verified**: an attempt to
build a grouped/`children` header fixture for this fix did not render as
multiple `<tr>` rows at all (see the `#840` fix notes), so the row-index
multiplier could not be exercised end-to-end.

## Responsive

```vue
<template>
    <OrigamDataTable :headers="headers" :items="items" mobile-breakpoint="sm" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `mobileBreakpoint` | `number \| TBreakpoint` | `'xs'` | Viewport width (or named breakpoint) below which each row switches from the tabular layout to a stacked `[label, value]` layout |

Compared against the real window width (`useDisplay` listens for `resize`),
not a container's width. Defaults to `'xs'` (0px) — the table only switches
to the mobile layout when the consumer explicitly opts in with a higher
breakpoint. An earlier default of the global `'lg'` (1280px) forced the
mobile layout on every viewport under 1280px regardless of what the
consumer set — see the `Prop — mobileBreakpoint` story variant to resize a
live example.

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
| `update:expanded` | `string[]` | Expanded rows changed |

`groupBy` has no matching `update:groupBy` emit: the component never mutates
it internally (`toggleGroup()` only opens/closes an already-grouped section),
so it is a one-way, consumer-controlled prop — pass a new array to change
grouping, there is nothing to listen for in return.

## Design tokens

Inherits all tokens from `OrigamTable` (`--origam-table---*`), including
`--origam-table__header-cell---height` — the stacking unit `sticky` uses for
`top: height × row-index`. It is derived from the already density-aware
`--origam-table__header-cell---padding-block` token via `calc()`, so
overriding density (or the padding token directly) keeps the sticky offset
correct without a separate override.
