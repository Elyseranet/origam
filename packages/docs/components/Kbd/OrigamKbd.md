# OrigamKbd

`<OrigamKbd>` renders keyboard shortcuts and key labels using the semantic `<kbd>` HTML element. It supports single keys, composed shortcuts (combinations), three visual variants, and full size/color/rounded token integration.

## Basic usage

```vue
<template>
    <OrigamKbd text="⌘" />
    <OrigamKbd text="Enter" />
    <OrigamKbd text="Ctrl" />
</template>
```

## Combination

Pass an array of key strings to `combination`. Each key is wrapped in its own nested `<kbd>` element and joined by the `separator` character (default `+`).

```vue
<template>
    <OrigamKbd :combination="['Ctrl', 'Shift', 'Z']" />
    <OrigamKbd :combination="['⌘', 'K']" separator="+" />
</template>
```

## Variants

Three visual styles are available via the `variant` prop:

| Value | Description |
|---|---|
| `outlined` (default) | Transparent background, visible border |
| `filled` | Surface background with subtle embossing shadow |
| `tonal` | Tinted surface, no border |

```vue
<template>
    <OrigamKbd text="⌘S" variant="outlined" />
    <OrigamKbd text="⌘S" variant="filled" />
    <OrigamKbd text="⌘S" variant="tonal" />
</template>
```

## Size

Five sizes mirror the design system scale via the `size` prop:

```vue
<template>
    <OrigamKbd text="xs" size="x-small" />
    <OrigamKbd text="sm" size="small" />
    <OrigamKbd text="md" />
    <OrigamKbd text="lg" size="large" />
    <OrigamKbd text="xl" size="x-large" />
</template>
```

## Color

Color and background intent tokens are applied via `color` / `bgColor`:

```vue
<template>
    <OrigamKbd text="Save" color="primary" />
    <OrigamKbd text="Delete" bg-color="danger" />
</template>
```

## Custom content (slot)

The default slot overrides `text` and `combination` entirely, enabling rich content:

```vue
<template>
    <OrigamKbd>
        <OrigamIcon :icon="MDI_ICONS.APPLE_KEYBOARD_COMMAND" size="x-small" />
    </OrigamKbd>
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Single key label |
| `combination` | `string[]` | — | Array of keys for a composed shortcut |
| `separator` | `string` | `'+'` | Character shown between each key in a combination |
| `variant` | `'outlined' \| 'filled' \| 'tonal'` | `'outlined'` | Visual style |
| `size` | `TSize` | — | Inherits from `ISizeProps` |
| `color` | `TColor` | — | Text color intent |
| `bgColor` | `TColor` | — | Background color intent |
| `rounded` | `TRounded \| boolean` | — | Corner-radius override |
| `border` | `boolean \| string` | — | Border override |
| `fontFamily` | `TFontFamily` | — | Font family token override (`sans` · `mono` · `serif`). Maps to `--origam-kbd---font-family`. |
| `fontSize` | `TFontSize` | — | Font size token override (`xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl`). Maps to `--origam-kbd---font-size`. |
| `fontWeight` | `TFontWeight` | — | Font weight token override (`regular` · `medium` · `semibold` · `bold` · `extrabold` · `black`). Maps to `--origam-kbd---font-weight`. |

## Accessibility

- Renders as `<kbd>` by specification (semantically identifies keyboard input).
- Nested `<kbd>` elements inside a combination follow the HTML5 spec for keyboard shortcut nesting.
- Separator spans carry `aria-hidden="true"` — they are cosmetic only.
- No interactive state — `<OrigamKbd>` is a presentational element.

## CSS variables

| Variable | Token | Description |
|---|---|---|
| `--origam-kbd---background-color` | `{color.surface.overlay}` | Surface background |
| `--origam-kbd---color` | `{color.text.primary}` | Text color |
| `--origam-kbd---border-color` | `{color.border.subtle}` | Border color |
| `--origam-kbd---border-width` | `{border.width.thin}` | Border width |
| `--origam-kbd---border-radius` | `{radius.sm}` | Corner radius |
| `--origam-kbd---font-family` | `{font.family.mono}` | Monospace font stack |
| `--origam-kbd---font-size` | `0.875em` | Base font size (relative to parent) |
| `--origam-kbd---font-weight` | `{font.weight.medium}` | Font weight |
| `--origam-kbd---gap` | `{space.1}` | Gap between keys in a combination |
| `--origam-kbd---box-shadow` | `{shadow.xs}` | Embossing shadow (filled variant only) |
