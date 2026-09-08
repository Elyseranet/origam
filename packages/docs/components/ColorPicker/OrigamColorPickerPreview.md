# OrigamColorPickerPreview

`<OrigamColorPickerPreview>` is the strip under
[`<OrigamColorPicker>`](./OrigamColorPicker.md)'s canvas: a colour swatch,
a hue slider, an optional alpha slider, and — where the browser supports
it — an eye-dropper button that samples a colour from anywhere on screen.

Fully controlled: it reports every change through `update:colorHsv`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const hsv = ref({ h: 210, s: 0.7, v: 0.8, a: 1 })
</script>

<template>
  <OrigamColorPickerPreview v-model:color-hsv="hsv" />
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `colorHsv` | `THSVA \| null` | — | The current colour. `null` is treated as `COLOR_NULL` for rendering. |
| `disabled` | `boolean` | — | Disables both sliders and the eye-dropper button. |
| `hideAlpha` | `boolean` | — | Removes the alpha slider from the DOM (`v-if`). It also puts an `origam-color-picker-preview--hide-alpha` class on the root — no rule in the component targets it today; it is there as a consumer hook. |
| `ariaLabel` | `string` | `t('origam.color_picker.preview.eye_dropper_aria_label')` | Accessible name of the **eye-dropper button**, not of the strip. |

### Dimensions (`IDimensionProps`)

`height`, `width`, `minHeight`, `minWidth`, `maxHeight`, `maxWidth` — all
six go through `useDimension(props)` and land as inline styles on the
root. None has a default.

Plus `ICommonsComponentProps` (`id`, `class`, `style`).

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:colorHsv` | `THSVA` | Fired by the hue slider (`h` only), the alpha slider (`a` only), and the eye-dropper (`h`, `s`, `v` — the sampled colour's alpha is left untouched). |

Use it as `v-model:color-hsv`.

## Slots

None. `IColorPickerPreviewSlots` is empty.

## Eye-dropper

The button renders **only when the browser exposes the EyeDropper API**
(`SUPPORTS_EYE_DROPPER`, from `consts/Commons/commons.const.ts`). On
Firefox and Safari there is simply no button — plan your layout for both
cases.

- The sampled `sRGBHex` is parsed and converted to HSV; alpha is carried
  over from the current colour.
- The open call is passed an `AbortSignal`; the controller is aborted in
  `onUnmounted`, so a picker closed while the dropper is open does not
  leak a pending promise.
- A rejection (the user pressed `Escape`) is caught and reported through
  `consoleWarn` — it never throws into the consumer.

## Design tokens

The root publishes one custom property for its own children:

| CSS variable | Value | Description |
|---|---|---|
| `--origam-color-picker-color-hsv` | current colour at full opacity | Painted as the background of the alpha slider's track, so the alpha gradient runs from transparent to the *actual* current colour. Set inline by the component — read it, don't override it. |

## Anatomy

```html
<div class="origam-color-picker-preview">
    <div class="origam-color-picker-preview__eye-dropper">…</div>   <!-- if supported -->
    <div class="origam-color-picker-preview__dot">…</div>
    <div class="origam-color-picker-preview__sliders">
        <OrigamSliderField class="… origam-color-picker-preview__hue" />
        <OrigamSliderField class="… origam-color-picker-preview__alpha" />  <!-- unless hideAlpha -->
    </div>
</div>
```

## Related

- `OrigamColorPicker` — the composed picker.
- `OrigamColorPickerCanvas` — the saturation / value gradient.
- `OrigamColorPickerEdit` — numeric / hex inputs.
- `OrigamColorPickerSwatches` — the preset grid.
