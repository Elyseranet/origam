# OrigamColorPicker

`<OrigamColorPicker>` is a self-contained colour selection widget. It combines a saturation/brightness canvas, hue + alpha sliders, hex/rgb/hsl text inputs, and an optional swatches palette.

## Basic usage

```vue
<template>
    <OrigamColorPicker v-model="color" />
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#42a5f5')
</script>
```

## Canvas

The canvas provides two-dimensional saturation/brightness selection. Disable it when you only need the text input.

```vue
<template>
    <OrigamColorPicker v-model="color" hide-canvas />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `canvasHeight` | `string \| number` | `150` | Height of the canvas area |
| `canvasWidth` | `string \| number` | `'100%'` | Width of the canvas area |
| `dotSize` | `string \| number` | `10` | Diameter of the canvas position dot |
| `hideCanvas` | `boolean` | `false` | Hides the saturation/brightness canvas |

## Sliders and inputs

```vue
<template>
    <OrigamColorPicker v-model="color" hide-sliders />
    <OrigamColorPicker v-model="color" hide-inputs />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `hideSliders` | `boolean` | `false` | Hides hue and alpha sliders |
| `hideInputs` | `boolean` | `false` | Hides text inputs |

## Colour mode

Controls which colour model is shown in the edit fields.

```vue
<template>
    <OrigamColorPicker v-model="color" mode="hex" :modes="['hex', 'rgb', 'hsl']" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `TColorModes` | `'rgba'` | Active colour mode |
| `modes` | `TColorModes[]` | `['rgb', 'rgba', 'hsl', 'hsla', 'hex', 'hexa']` | Selectable colour modes, in cycle order. `COLOR_MODES_NAMES` has exactly these six members, so the default is the full set. |

## Swatches

⛔ `show-swatches` on its own renders an **empty** palette: there is no
built-in colour set anywhere in the picker. You must supply `swatches`.

```vue
<script setup>
const swatches = [
    ['#F44336', '#E91E63', '#9C27B0'],
    ['#2196F3', '#03A9F4', '#00BCD4'],
    ['#4CAF50', '#8BC34A', '#CDDC39']
]
</script>

<template>
    <OrigamColorPicker
        v-model="color"
        show-swatches
        :swatches="swatches"
        :swatches-max-height="200"
    />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `showSwatches` | `boolean` | `false` | Shows the swatches palette |
| `swatches` | `Array<Array<TColorType>>` | — | The palette itself: outer array = rows, inner = tiles. **No default** — without it the palette is empty. |
| `swatchesMaxHeight` | `string \| number` | `150` | Max-height of the swatches area |

## Slots

| Slot | Description |
|---|---|
| `title` | Content rendered above the picker (inside the Picker header area) |
| `header` | Full header region override |
| `default` | Replaces the entire picker body |
| `actions` | Footer actions area (e.g. confirm/cancel buttons) |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string \| Record<string, unknown> \| null` | Fired whenever the selected colour changes |
| `update:mode` | `TColorModes` | Fired when the user switches colour mode |

## Design tokens

| Token | Description |
|---|---|
| `--origam-color-picker-color-hsv` | Current HSV colour (auto-computed, read-only) |

## Sub-components

`<OrigamColorPicker>` composes four standalone controlled components.
Each has its own page with the full prop / emit surface — this page only
covers the props that reach them through the parent
(`canvasHeight`, `canvasWidth`, `dotSize`, `hideCanvas`, `hideSliders`,
`hideInputs`, `showSwatches`, `swatchesMaxHeight`, `mode`, `modes`).

| Component | Role |
|---|---|
| [`OrigamColorPickerCanvas`](./OrigamColorPickerCanvas.md) | 2-D saturation / value gradient, mouse + touch + keyboard. |
| [`OrigamColorPickerPreview`](./OrigamColorPickerPreview.md) | Colour swatch, hue and alpha sliders, eye-dropper. |
| [`OrigamColorPickerEdit`](./OrigamColorPickerEdit.md) | Per-channel numeric / hex inputs and the mode cycle button. |
| [`OrigamColorPickerSwatches`](./OrigamColorPickerSwatches.md) | Preset colour grid. |

All four are **controlled**: they store nothing and push every change up
the shared `update:colorHsv` channel (`IColorHsvEmits`), which the parent
converts back into `modelValue`.
