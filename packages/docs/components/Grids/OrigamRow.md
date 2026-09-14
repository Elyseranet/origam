# OrigamRow

`<OrigamRow>` is the flex row container for the origam 12-column grid.
It wraps a set of `<OrigamCol>` items, exposes per-breakpoint
`align` / `justify`, density, and the standard
border / padding / margin / colour mixins.

## Basic usage

```vue
<template>
    <OrigamRow>
        <OrigamCol cols="6">A</OrigamCol>
        <OrigamCol cols="6">B</OrigamCol>
    </OrigamRow>
</template>
```

## Align & justify

`align` controls `align-items` (cross-axis); `justify` controls
`justify-content` (main-axis). Both accept per-breakpoint overrides
(`alignSm`, `alignMd`, `alignLg`, `alignXl`, `alignXxl` and the same
suffixes for `justify`).

```vue
<template>
    <OrigamRow align="center" justify="space-between">
        <OrigamCol cols="auto">left</OrigamCol>
        <OrigamCol cols="auto">right</OrigamCol>
    </OrigamRow>
</template>
```

| `align` | CSS `align-items` |
|---|---|
| `start` | `flex-start` |
| `end` | `flex-end` |
| `center` | `center` |
| `baseline` | `baseline` |
| `stretch` | `stretch` |

| `justify` | CSS `justify-content` |
|---|---|
| `start` | `flex-start` |
| `end` | `flex-end` |
| `center` | `center` |
| `space-between` | `space-between` |
| `space-around` | `space-around` |
| `space-evenly` | `space-evenly` |

## Density

`density` tightens or loosens the gutter that `<OrigamRow>` adds around
its children. Defaults to `default`.

```vue
<template>
    <OrigamRow density="compact">
        <OrigamCol cols="4">A</OrigamCol>
        <OrigamCol cols="4">B</OrigamCol>
        <OrigamCol cols="4">C</OrigamCol>
    </OrigamRow>
</template>
```

## Direction

```vue
<template>
    <!-- Stack on mobile, switch to row from md up -->
    <OrigamRow direction="column">
        <OrigamCol>A</OrigamCol>
        <OrigamCol>B</OrigamCol>
    </OrigamRow>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamRow tag="ul">
        <OrigamCol tag="li" cols="6">item 1</OrigamCol>
        <OrigamCol tag="li" cols="6">item 2</OrigamCol>
    </OrigamRow>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Row content (typically a list of `<OrigamCol>`). |

## Props (interface)

```ts
interface IRowProps extends ICommonsComponentProps, ITagProps,
    IPaddingProps, IMarginProps, IBorderProps, IColorProps,
    IBgColorProps, IDensityProps, IAlignProps, IJustifyProps {
    gutters?:   TRowGutter
    direction?: TFlexDirection
}
```

## Anatomy

```html
<div class="origam-row origam-row--align-{align} origam-row--justify-{justify}
            origam-row--density-{density}">
    <!-- default slot — typically <origam-col> instances -->
</div>
```

## Design tokens consumed

| CSS variable | Default |
|---|---|
| `--origam-row---display` | `flex` |
| `--origam-row---flex-wrap` | `wrap` |
| `--origam-row---flex` | `1 1 auto` |
| `--origam-row---box-sizing` | `border-box` |
| `--origam-row---align-items` | `stretch` |
| `--origam-row---justify-content` | `flex-start` |
| `--origam-row---gutter` | `var(--origam-row--gutter-comfortable---gap)` (24px) |
| `--origam-row--gutter-none---gap` | `0` |
| `--origam-row--gutter-dense---gap` | `8px` |
| `--origam-row--gutter-default---gap` | `16px` |
| `--origam-row--gutter-comfortable---gap` | `24px` |
| `--origam-row---padding-block-start` | `0` |
| `--origam-row---padding-block-end` | `0` |
| `--origam-row---padding-inline-start` | `0` |
| `--origam-row---padding-inline-end` | `0` |
| `--origam-row---margin-block-start` | `-4px` |
| `--origam-row---margin-block-end` | `-4px` |
| `--origam-row---margin-inline-start` | `-4px` |
| `--origam-row---margin-inline-end` | `-4px` |
| `--origam-row---density` | `0px` (default) / `-8px` (compact) / `8px` (comfortable) |
| `--origam-row--border---border-width` | inherits |
| `--origam-row--border---box-shadow` | inherits |

## Gutters

`gutters` sets `--origam-row---gutter`, the **total** space between two
neighbouring columns. The variable is *inherited*: the row declares it on
itself, every descendant `<OrigamCol>` reads it, and nothing has to be
passed down — no `provide` / `inject`, no prop drilling.

```
col padding = gutter / 2          row margin = gutter / -2
```

Both halves come from the same number, which is what makes the outer edge
of the grid sit flush with its container. Before this was wired the two
sides disagreed — `OrigamCol` padded `12px` (a 24px gutter) while
`OrigamRow` pulled back `-4px` (an 8px gutter), two rungs apart, so every
grid sat 8px inside its container on each side.

| `gutters` | gutter | col padding | row margin |
|---|---|---|---|
| `none` | `0` | `0` | `0` |
| `dense` | `8px` | `4px` | `-4px` |
| `default` | `16px` | `8px` | `-8px` |
| `comfortable` *(default)* | `24px` | `12px` | `-12px` |

A named rung emits the class `origam-row--gutter-{rung}`, which re-points
`--origam-row---gutter` at that rung's token. Any other value is treated as
a free length and emitted inline — a number becomes px, a CSS length is
kept as written:

```html
<origam-row gutters="dense">…</origam-row>
<origam-row :gutters="30">…</origam-row>
<origam-row gutters="1.5rem">…</origam-row>
```

The default is `comfortable` so that column-to-column spacing stays exactly
what it has always been (24px). Only the row's outer pull-back changed, and
that change is the bug fix.

::: warning `--origam-row---margin-*` is derived, not a knob
The four `--origam-row---margin-*` variables are now computed from the
gutter on the row itself. Setting one of them alone re-creates the very
mismatch described above — the row would pull back a different amount than
the columns push out. Drive the grid through `gutters` (or
`--origam-row---gutter`); use the `margin` prop for one-off nudges.
:::

Every margin is emitted as `calc(var(--origam-row---margin-*) + var(--origam-row---density))`,
so `density` widens or tightens the gutter around the row rather than
replacing the base margin. The density value therefore **must carry a
unit** — a unitless `0` makes the whole `calc()` invalid and the browser
drops the declaration silently (the row then renders with no gutter at
all instead of `-4px`).

Two rows that follow each other collapse their facing gutters through
`.origam-row + .origam-row`, which cancels the negative margin of the
second one. Nothing to do in consumer code — do **not** add a manual
`margin-top` between stacked rows.

## Accessibility

- `<OrigamRow>` is purely structural; it adds no role. Pick a meaningful
  `tag` (`ul`, `ol`, `nav`, `section`…) when the row is semantically a
  list / navigation / region.
- Don't rely on `align` / `justify` to convey meaning that should be
  exposed to assistive tech — keep markup order coherent with the
  intended reading order.

## Theming notes

- The component is theme-aware. Colour fallbacks resolve through
  `useBothColor` and react to `<html data-theme="…">` switches.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamCol` — flex grid item.
- `OrigamContainer` — outer wrapper with breakpoint-aware max-width.
- `OrigamSpacer` — flexible filler.
