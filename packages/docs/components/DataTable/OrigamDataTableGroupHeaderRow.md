# OrigamDataTableGroupHeaderRow

Renders the `<tr>` that introduces a group inside `<OrigamDataTable>` when a
`groupBy` is active: the expand/collapse toggle, the group value, its row
count, and — when `showSelect` is on — the group's "select all" checkbox.

It is mounted by `<OrigamDataTableRows>`; consumers normally reach it through
the parent's `#group-header` slot rather than instantiating it directly.

```vue
<origam-data-table
    :headers="headers"
    :items="items"
    :group-by="[{ key: 'team', order: 'asc' }]"
    show-select
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | — | Position of the group row inside the rendered row list. |
| `item` | `IDataTableGroup` | — | The group node. Its `value` is rendered as the label and its `depth` drives the indentation custom property. |
| `columns` | `IInternalDataTableHeader[]` | — | Column definitions to lay the row out against. Falls back to `useHeaders()` when the component is used inside `<OrigamDataTable>`. |
| `isSelected` | `(items) => boolean` | — | Reads whether every row of the group is selected. Falls back to `useSelection().isSelected`. |
| `toggleGroup` | `(group) => void` | — | Collapses / expands the group. Falls back to `useGroupBy().toggleGroup`. |
| `color` | `TColor` | — | Text colour of the row, inherited by its cells. Resolved through `useTextColor`. |
| `id` | `string` | — | Root element id; also seeds the ids of the generated style block. |
| `class` | `string \| string[] \| object` | — | Merged onto the root `<tr>`. |
| `style` | `StyleValue` | — | Merged onto the root `<tr>`. |

`isSelected` and `toggleGroup` follow a **props-first, context-fallback**
resolution: the prop wins when supplied, the composable is used otherwise. That
is what makes the component usable standalone, outside a `<OrigamDataTable>`
where nothing is provided to inject.

### Removed in a previous release (breaking)

Five entries were dropped from `IDataTableGroupHeaderRowProps` because the
component could not act on them:

| Removed | Why |
| --- | --- |
| `padding`, `paddingInline`, `paddingBlock`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` (`IPaddingProps`) | The root is a `<tr>`; the CSS box model ignores `padding` on `display: table-row`. Cell padding is owned by `<OrigamDataTableColumnCell>`, which consumes `usePadding`. |
| `internalItem`, `isExpanded`, `toggleExpand` | A group header row exposes no expand affordance of its own — there was no consumption site to write. |
| `toggleSelect` | Its signature `(item) => void` **toggles** one item, while the group checkbox must **set** one value across every row (`select(rows, v)`). On a partially selected group, toggling per item would invert each row instead of aligning them. |

They remain in the `#group-header` **slot scope** of `<OrigamDataTableRows>`,
which is deliberately wider than this component's prop surface.

## Emits

None. Group and selection state travel through the shared `useGroupBy()` /
`useSelection()` provide/inject state, so nothing is emitted upward.

## Slots

| Slot | Scope | Description |
| --- | --- | --- |
| `data-table-group` | `{ item, count, props: { icon, onClick } }` | Replaces the group cell. Spread `props` onto any trigger to keep the collapse/expand behaviour. |
| `data-table-select` | `{ props: { modelValue, indeterminate, 'onUpdate:modelValue' } }` | Replaces the group's select-all cell. `v-bind="props"` reproduces the default checkbox. |

To replace the **whole** row, use `#group-header` on `<OrigamDataTable>` /
`<OrigamDataTableRows>` — that slot belongs to the parent, not to this
component.

## CSS variables

| Variable | Purpose |
| --- | --- |
| `--origam-data-table-group-header-row---background-color` | Row surface. |
| `--origam-data-table-group-header-row---color` | Row text colour. |
| `--origam-data-table-group-header-row---font-weight` | Label weight (default `500`). |
| `--origam-data-table-group-header-row__column---padding-inline-start-factor` | Indentation step multiplied by the group `depth` (default `16px`). |

## Examples

Custom group label with a badge:

```vue
<origam-data-table :headers="headers" :items="items" :group-by="groupBy">
    <template #data-table-group="{ item, count, props: groupProps }">
        <origam-data-table-column-cell>
            <origam-btn v-bind="groupProps" size="small" variant="text"/>
            <strong>{{ item.value }}</strong>
            <origam-badge :content="count"/>
        </origam-data-table-column-cell>
    </template>
</origam-data-table>
```

Native checkbox instead of the DS one:

```vue
<origam-data-table :headers="headers" :items="items" :group-by="groupBy" show-select>
    <template #data-table-select="{ props: selectProps }">
        <td>
            <input type="checkbox" v-bind="selectProps"/>
        </td>
    </template>
</origam-data-table>
```
