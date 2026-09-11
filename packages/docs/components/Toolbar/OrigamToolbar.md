# OrigamToolbar

`<OrigamToolbar>` is a **horizontal layout band** typically placed at the top of a view.
It exposes prepend, title, content, and append regions and inherits the full set of
color, elevation, border, rounding, density, and positioning composables.

## Basic usage

```vue
<template>
    <OrigamToolbar title="My App" />
</template>
```

## Color

```vue
<template>
    <OrigamToolbar title="Primary" bg-color="primary" color="white" />
</template>
```

## Elevation

```vue
<template>
    <OrigamToolbar title="Elevated" :elevation="4" />
</template>
```

## Flat

Remove the shadow.

```vue
<template>
    <OrigamToolbar title="Flat" flat />
</template>
```

## Collapse

Collapses the toolbar to icon-only mode (max-width 112px, title hidden).

```vue
<template>
    <OrigamToolbar title="Collapsible" :collapse="collapsed" />
</template>
```

## Floating

Renders inline (`display: inline-flex`) rather than stretching full width.

```vue
<template>
    <OrigamToolbar title="Floating" floating />
</template>
```

## Density

```vue
<template>
    <OrigamToolbar title="Compact" density="compact" />
</template>
```

## Rounded

```vue
<template>
    <OrigamToolbar title="Rounded" rounded="medium" />
</template>
```

## Border

```vue
<template>
    <OrigamToolbar title="Bordered" border />
</template>
```

## Slots

| Slot | Description |
|---|---|
| `default` | Full override of the wrapper content. |
| `prepend` | Leading area (icon buttons, hamburger menu, …). |
| `title` | Title region — falls back to `OrigamTitle` when the `title` prop is set. |
| `content` | Grows to fill all remaining space between prepend/append. |
| `append` | Trailing area (action buttons, avatars, …). |

## Props — Typography (title)

These props override the matching `--origam-toolbar__title---*` CSS variable via an inline
custom property on `div.origam-toolbar__title`. The `.origam-title` inside that div reads
the vars so all four props have a real visual effect.
`fontFamily` is not exposed (no `font-family` rule in `__title .origam-title`).

| Prop | Type | Values | CSS variable overridden |
|---|---|---|---|
| `fontSize` | `TFontSize` | `xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl` | `--origam-toolbar__title---font-size` |
| `fontWeight` | `TFontWeight` | `regular · medium · semibold · bold · extrabold · black` | `--origam-toolbar__title---font-weight` |
| `letterSpacing` | `TLetterSpacing` | `tight · normal · wide · wider · widest` | `--origam-toolbar__title---letter-spacing` |
| `lineHeight` | `TLineHeight` | `none · tight · snug · normal · relaxed · loose` | `--origam-toolbar__title---line-height` |

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-toolbar---background` | Toolbar background. |
| `--origam-toolbar---color` | Toolbar text color. |
| `--origam-toolbar---box-shadow` | Shadow. |
| `--origam-toolbar---height` | Toolbar height. |
| `--origam-toolbar---border-radius` | Border radius. |
| `--origam-toolbar---zIndex` | Z-index. |
| `--origam-toolbar__wrapper---display` | Wrapper flex layout. |
| `--origam-toolbar__content---flex-grow` | Content flex-grow. |
| `--origam-toolbar__title---font-size` | Title font size. |

## Accessibility

- Renders as `<header>` by default (override via `tag` prop).
- Use the `prepend` slot for skip-navigation links or hamburger triggers.
- The `content` slot occupies the landmark center; keep it focused.
