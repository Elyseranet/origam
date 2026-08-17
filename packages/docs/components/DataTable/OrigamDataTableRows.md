# OrigamDataTableRows

Sub-component of `OrigamDataTable`. It is the table
body's list-level renderer: it decides, for the whole row set, whether to show
the loading state, the empty state, or the rows — and then emits one
`OrigamDataTableRow` or group header per entry.

It renders `<tr>` elements directly, with no wrapper of its own, so it must sit
inside a `<tbody>`. Column definitions come from the table context through
`useHeaders()`, not from a prop — **mounted outside an `OrigamDataTable` it has
no columns and every `colspan` collapses**.

`OrigamDataTable` mounts it for you. You only reach for it when you take over
the table's body slot.

## The three states

Resolved in this order, and only one ever renders:

1. **Loading** — when the resolved loader is active. Given `{ type: 'skeleton' }`
   it renders a fixed **5** placeholder rows, one skeleton cell per column,
   marked `aria-busy="true"`. Any other kind renders a single full-width row
   carrying `loadingText`.
2. **Empty** — when `items` is empty and `hideNoData` is false: one full-width
   row carrying `noDataText`.
3. **Rows** — one `group-header` per `group` entry, one `item` per row.

The default loader kind here is `line`, not `skeleton` — pass a loader config
if you want the skeleton body.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<IDataTableItem \| IDataTableGroup>` | — | Rows to render. Entries with `type: 'group'` become group headers, the rest become data rows. |
| `loading` | `TLoadingValue` | — | `true` for an indeterminate loader, a number `0..100` for a determinate one, or `{ type: 'line' \| 'circular' \| 'skeleton', … }` to pick the kind and pass per-instance props to it. |
| `loadingText` | `string` | `'origam.data_iterator.loading_text'` | Translation **key** for the loading row, resolved through `useLocale()`. Pass a key, not a literal. |
| `noDataText` | `string` | `'origam.no_data_text'` | Translation **key** for the empty row. Same rule. |
| `hideNoData` | `boolean` | `false` | Suppresses the empty row entirely, leaving an empty `<tbody>`. |
| `rowProps` | `TDataTableRow<any>` | — | Props applied to every data row. Either a plain object, or a function receiving `{ index, item, internalItem }` and returning the props for that row. |
| `cellProps` | `TDataTableCell<any>` | — | Props applied to every cell, with the same object-or-function shape. |
| `mobileBreakpoint` | `number \| TBreakpoint` | — | Width under which rows switch to their mobile layout. |
| `color` | `TColor` | — | Inherited from `ILoaderProps`; scopes the loader's intent. |
| `tag` | `string` | — | Inherited from `ILoaderProps`. The body renders bare `<tr>`s, so this has no root to apply to. |
| `id` | `string` | — | Root `id`. |
| `class` | `string \| Array<string> \| object` | — | Merged into the root class list. |
| `style` | `string \| Array<string> \| object \| StyleValue` | — | Merged into the root style. |

## Emits

None. Row-level `expand` / `select` are emitted by `OrigamDataTableRow`, and
the table aggregates them.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `loading` | — | Replaces the loading row's content. Not used by the skeleton kind, which renders cells rather than a message. |
| `no-data` | — | Replaces the empty row's content. |
| `group-header` | `IDataTableGroupHeaderSlot` | Replaces a group header row. Falls back to `OrigamDataTableGroupHeaderRow`. |
| `item` | `IDataTableItemSlot` | Replaces a data row. Falls back to `OrigamDataTableRow`. |
| `expanded-row` | `IDataTableItemBaseSlot` | Content of an expanded row's detail area. |

`group-header`, `item` and `expanded-row` share the same base scope: `index`,
`item`, `internalItem`, `columns`, plus the expand and select actions.

## Examples

Custom empty state:

```vue
<template>
    <origam-data-table :items="items" :headers="headers">
        <template #no-data>
            <origam-empty-state
                title-key="orders_empty_title"
                icon="mdi-package-variant"
            />
        </template>
    </origam-data-table>
</template>
```

Skeleton rows while fetching:

```vue
<template>
    <origam-data-table
        :items="items"
        :headers="headers"
        :loading="{ type: 'skeleton' }"
    />
</template>
```

Per-row props driven by the row's own data:

```vue
<template>
    <origam-data-table
        :items="items"
        :headers="headers"
        :row-props="(row) => ({ class: row.item.archived ? 'is-archived' : '' })"
    />
</template>
```
