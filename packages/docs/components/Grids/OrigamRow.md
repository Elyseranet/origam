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
    IDensityProps, IAlignProps, IJustifyProps {
    gutters?:   string | number
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
| `--origam-row---margin-block-start` | `-4px` |
| `--origam-row---margin-block-end` | `-4px` |
| `--origam-row---margin-inline-start` | `-4px` |
| `--origam-row---margin-inline-end` | `-4px` |
| `--origam-row---density` | `0` (compact) / `-8px` (default) |
| `--origam-row--border---border-width` | inherits |
| `--origam-row--border---box-shadow` | inherits |

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
