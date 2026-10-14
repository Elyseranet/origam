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
   it renders a fixed **5** placeholder rows, one cell per column, and adds
   **no node of its own**: each `<td>` is the host (`.origam--skeleton`) and
   paints its bar with its own `::after`. The table makes ONE announcement, and not from here: `<OrigamDataTable>`
   renders a single visually hidden `<span role="status">` in the `top` slot of
   its `<OrigamTable>`, i.e. NEXT TO the `<table>` (a `<span>` is not valid inside
   it, and a `<tr>` cannot hold a live region), labelled by the `label` of the
   config or `loadingText`. The table root carries `aria-busy="true"` and every
   placeholder row and cell is `aria-hidden`. The bar follows the column: a shorter bar flush
   with the end edge for an `align: 'end'` column, a small square for the
   `data-table-select` / `data-table-expand` columns, a bar from the start
   edge otherwise (its width varies from one row to the next). The
   descriptor has no column "type", so those are the only signals available.
   `animation` and `label` of the `{ type: 'skeleton', … }` config are
   honoured; the per-block props (`color`, `rounded`…) have no node to land
   on. Any other kind renders a single full-width row carrying
   `loadingText`.
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
| `color` | `TColor` | — | Intent applied to the **loading row** and the **empty row** — the only two rows this component paints itself. Data rows are rendered by `OrigamDataTableRow`; colour them through `rowProps`. |
| `id` | `string` | — | Prefix for the generated row ids (`{id}-row-{index}`, `{id}-skeleton-row-{index}`). Not applied to a wrapper — there is none. |

### Props this component deliberately does NOT accept

`OrigamDataTableRows` renders a **fragment** — up to five skeleton `<tr>`s, or
one row per item — so there is no single root for Vue to fall attributes
through to. Three props inherited from `ILoaderProps` were removed from the
surface in the same change that wired `color`:

| Prop | Why it is gone |
|---|---|
| `tag` | The content model of `<tbody>` admits only `<tr>`. There was never a tag to substitute. |
| `class` | Declaring a prop **removes it from `$attrs`**, so a consumer's `class="x"` was swallowed with no warning at all. Removed, it now either falls through (single-row branches) or triggers Vue's *"Extraneous non-props attributes"* warning (multi-row branches). Loud beats silent. |
| `style` | Same reasoning as `class`. |

For per-row classes and styles, use `rowProps` / `cellProps`, which are
applied to the elements that actually exist.

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
