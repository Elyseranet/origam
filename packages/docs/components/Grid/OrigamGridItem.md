# OrigamGridItem

`<OrigamGridItem>` is optional sugar for a `<OrigamGrid>` cell: it
serialises the verbose `grid-column` / `grid-row` shorthands from an
ergonomic object syntax, and forwards `grid-area` / `align-self` /
`justify-self` as-is. The component is purely presentational — no
internal state, no composable of its own — `serialiseLineSpec()` runs
inline in the `.vue` and is exposed for tests via `defineExpose`.

Nothing requires it: `<div style="grid-column: 1 / span 4">` on a plain
element inside `<OrigamGrid>` achieves the exact same layout. Reach for
`<OrigamGridItem>` when the object syntax (`{ start, end, span }`) reads
better than hand-writing the shorthand, or when the item also needs
`tag` / `id` / `class` / `style` passthrough.

## Basic usage

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

## Props

| Prop          | Type                                        | Default     | Notes                                                                                                                |
|---------------|----------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------|
| `column`      | `IGridLineSpec \| string \| number`         | `undefined` | Object `{ start, end, span }` or raw CSS (`'1 / 5'`, `'span 2'`). `span` wins over `end` when both are set.           |
| `row`         | `IGridLineSpec \| string \| number`         | `undefined` | Same accepted shapes as `column`.                                                                                     |
| `area`        | `string`                                     | `undefined` | Named `grid-area`. When set, **overrides** `column` / `row` entirely (the component picks one or the other, never both). |
| `alignSelf`   | `'start' \| 'center' \| 'end' \| 'stretch'` | `undefined` | Per-item `align-self`, overriding the parent grid's `alignItems`.                                                     |
| `justifySelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | `undefined` | Per-item `justify-self`, overriding the parent grid's `justifyItems`.                                                 |
| `tag`         | `string`                                     | `'div'`     | Rendered HTML element.                                                                                                |
| `id` / `class` / `style` | `ICommonsComponentProps`          | `undefined` | Passthrough on the root element.                                                                                      |

`IGridItemProps extends ICommonsComponentProps, ITagProps` — nothing
else. There is intentionally no color / border / spacing / dimension
surface here: a grid cell's box model belongs to whatever content or
wrapper is placed inside it, not to the placement helper itself. Need
padding or a background on a cell? Put those on the element (or
component) `<OrigamGridItem>` wraps, or skip the wrapper and set
`style="grid-column: …"` directly on a styled element.

## `IGridLineSpec`

```ts
interface IGridLineSpec {
    start?: number | string  // grid line index or named line
    end?:   number | string  // grid line index or named line
    span?:  number           // span N tracks from `start` (wins over `end`)
}
```

Serialisation examples (`serialiseLineSpec`, exposed via `defineExpose`
for tests):

| Input                          | Output          |
|---------------------------------|-----------------|
| `{ start: 1, end: 5 }`          | `'1 / 5'`       |
| `{ start: 1, span: 4 }`         | `'1 / span 4'`  |
| `{ start: 1 }`                  | `'1'`           |
| `{ span: 3 }`                   | `'span 3'`      |
| `'1 / 5'` (string)               | `'1 / 5'` (passed verbatim) |
| `4` (number)                    | `'4'`           |
| `undefined`                      | `undefined` (no `grid-column`/`grid-row` inline style emitted) |

## Emits

None. `IGridItemEmits` is declared empty on purpose — the component is
a pure presentational container.

## Slots

| Slot      | Bindings | Description         |
|-----------|----------|----------------------|
| `default` | —        | The cell's content. |

Typed as `ICommonsComponentSlots` — no named slot.

## Behaviour notes

- `area` and `column`/`row` are mutually exclusive **by construction**:
  when `area` is set, the component emits `grid-area` and skips
  `grid-column`/`grid-row` entirely, regardless of whether `column` or
  `row` are also passed. Pair `area` with the parent `<OrigamGrid>`'s
  own `areas` prop.
- The component sets `min-width: 0; min-height: 0` on its root — the
  standard fix for the "grid/flex child won't shrink below its content's
  intrinsic size" trap, so a long unbroken string or a wide child inside
  a cell doesn't blow out the track.
- No animation, no SSR-specific behaviour — this is pure inline-style
  serialisation, safe under SSR by default.

## Accessibility

`<OrigamGridItem>` renders as a plain `<div>` by default and carries no
implicit ARIA role. Pass `tag="li"` / `tag="article"` / `tag="section"`
when the cell's role in the page is more specific than a generic
container, so assistive tech sees the right structure — the placement
props (`column`/`row`/`area`/`alignSelf`/`justifySelf`) are purely
visual and have no bearing on the accessibility tree either way.

## Related

- `OrigamGrid` — the parent container; see
  `packages/docs/components/Grid/OrigamGrid.md` for its own props,
  the gap-size token table, and multi-item layout examples (12-column
  dashboard, holy-grail `areas` layout, magazine `autoFlow` layout) that
  all use `<OrigamGridItem>` together with it.
