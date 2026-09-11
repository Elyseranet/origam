# OrigamLabel

`<OrigamLabel>` is the inline label element used standalone or by
`<OrigamField>` (where it drives the floating-label notch). It renders a
`<label>` by default but accepts any tag, exposes a `required` star, and
can be flagged `floating` so `<OrigamField>` can position it above an
input.

## Basic usage

```vue
<template>
    <OrigamLabel text="Email" />
</template>
```

## Required

```vue
<template>
    <OrigamLabel text="Email" required />
</template>
```

The `*` indicator is theme-aware — its color comes from
`--origam-label__required-indicator---color`.

## Floating

`floating` is the state used by `<OrigamField>` to position the cloned
label inside the input notch. Standalone, it just adds the
`origam-label--floating` class — `<OrigamField>` (or your own SCSS) is in
charge of the actual transform / positioning animation.

```vue
<template>
    <OrigamLabel text="Email" floating />
</template>
```

## Color

`color` and `bgColor` accept any CSS-color value. Intent strings are
typed but resolved as raw CSS values by `useColor` here (no intent →
SCSS mapping). Use a `:style` binding on a component CSS variable for
semantic tinting:

```vue
<template>
    <OrigamLabel text="Email" :style="{
        '--origam-label---color': 'var(--origam-color__text---primary)'
    }" />
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamLabel tag="span" text="Inline label" />
    <OrigamLabel tag="legend" text="Field-set legend" />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Replaces the inner content. Falls back to `text` + the `*` required indicator. |

```vue
<template>
    <OrigamLabel for="email">
        Email <em style="opacity: .6;">(optional)</em>
    </OrigamLabel>
</template>
```

## Emits

| Event | Payload | Description |
|---|---|---|
| `click` | `MouseEvent` | Fires on label click. Native `<label for>` association still focuses the bound input — this event lets you intercept the click for analytics / custom handling. |

```vue
<template>
    <OrigamLabel text="Email" @click="onLabelClick" />
</template>
```

## Props (interface)

```ts
interface ILabelProps extends ICommonsComponentProps, IMarginProps,
    IPaddingProps, IBorderProps, IRoundedProps, IColorProps,
    ITagProps, ITypographyProps {
    text?: string
    floating?: boolean
    required?: boolean
    name?: string
}

interface ILabelEmits {
    (e: 'click', event: MouseEvent): void
}
```

### Typography props (`ITypographyProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | Font size token. Sets `--origam-label---font-size` to `var(--origam-font__size---{fontSize})` (xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl). When unset, the label keeps its theme font-size. |
| `fontWeight` | `TFontWeight` | — | Font weight token. Sets `--origam-label---font-weight` to `var(--origam-font__weight---{fontWeight})` (regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900). When unset, the label keeps its theme font-weight. |
| `lineHeight` | `TLineHeight` | — | Line-height token. Sets `--origam-label---line-height` to `var(--origam-font__lineHeight---{lineHeight})` (none 1 · tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625 · loose 2). When unset, the label keeps its theme line-height. |
| `letterSpacing` | `TLetterSpacing` | — | Letter-spacing token. Sets `--origam-label---letter-spacing` to `var(--origam-font__letterSpacing---{letterSpacing})` (tight · normal · wide · wider · widest). When unset, the label keeps its theme letter-spacing. |

## Anatomy

```html
<label class="origam-label [origam-label--floating]" id="…" name="…">
    <span>{{ text }}</span>
    <sup>*</sup>            <!-- when required -->
</label>
```

## Design tokens consumed

`<OrigamLabel>` reads from `tokens/component/label.json`. Override at
the document root or via a `:style` binding to re-skin a single instance.

| CSS variable | Token reference |
|---|---|
| `--origam-label---color` | `{color.text.secondary}` |
| `--origam-label---font-size` | `{font.size.md}` |
| `--origam-label---font-weight` | `{font.weight.regular}` |
| `--origam-label---line-height` | `{font.lineHeight.normal}` |
| `--origam-label---letter-spacing` | `{font.letterSpacing.normal}` |
| `--origam-label---pointer-events` | `none` |
| `--origam-label---transition-duration` | `{motion.duration.normal}` |
| `--origam-label---transition-easing` | `{motion.easing.standard}` |
| `--origam-label--floating---font-size` | `0.75em` |
| `--origam-label--floating---visibility` | `hidden` |
| `--origam-label__required-indicator---color` | `{color.feedback.danger.fgSubtle}` |

The full list lives in
`tokens/component/label.json`.

## Accessibility

- Use `tag="label"` (default) and pair via `for`/`id` so screen-readers
  announce the label when the input is focused.
- The `*` required indicator is decorative — also pass `required` /
  `aria-required` on the input itself.
- When a label is purely visual (e.g. a chip caption) prefer
  `tag="span"` so it does not register as a form label.

## Theming notes

- Theme-aware out of the box — switching `<html data-theme="…">`
  re-resolves the colors instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamField` — wraps an input + label and
  drives the float animation.
- `OrigamTitle` — semantic heading element.
