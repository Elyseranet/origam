# OrigamColorPickerSwatches

`<OrigamColorPickerSwatches>` is the preset grid of
[`<OrigamColorPicker>`](/components/ColorPicker/OrigamColorPicker): a scrollable set of
colour tiles, one row per inner array, each tile a real `<button>` that
commits its colour on click.

Fully controlled: it holds no colour and reports through
`update:colorHsv`.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const hsv = ref({ h: 210, s: 0.7, v: 0.8, a: 1 })
const swatches = [
  ['#F44336', '#E91E63', '#9C27B0'],
  ['#2196F3', '#03A9F4', '#00BCD4'],
  ['#4CAF50', '#8BC34A', '#CDDC39']
]
</script>

<template>
  <OrigamColorPickerSwatches
    v-model:color-hsv="hsv"
    :swatches="swatches"
    max-height="200"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `swatches` | `Array<Array<TColorType>>` | — | **No default.** A grid: the outer array is rows, the inner one tiles. With `swatches` unset the component renders an empty box — neither this component nor `<OrigamColorPicker>` ships a built-in palette. |
| `colorHsv` | `THSVA \| null` | — | The current colour. A tile whose HSVA deep-equals it is marked selected (`aria-pressed`, check icon). |
| `disabled` | `boolean` | — | Disables every tile button **and** short-circuits the click handler, so no `update:colorHsv` is emitted. |

### Dimensions (`IDimensionProps`)

| Prop | Type | Default |
|---|---|---|
| `maxHeight` | `number \| string` | `150` |
| `height` / `width` / `minHeight` / `minWidth` / `maxWidth` | `number \| string` | — |

All six go through `useDimension(props)` and land as inline styles on the
root. `maxHeight` is what makes the grid scroll rather than grow.

Plus `ICommonsComponentProps` (`id`, `class`, `style`).

> ⛔ `IColorPickerSwatchesProps` has **no** `ariaLabel` prop, unlike
> Canvas, Preview and Edit. Each tile names itself from the
> `origam.color_picker.swatches.aria_label` locale key with its own CSS
> colour string.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:colorHsv` | `THSVA` | Fired when a tile is clicked, carrying that tile's colour converted to HSVA. Suppressed while `disabled`. |

Use it as `v-model:color-hsv`.

## Slots

None. `IColorPickerSwatchesSlots` is empty.

## Colour values

Tiles are typed `TColorType` (`string | number | THSVA | TRGBA |
THSLA`), and each value goes through `parseColor` → `RGBtoHSV` before it
is emitted, so hex strings, numbers and object forms all work. In
practice consumers pass hex strings or RGBA objects.

## Accessibility

- Each tile is a `<button type="button">`, not a clickable `<div>`: it is
  in the tab order, activates on `Enter` / `Space`, and carries a real
  disabled state.
- `aria-pressed` reflects selection; the check icon is `aria-hidden` so it
  is not announced twice.
- The check icon's colour is chosen by contrast ratio against white, so
  it stays visible on both light and dark tiles.

## Anatomy

```html
<div class="origam-color-picker-swatches">
    <div class="origam-color-picker-swatches__swatch">        <!-- one per row -->
        <button class="origam-color-picker-swatches__color" aria-pressed="…">
            <div style="background-color: …">
                <OrigamIcon />                                 <!-- when selected -->
            </div>
        </button>
    </div>
</div>
```

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-color-picker__swatches__color---border-radius` | `2px` | Tile corner radius. |

## Related

- `OrigamColorPicker` — the composed picker (`showSwatches` /
  `swatchesMaxHeight` reach this sub-component).
- `OrigamColorPickerCanvas` — the saturation / value gradient.
- `OrigamColorPickerPreview` — hue and alpha sliders.
- `OrigamColorPickerEdit` — numeric / hex inputs.
