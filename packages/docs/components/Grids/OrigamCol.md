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

`cols` sets the base width. `sm` / `md` / `lg` / `xl` / `xxl` override
`cols` from each breakpoint up, and accept the same three shapes:

| Value | Emitted class | Flex behaviour |
|---|---|---|
| `'1'` … `'12'` | `.origam-col--{n}` | fixed `flex-basis` / `max-width` of `n/12` of the row |
| `'auto'` | `.origam-col--auto` | shrink-wraps its content — `flex-grow: 0`, `flex-basis: auto`, `width: auto` |
| `true` | `.origam-col--true` | grows to fill the remaining space — `flex-grow: 1`, `flex-basis: 0` |

> ⛔ `true` was documented as *"grow-as-needed"* long before it worked.
> The component pushed `origam-col--true` and **no SCSS rule matched it**,
> so the value was a total visual no-op — including on the five
> per-breakpoint props. The rules (`&--true` and `&--{bp}-true`) were
> added on 2026-09-07 under #550 (C7), mirroring the shape of the
> existing `auto` rules.

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

⛔ **The accepted range is `'1'` to `'11'` only** — narrower than `cols`.
The SCSS loop that emits `.origam-col--offset-{n}` is guarded with
`@if ($size != 12)`, and there is no offset counterpart to `'auto'` or
`true`. Those three values type-check but produce a class no rule
matches, i.e. no offset at all.

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
| `--origam-col---padding-block-start` | half the row's gutter (`12px` by default) |
| `--origam-col---padding-block-end` | half the row's gutter (`12px` by default) |
| `--origam-col---padding-inline-start` | half the row's gutter (`12px` by default) |
| `--origam-col---padding-inline-end` | half the row's gutter (`12px` by default) |
| `--origam-col---margin-block-start` | `0` |
| `--origam-col---margin-block-end` | `0` |
| `--origam-col---margin-inline-start` | `0` |
| `--origam-col---margin-inline-end` | `0` |
| `--origam-col---background-color` | `transparent` |
| `--origam-col---color` | `#000` (hardcoded hex in the component's local `:root` block, not sourced from a token yet — separate issue, see `col.json`) |

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

## Gutter — where the padding comes from

A column's padding is **half of its row's gutter**. `<OrigamRow>` declares
the four `--origam-col---padding-*` variables on itself from
`--origam-row---gutter`; they inherit down to every `<OrigamCol>` inside.
The column therefore follows its row automatically — there is no `gutters`
prop to repeat on the column, and no prop drilling.

```html
<origam-row gutters="dense">
    <origam-col cols="6">4px of padding, because the row's gutter is 8px</origam-col>
    <origam-col cols="6">idem</origam-col>
</origam-row>
```

A column rendered **outside** a row falls back to the `:root` value
(`12px`). To override one column on its own, use the `padding` prop — it
emits at a level that wins over the inherited variable. The full model is
documented under **Gutters** in the `OrigamRow` reference.
