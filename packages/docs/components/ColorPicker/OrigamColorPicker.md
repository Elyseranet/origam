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
| `modes` | `TColorModes[]` | all modes | Selectable colour modes |

## Swatches

```vue
<template>
    <OrigamColorPicker v-model="color" show-swatches :swatches-max-height="200" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `showSwatches` | `boolean` | `false` | Shows the swatches palette |
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
