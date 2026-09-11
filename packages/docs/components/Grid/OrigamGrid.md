# OrigamGrid

`<OrigamGrid>` is a thin declarative wrapper around CSS Grid. It exposes
every meaningful `grid-template-*` / `grid-auto-*` / placement property
as a typed prop and forwards the values to inline custom properties on
the root element. No JS measurement, no `ResizeObserver`, no flexbox
fallback — CSS Grid has been stable in every evergreen browser since
2017 (Safari 10.1, Edge 16, Firefox 52, Chrome 57) so we lean on the
platform.

The bundled `<OrigamGridItem>` sub-component is optional sugar: it
serialises the verbose `grid-column` / `grid-row` shorthands from an
ergonomic object syntax. Anyone can skip it and put
`style="grid-area: …"` on a plain `<div>` instead.

## Props — OrigamGrid

| Prop             | Type                                                                                   | Default      | Notes                                                                                                  |
|------------------|----------------------------------------------------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------|
| `columns`        | `number \| string \| string[]`                                                         | `'auto'`     | `number` → `repeat(N, 1fr)`. `string` → passed verbatim. `string[]` → joined with single space.        |
| `rows`           | `number \| string \| string[]`                                                         | `'auto'`     | Same accepted shapes as `columns`.                                                                     |
| `gap`            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| string \| number`                              | `'md'`       | Tokens resolve to `var(--origam-grid---gap-{token})`; raw strings pass through; numbers → `Npx`.       |
| `columnGap`      | same as `gap`                                                                          | `undefined`  | Inline-axis override.                                                                                  |
| `rowGap`         | same as `gap`                                                                          | `undefined`  | Block-axis override.                                                                                   |
| `areas`          | `string \| string[]`                                                                   | `undefined`  | Array shape: each entry = one row, wrapped in double quotes by the component.                          |
| `autoFlow`       | `'row' \| 'column' \| 'row dense' \| 'column dense'`                                   | `'row'`      | Maps 1:1 to `grid-auto-flow`.                                                                          |
| `autoColumns`    | `string`                                                                               | `undefined`  | Raw CSS for implicit column tracks.                                                                    |
| `autoRows`       | `string`                                                                               | `undefined`  | Raw CSS for implicit row tracks.                                                                       |
| `alignItems`     | `'start' \| 'center' \| 'end' \| 'stretch'`                                            | `'stretch'`  | Block-axis cell alignment.                                                                             |
| `justifyItems`   | `'start' \| 'center' \| 'end' \| 'stretch'`                                            | `'stretch'`  | Inline-axis cell alignment.                                                                            |
| `alignContent`   | `'start' \| 'center' \| 'end' \| 'stretch' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `undefined` | Aligns the entire grid on the block axis when smaller than its container.                              |
| `justifyContent` | same as `alignContent`                                                                 | `undefined`  | Aligns the entire grid on the inline axis.                                                             |
| `inline`         | `boolean`                                                                              | `false`      | Toggles `display: inline-grid`.                                                                        |
| `tag`            | `string`                                                                               | `'div'`      | Rendered HTML element.                                                                                 |

## Props — OrigamGridItem

| Prop          | Type                                              | Default      | Notes                                                                                                  |
|---------------|---------------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------|
| `column`      | `IGridLineSpec \| string \| number`               | `undefined`  | Object `{ start, end, span }` or raw CSS. `span` wins over `end` when both are set.                    |
| `row`         | `IGridLineSpec \| string \| number`               | `undefined`  | Same accepted shapes as `column`.                                                                      |
| `area`        | `string`                                          | `undefined`  | Named area. When set, overrides `column` / `row`.                                                      |
| `alignSelf`   | `'start' \| 'center' \| 'end' \| 'stretch'`       | `undefined`  | Per-item override of the parent's `alignItems`.                                                        |
| `justifySelf` | `'start' \| 'center' \| 'end' \| 'stretch'`       | `undefined`  | Per-item override of the parent's `justifyItems`.                                                      |
| `tag`         | `string`                                          | `'div'`      | Rendered HTML element.                                                                                 |

## IGridLineSpec

```ts
interface IGridLineSpec {
    start?: number | string  // grid line index or named line
    end?:   number | string  // grid line index or named line
    span?:  number           // span N tracks from `start` (wins over `end`)
}
```

## Tokens

`tokens/component/grid.json` exposes the gap-size matrix:

| Token  | CSS variable                  | Resolves to (`primitive.json`) |
|--------|-------------------------------|--------------------------------|
| `xs`   | `--origam-grid---gap-xs`      | `space.1`  →  4 px             |
| `sm`   | `--origam-grid---gap-sm`      | `space.2`  →  8 px             |
| `md`   | `--origam-grid---gap-md`      | `space.4`  → 16 px             |
| `lg`   | `--origam-grid---gap-lg`      | `space.6`  → 24 px             |
| `xl`   | `--origam-grid---gap-xl`      | `space.8`  → 32 px             |

Everything else (track templates, areas, alignment, …) is delegated to
the consumer — there are intentionally no `grid.template.*` tokens
because grid templates are layout decisions, not design decisions.

## Examples

### 12-column dashboard with `OrigamGridItem`

```vue
<template>
    <OrigamGrid :columns="12" gap="lg">
        <OrigamGridItem :column="{ start: 1, span: 8 }">Main content</OrigamGridItem>
        <OrigamGridItem :column="{ start: 9, span: 4 }">Sidebar</OrigamGridItem>
        <OrigamGridItem :column="{ start: 1, end: 13 }">Footer</OrigamGridItem>
    </OrigamGrid>
</template>

<script setup lang="ts">
    import { OrigamGrid, OrigamGridItem } from '@origam/components'
</script>
```

### Holy-grail layout with `areas`

```vue
<template>
    <OrigamGrid
            :areas="[
                'header header header',
                'sidebar main aside',
                'footer footer footer'
            ]"
            columns="200px 1fr 200px"
            rows="auto 1fr auto"
            gap="md"
    >
        <header style="grid-area: header">Header</header>
        <aside style="grid-area: sidebar">Sidebar</aside>
        <main style="grid-area: main">Main</main>
        <aside style="grid-area: aside">Aside</aside>
        <footer style="grid-area: footer">Footer</footer>
    </OrigamGrid>
</template>
```

### Magazine layout with `autoFlow="row dense"`

`row dense` lets the algorithm backfill empty cells with smaller items,
producing the classic magazine "puzzle" look. Pair it with per-item
`column={ span: N }` to vary widths.

```vue
<template>
    <OrigamGrid :columns="4" autoFlow="row dense" gap="sm">
        <OrigamGridItem :column="{ span: 2 }">Hero</OrigamGridItem>
        <OrigamGridItem :column="{ span: 1 }">A</OrigamGridItem>
        <OrigamGridItem :column="{ span: 1 }">B</OrigamGridItem>
        <OrigamGridItem :column="{ span: 3 }">Featured</OrigamGridItem>
        <OrigamGridItem :column="{ span: 1 }">C</OrigamGridItem>
    </OrigamGrid>
</template>
```

## Browser support

CSS Grid is supported by every evergreen browser shipped since March
2017. The component does NOT implement a flex fallback — if you need
to support IE 11 or pre-2017 Safari, this component is not the right
abstraction. Use `<OrigamRow>` / `<OrigamCol>` (flex-based) instead.

## Accessibility

`<OrigamGrid>` and `<OrigamGridItem>` render as plain `<div>` by
default. They have no implicit ARIA role. Pass `tag="section"` /
`tag="ul"` / `tag="ol"` if the visual grid maps to a semantic structure
(a landmark, a list, …) so screen readers see the right tree.

If a grid carries data semantics (a calendar, a spreadsheet), set
`role="grid"` / `role="row"` / `role="gridcell"` explicitly on the
relevant elements — the component does not infer ARIA from CSS Grid
because the two are independent contracts.
