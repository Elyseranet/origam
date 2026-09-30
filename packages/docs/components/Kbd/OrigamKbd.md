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

### A variant is a props preset, not CSS

Since ADR-005, `variant` ships **no stylesheet rule at all**. It resolves to a
named bag of props — `KBD_VARIANT_PRESETS`, in
`packages/ds/src/consts/Kbd/kbd.const.ts` — inserted at the weakest rung of the
resolution chain:

```
prop written at the call site  >  theme default  >  VARIANT PRESET  >  withDefaults
```

This is the whole table, verbatim. Nothing else is applied:

| Variant | `bgColor` | `border` | `borderColor` | `elevation` |
|---|---|---|---|---|
| `outlined` | `var(--origam-kbd--outlined---background-color, …)` | — | — | 2-layer emboss |
| `filled` | `var(--origam-kbd__filled---background-color, …)` | — | — | 2-layer emboss, stronger |
| `tonal` | `var(--origam-kbd__tonal---background-color, …)` | `'none'` | `transparent` | `'none'` |

A dash means *the preset sets nothing*, so the generic
`--origam-kbd---{property}` token applies — that is deliberate, and it is what
keeps those tokens reachable by a theme.

**Every value you pass wins over the preset.** `<OrigamKbd variant="tonal"
bg-color="primary">` paints primary; before ADR-005 the variant's CSS won and
your value was ignored.

**The `origam-kbd--variant-{value}` class is still emitted**, and the DS
attaches no rule to it. It exists as *your* override hook.

### Combinations paint their keys, not the wrapper

On a combination the root `<kbd>` is a transparent wrapper and each
`.origam-kbd__key` is a painted surface, so surface props (`bgColor`, `color`,
`border`, `elevation`) land on the **keys**:

```vue
<template>
    <OrigamKbd :combination="['Ctrl', 'S']" bg-color="primary" />
</template>
```

⚠️ This changed with ADR-005 lot 2. Previously the same markup painted the
*wrapper* primary and left the keys on the variant surface — a coloured frame
around un-coloured keys. If you relied on that, wrap the component and style
your own container.

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
| `border` | `boolean \| string` | — | Border override. Inherits from `IBorderProps` |
| `borderColor` | `string` | — | Border colour override. Inherits from `IBorderProps` |
| `elevation` | `TElevation` | — | Shadow: an origam rung (`none` · `xs` … `xl`), a Material `0..24` number, or a free-form `box-shadow`. Inherits from `IElevationProps`. This is the channel each variant's emboss shadow now travels on |
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

### Per-variant background tokens

Each variant's **background** is a token, read by the preset table rather than
by a stylesheet rule. Retune a variant's fill by redeclaring one of these:

| Variable | Token | Description |
|---|---|---|
| `--origam-kbd--outlined---background-color` | `rgba(0, 0, 0, 0)` | `outlined` background (transparent by design) |
| `--origam-kbd__filled---background-color` | `{color.surface.raised}` | `filled` background |
| `--origam-kbd__tonal---background-color` | `{color.surface.sunken}` | `tonal` background |

⚠️ The three matching `…---border-width` tokens were **removed** in ADR-005
lot 2. They carried no distinct value: `outlined` and `filled` both resolved to
`{border.width.thin}` — already what `--origam-kbd---border-width` gives — and
`tonal` to `{border.width.0}`, which is exactly what the preset's
`border: 'none'` emits. Change a variant's border width through
`--origam-kbd---border-width`, or pass `border` at the call site.
