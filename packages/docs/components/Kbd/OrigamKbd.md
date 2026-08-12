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

`variant` is a **props preset** (ADR-005 — `variant` = preconfiguration of
props, not a CSS layer), resolved through the exact same mechanism a theme
uses to declare default props: `useDefaults`. Setting `variant` does **not**
inject any CSS — it pre-fills `bgColor` / `borderColor` / `border` /
`elevation` with the values below, which you can still override individually.

| Value | `bgColor` | `borderColor` | `border` | `elevation` |
|---|---|---|---|---|
| `outlined` (default) | `var(--origam-color__surface---raised)` | `var(--origam-color__border---subtle)` | `true` (1px) | `0 1px 0 0 color-mix(in srgb, currentColor 12%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 50%, transparent)` |
| `filled` | `var(--origam-color__surface---overlay)` | `var(--origam-color__border---subtle)` | `true` (1px) | `0 1px 2px 0 color-mix(in srgb, currentColor 18%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 60%, transparent)` |
| `tonal` | `color-mix(in srgb, currentColor 8%, transparent)` | — | *(unset → no border)* | `none` |

```vue
<template>
    <OrigamKbd text="⌘S" variant="outlined" />
    <OrigamKbd text="⌘S" variant="filled" />
    <OrigamKbd text="⌘S" variant="tonal" />
</template>
```

### Resolution order — the preset is the WEAKEST tier

```
prop at the call site  >  theme default  >  variant preset  >  component default
```

A prop you set explicitly, or a theme default targeting `origam-kbd`,
**always** beats the preset — the preset only fills in what nothing stronger
already decided:

```vue
<template>
    <!-- Paints PRIMARY. `bgColor="primary"` is a call-site prop; it outranks
         whatever `outlined` would otherwise have preset. -->
    <OrigamKbd text="⌘S" variant="outlined" bg-color="primary" />
</template>
```

The `origam-kbd--variant-{value}` class is still applied to the root element
— it carries **zero** rules from the DS. It exists purely as a CSS hook for
consumer overrides (`.origam-kbd--variant-outlined { ... }` in your own
stylesheet).

### Theme-level override

A theme can redefine what a variant means (or add a new named one) via
`IOrigamTheme.variants` — same shape as the table above, merged over the
DS-shipped one:

```ts
createOrigam({
    themes: [{
        name: 'brand-x',
        variants: {
            'origam-kbd': {
                outlined: { border: true, borderColor: 'var(--origam-color__action--primary---bg)' }
            }
        }
    }]
})
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
| `border` | `boolean \| number \| string` | — | Border override — preset by `variant` (see above) |
| `borderColor` | `string` | — | Border color override — preset by `variant` |
| `elevation` | `TElevation` | — | Box-shadow override — preset by `variant` |
| `fontFamily` | `TFontFamily` | — | Font family token override (`sans` · `mono` · `serif`). Maps to `--origam-kbd---font-family`. |
| `fontSize` | `TFontSize` | — | Font size token override (`xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl`). Maps to `--origam-kbd---font-size`. |
| `fontWeight` | `TFontWeight` | — | Font weight token override (`regular` · `medium` · `semibold` · `bold` · `extrabold` · `black`). Maps to `--origam-kbd---font-weight`. |

## Accessibility

- Renders as `<kbd>` by specification (semantically identifies keyboard input).
- Nested `<kbd>` elements inside a combination follow the HTML5 spec for keyboard shortcut nesting.
- Separator spans carry `aria-hidden="true"` — they are cosmetic only.
- No interactive state — `<OrigamKbd>` is a presentational element.

## CSS variables

> Since ADR-005, these are **only** the component's own baseline fallbacks
> (used when `variant`, `bgColor`, `border`, `elevation`, … are all unset —
> not achievable in practice, since `variant` always resolves to a preset).
> They are **not** written to per-variant anymore — no `--variant-*` SCSS
> rule ships. Use the `variant` prop (or the props it presets) to change the
> surface; fall back to these vars only for a truly component-wide override
> unrelated to any variant.

| Variable | Token | Description |
|---|---|---|
| `--origam-kbd---background-color` | `{color.surface.raised}` | Surface background fallback |
| `--origam-kbd---color` | `{color.text.primary}` | Text color |
| `--origam-kbd---border-color` | `{color.border.subtle}` | Border color fallback |
| `--origam-kbd---border-width` | `{border.width.thin}` | Border width fallback |
| `--origam-kbd---border-radius` | `{radius.sm}` | Corner radius |
| `--origam-kbd---box-shadow` | — | Box-shadow fallback |
| `--origam-kbd---font-family` | `{font.family.mono}` | Monospace font stack |
| `--origam-kbd---font-size` | `0.875em` | Base font size (relative to parent) |
| `--origam-kbd---font-weight` | `{font.weight.medium}` | Font weight |
| `--origam-kbd---gap` | `{space.1}` | Gap between keys in a combination |
