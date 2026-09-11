# OrigamCol

`<OrigamCol>` is a 12-column flex grid item. It pairs with `<OrigamRow>` to
build responsive layouts and supports per-breakpoint widths, offsets and
ordering. Like every origam structural primitive, the rendered tag is
polymorphic (`tag` prop, defaults to `<div>`).

## Basic usage

```vue
<template>
    <OrigamRow>
        <OrigamCol cols="6">Half</OrigamCol>
        <OrigamCol cols="6">Half</OrigamCol>
    </OrigamRow>
</template>
```

## Cols & breakpoints

`cols` sets the base width (1 to 12, `'auto'`, or `true` for grow-as-needed).
`sm` / `md` / `lg` / `xl` / `xxl` override `cols` from each breakpoint up.

```vue
<template>
    <OrigamRow>
        <!-- 12 columns on mobile, 6 on tablet, 4 on desktop -->
        <OrigamCol cols="12" md="6" lg="4">Card</OrigamCol>
        <OrigamCol cols="12" md="6" lg="4">Card</OrigamCol>
        <OrigamCol cols="12" md="6" lg="4">Card</OrigamCol>
    </OrigamRow>
</template>
```

| Breakpoint | Min width |
|---|---|
| `sm` | 600px |
| `md` | 960px |
| `lg` | 1280px |
| `xl` | 1920px |
| `xxl` | 2560px |

## Offset

Push a column away from the inline-start edge. Per-breakpoint variants
follow the same naming convention as `cols`.

```vue
<template>
    <OrigamRow>
        <OrigamCol cols="4" offset="2">offset by 2</OrigamCol>
        <OrigamCol cols="4" offset-md="4">offset by 4 from md</OrigamCol>
    </OrigamRow>
</template>
```

## Order

Reorder columns within their row without touching markup order.

```vue
<template>
    <OrigamRow>
        <OrigamCol cols="6" :order="2">Visually second</OrigamCol>
        <OrigamCol cols="6" :order="1">Visually first</OrigamCol>
    </OrigamRow>
</template>
```

## Align (self)

`align` sets `align-self` for this column only — overrides the row's
`align-items`. Per-breakpoint variants available.

```vue
<template>
    <OrigamRow align="start">
        <OrigamCol cols="6">Top-aligned</OrigamCol>
        <OrigamCol cols="6" align="center">Center-aligned</OrigamCol>
    </OrigamRow>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamCol tag="section" cols="6">Renders as a &lt;section&gt;</OrigamCol>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Column content. |

## Props (interface)

```ts
interface IColProps extends IColorProps, ICommonsComponentProps,
    ITagProps, IPaddingProps, IMarginProps, IBorderProps, IAlignProps {
    cols?:      TCols
    sm?:        TCols
    md?:        TCols
    lg?:        TCols
    xl?:        TCols
    xxl?:       TCols
    offset?:    Omit<TCols, '12'>
    offsetSm?:  Omit<TCols, '12'>
    offsetMd?:  Omit<TCols, '12'>
    offsetLg?:  Omit<TCols, '12'>
    offsetXl?:  Omit<TCols, '12'>
    offsetXxl?: Omit<TCols, '12'>
    order?:     number
    orderSm?:   number
    orderMd?:   number
    orderLg?:   number
    orderXl?:   number
    orderXxl?:  number
}

type TCols = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
           | '9' | '10' | '11' | '12' | 'auto' | true
```

## Anatomy

```html
<div class="origam-col origam-col--{cols} origam-col--{breakpoint}-{cols}
            origam-col--offset-{n} origam-col--align-{align}">
    <!-- default slot -->
</div>
```

## Design tokens consumed

`<OrigamCol>` is a structural primitive — it ships its widths via the
`flex-basis` / `max-width` / `padding` CSS variables. Override globally
or per-instance via a `:style` binding.

| CSS variable | Default |
|---|---|
| `--origam-col---width` | `100%` |
| `--origam-col---flex-grow` | `1` |
| `--origam-col---flex-shrink` | `0` |
| `--origam-col---flex-basis` | `0` |
| `--origam-col---max-width` | `100%` |
| `--origam-col---align-self` | `auto` |
| `--origam-col---box-sizing` | `border-box` |
| `--origam-col---padding-block-start` | `12px` |
| `--origam-col---padding-block-end` | `12px` |
| `--origam-col---padding-inline-start` | `12px` |
| `--origam-col---padding-inline-end` | `12px` |
| `--origam-col---margin-block-start` | `0` |
| `--origam-col---margin-block-end` | `0` |
| `--origam-col---margin-inline-start` | `0` |
| `--origam-col---margin-inline-end` | `0` |
| `--origam-col---background-color` | `transparent` |
| `--origam-col---color` | `currentColor` |

## Accessibility

- `<OrigamCol>` is purely structural — it adds no roles. Pick a meaningful
  `tag` (`section`, `article`, `aside`…) when the layout slot has a
  semantic meaning.
- Reordering with `order` does **not** change the DOM order: keep the
  source order accessible to screen readers and keyboard users.

## Theming notes

- The component is theme-aware. The colour fallbacks resolve through
  `useBothColor` and react to `<html data-theme="…">` switches.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamRow` — flex row container.
- `OrigamContainer` — outer wrapper with breakpoint-aware max-width.
- `OrigamSpacer` — flexible filler.
