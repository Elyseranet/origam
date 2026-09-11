# OrigamSheet

`<OrigamSheet>` is the generic chrome surface — a styled, theme-aware
container with the full origam mixin set (border, rounded, elevation,
position, dimension, padding, margin, color). Most "panel-like"
components (`<OrigamCard>`, `<OrigamDialog>`, …) ultimately compose
from `<OrigamSheet>`, but it is also exposed standalone for one-off
needs.

## Basic usage

```vue
<template>
    <OrigamSheet>
        Hello
    </OrigamSheet>
</template>
```

## Color (intent)

```vue
<template>
    <OrigamSheet color="primary">Tinted text</OrigamSheet>
    <OrigamSheet bg-color="primary">Tinted background</OrigamSheet>
</template>
```

## Elevation

```vue
<template>
    <OrigamSheet :elevation="0">flat</OrigamSheet>
    <OrigamSheet :elevation="1">xs</OrigamSheet>
    <OrigamSheet :elevation="3">sm</OrigamSheet>
    <OrigamSheet :elevation="8">md</OrigamSheet>
    <OrigamSheet :elevation="16">lg</OrigamSheet>
    <OrigamSheet :elevation="24">xl</OrigamSheet>
</template>
```

## Rounded

```vue
<template>
    <OrigamSheet rounded="x-small">x-small</OrigamSheet>
    <OrigamSheet rounded="default">default</OrigamSheet>
    <OrigamSheet rounded="x-large">x-large</OrigamSheet>
</template>
```

## Position

```vue
<template>
    <OrigamSheet position="absolute" :top="0" :right="0">corner</OrigamSheet>
    <OrigamSheet position="sticky"   :top="0">sticky header</OrigamSheet>
</template>
```

## Dimension & location

```vue
<template>
    <OrigamSheet width="320" height="200">card-sized</OrigamSheet>
    <OrigamSheet location="top center">centred at the top</OrigamSheet>
</template>
```

## Modifiers

```vue
<template>
    <OrigamSheet border>Bordered</OrigamSheet>
    <OrigamSheet rounded border>Rounded + bordered</OrigamSheet>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamSheet tag="article">…</OrigamSheet>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Sheet content. |

## Props (interface)

```ts
interface ISheetProps extends ITagProps, ICommonsComponentProps,
    IPaddingProps, IMarginProps, IColorProps, IBorderProps,
    IRoundedProps, IElevationProps, IDimensionProps,
    ILocationProps, IPositionProps {
    // No extra props — sheet IS the union of the chrome mixins.
}
```

## Anatomy

```html
<div class="origam-sheet [origam-sheet--border] [origam-sheet--rounded]
            [origam-sheet--{position}]">
    <!-- default slot -->
</div>
```

## Design tokens consumed

`<OrigamSheet>` reads from `tokens/component/sheet.json`. Override at
the document root or via a `:style` binding to re-skin a single
instance.

| CSS variable | Token reference |
|---|---|
| `--origam-sheet---background` | `{color.surface.default}` |
| `--origam-sheet---color` | `{color.text.primary}` |
| `--origam-sheet---box-shadow` | `{shadow.none}` |
| `--origam-sheet---border-color` | `{color.text.primary}` |
| `--origam-sheet---border-style` | `solid` |
| `--origam-sheet---border-width` | `{border.width.0}` |
| `--origam-sheet---border-radius` | `{radius.none}` |
| `--origam-sheet---width` | `100%` |
| `--origam-sheet---max-width` | `100%` |
| `--origam-sheet---min-width` | `{space.0}` |
| `--origam-sheet---height` | `100%` |
| `--origam-sheet---max-height` | `100%` |
| `--origam-sheet---min-height` | `{space.0}` |
| `--origam-sheet---padding-block-start` | `{space.0}` |
| `--origam-sheet---padding-block-end` | `{space.0}` |
| `--origam-sheet---padding-inline-start` | `{space.0}` |
| `--origam-sheet---padding-inline-end` | `{space.0}` |
| `--origam-sheet---margin-block-start` | `{space.0}` |
| `--origam-sheet---margin-block-end` | `{space.0}` |
| `--origam-sheet---margin-inline-start` | `{space.0}` |
| `--origam-sheet---margin-inline-end` | `{space.0}` |
| `--origam-sheet--border---border-width` | `{border.width.thin}` |
| `--origam-sheet--border---box-shadow` | `{shadow.none}` |
| `--origam-sheet--rounded---border-radius` | `{radius.sm}` |

The full list lives in
`tokens/component/sheet.json`.

## Accessibility

- Picks a presentational `<div>` by default — use a more meaningful
  `tag` (`article`, `section`, `aside`, `dialog`, …) when the sheet
  represents a discrete region.
- The component does not trap focus. If you build a dialog on top of
  `<OrigamSheet>`, layer a focus-trap composable on top.

## Theming notes

- The component is theme-aware out of the box. Switching
  `<html data-theme="…">` re-resolves every variable instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamMain` — application-level main slot, similar API.
- `OrigamContainer` — outer wrapper with breakpoint-aware max-width.
