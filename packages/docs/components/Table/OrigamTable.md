# OrigamTable

`<OrigamTable>` is the chrome wrapper around a native `<table>`. It
renders a polymorphic outer container, an inner scroll wrapper, and the
`<table>` itself — leaving header / body / footer authoring to the
consumer. Hover, header chrome, and row separators come from
`tokens/component/table.json` so the table stays theme-aware out of the
box.

It is intentionally **structural**: no intent / color prop. Use the
`--origam-table---*` CSS variables (or wrap in a `<OrigamSheet>`) when
you need to re-skin it.

## Basic usage

```vue
<template>
    <OrigamTable>
        <thead>
            <tr><th>Name</th><th>Email</th></tr>
        </thead>
        <tbody>
            <tr><td>Ada</td><td>ada@example.com</td></tr>
            <tr><td>Linus</td><td>linus@example.com</td></tr>
        </tbody>
    </OrigamTable>
</template>
```

## Density

Density tightens or loosens cell padding via the standard origam density
classes. Padding values come from
`--origam-table__cell---padding-block` and
`--origam-table__header-cell---padding-block`.

```vue
<template>
    <OrigamTable density="compact">…</OrigamTable>
    <OrigamTable density="default">…</OrigamTable>
    <OrigamTable density="comfortable">…</OrigamTable>
</template>
```

## Rounded

```vue
<template>
    <OrigamTable rounded="default">…</OrigamTable>
    <OrigamTable rounded="x-large">…</OrigamTable>
</template>
```

## Elevation

```vue
<template>
    <OrigamTable :elevation="0">…</OrigamTable>
    <OrigamTable :elevation="3">…</OrigamTable>
    <OrigamTable :elevation="8">…</OrigamTable>
</template>
```

## Border

```vue
<template>
    <OrigamTable border>…</OrigamTable>
</template>
```

## Dimension

`width` / `height` / `minWidth` / `maxWidth` / `minHeight` / `maxHeight`
flow into the **inner scroll wrapper** so a fixed `height` produces a
scrollable body without breaking the outer chrome.

```vue
<template>
    <OrigamTable height="240" width="100%">…</OrigamTable>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamTable tag="section">…</OrigamTable>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `top` | — | Optional toolbar row above the table (filters, search, …). When present the table is flagged `origam-table--has-top`. |
| `default` | — | Inner content of the `<table>` element. Author your own `<thead>` / `<tbody>` / `<tfoot>`. |
| `wrapper` | — | Replace the entire `<table>` block — advanced. |
| `bottom` | — | Optional toolbar row below the table (pagination, summary). When present the table is flagged `origam-table--has-bottom`. |

```vue
<template>
    <OrigamTable>
        <template #top>
            <OrigamToolbar>…</OrigamToolbar>
        </template>

        <thead>…</thead>
        <tbody>…</tbody>

        <template #bottom>
            <OrigamPagination />
        </template>
    </OrigamTable>
</template>
```

## Props (interface)

```ts
interface ITableProps extends ICommonsComponentProps, IBorderProps,
    IRoundedProps, IElevationProps, IPaddingProps, IMarginProps,
    IHoverProps, IDimensionProps, IDensityProps, ITagProps {
    fixedHeader?: boolean
    fixedFooter?: boolean
}
```

## Anatomy

```html
<div class="origam-table [origam-table--fixed-header] [origam-table--has-top]">
    <!-- #top slot -->

    <div class="origam-table__wrapper">
        <table>
            <!-- default slot: thead / tbody / tfoot -->
        </table>
    </div>

    <!-- #bottom slot -->
</div>
```

## Design tokens consumed

`<OrigamTable>` reads from `tokens/component/table.json`. Override at
the document root or via a `:style` binding to re-skin a single instance.

| CSS variable | Token reference |
|---|---|
| `--origam-table---background-color` | `{color.surface.default}` |
| `--origam-table---color` | `{color.text.primary}` |
| `--origam-table---font-size` | `{font.size.md}` |
| `--origam-table---border-collapse` | `collapse` |
| `--origam-table__header-cell---background-color` | `{color.surface.overlay}` |
| `--origam-table__header-cell---color` | `{color.text.primary}` |
| `--origam-table__header-cell---font-weight` | `{font.weight.semibold}` |
| `--origam-table__header-cell---padding-block` | `{space.3}` |
| `--origam-table__header-cell---padding-inline` | `{space.4}` |
| `--origam-table__header-cell---border-bottom-color` | `{color.border.default}` |
| `--origam-table__header-cell---border-bottom-width` | `{border.width.2}` |
| `--origam-table__cell---padding-block` | `{space.3}` |
| `--origam-table__cell---padding-inline` | `{space.4}` |
| `--origam-table__cell---border-color` | `{color.border.subtle}` |
| `--origam-table__cell---border-width` | `{border.width.thin}` |
| `--origam-table__row---hover-background-color` | `{color.surface.sunken}` |

The full list lives in
`tokens/component/table.json`.

## Accessibility

- Always author a real `<caption>` or pair the table with a heading +
  `aria-labelledby` so assistive tech announces the dataset.
- `<th scope="col">` (or `scope="row"`) is the consumer's
  responsibility — `<OrigamTable>` does not inject any header markup.
- The scroll wrapper exposes `overflow-x: auto` on small viewports;
  combine with `<caption>` so the focusable scroll region remains
  discoverable.

## Theming notes

- Theme-aware out of the box — switching `<html data-theme="…">`
  re-resolves background, hover, and border colors instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.
- For zebra striping, set `--origam-table__row---hover-background-color`
  on `tr:nth-child(even)` via your own SCSS until a dedicated zebra
  modifier ships.

## Typography props

`<OrigamTable>` surfaces `ITypographyProps` across three internal BEM surfaces.
A single set of props drives all three — the same `fontSize` value applies to
both the table body and the visible caption; `fontWeight` targets header cells.

| Prop | CSS variable(s) set | Surface | Effect |
|---|---|---|---|
| `fontSize` | `--origam-table---font-size` | Root (body rows) | Overrides the default `0.875rem` table body font size |
| `fontSize` | `--origam-table__caption---font-size` | `<caption>` element | Overrides the default `0.875rem` caption font size (only visible when `captionVisible` is `true`) |
| `fontWeight` | `--origam-table__header-cell---font-weight` | `<th>` cells (via cascade from root) | Overrides the default `600` header cell font weight |

`fontFamily`, `lineHeight`, and `letterSpacing` are not exposed — the
component SCSS does not read those variables on any surface.

```vue
<template>
    <OrigamTable font-size="sm" font-weight="bold">
        <thead><tr><th>Name</th></tr></thead>
        <tbody><tr><td>Ada</td></tr></tbody>
    </OrigamTable>
</template>
```

## Related

- `OrigamDataTable` — schema-driven
  table built on top of `<OrigamTable>`.
- `OrigamSheet` — chrome surface that pairs
  well as a frame.
