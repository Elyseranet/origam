# OrigamColorPickerEdit

`<OrigamColorPickerEdit>` is the numeric / hexadecimal input row of
[`<OrigamColorPicker>`](./OrigamColorPicker.md). It renders one labelled
`<input>` per channel of the **active mode** (`R G B` for `rgb`, a single
field for `hex`, …) plus a button that cycles to the next enabled mode.

Like the other sub-components it is fully controlled: it stores nothing
and reports every change through `update:colorHsv` / `update:mode`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { COLOR_MODES_NAMES } from '@origam/enums'

const hsv  = ref({ h: 210, s: 0.7, v: 0.8, a: 1 })
const mode = ref(COLOR_MODES_NAMES.RGBA)
</script>

<template>
  <OrigamColorPickerEdit
    v-model:color-hsv="hsv"
    v-model:mode="mode"
    :modes="['rgb', 'hsl', 'hex']"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `colorHsv` | `THSVA \| null` | — | The current colour. `null` renders the inputs empty; editing one commits a colour starting from `COLOR_NULL`. |
| `mode` | `TColorModes` | `COLOR_MODES_NAMES.RGBA` | The active input mode. Must be one of `modes`, otherwise **no input row is rendered at all** (the lookup returns nothing and the list is empty). |
| `modes` | `Array<TColorModes>` | `['rgb', 'rgba', 'hsl', 'hsla', 'hex', 'hexa']` | Which modes the cycle button walks through, in order. |
| `disabled` | `boolean` | — | Forwarded to every input and to the cycle button. |
| `ariaLabel` | `string` | `t('origam.color_picker.edit.cycle_mode_aria_label')` | Accessible name of the **cycle-mode button**, not of the row. |

Plus `ICommonsComponentProps` (`id`, `class`, `style`).

> `IColorPickerEditProps` does **not** extend `IDimensionProps` — unlike
> Canvas, Preview and Swatches, this sub-component exposes no `height` /
> `width` surface. Size it from the outside.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:colorHsv` | `THSVA` | Fired on an input's native `change` (not `input`) — the value is parsed by the active mode's `getColor`, then converted back to HSVA by its `from`. |
| `update:mode` | `TColorModes` | Fired by the cycle button; advances to the next entry of `modes`, wrapping around. |

Both are `v-model`-shaped (`v-model:color-hsv`, `v-model:mode`).

## Slots

None. `IColorPickerEditSlots` is empty.

## Behaviour

- **The mode drives the inputs.** Each entry of `COLOR_PICKER_MODES`
  (`consts/ColorPicker/color-picker.const.ts`) supplies its shared
  `inputProps`, a list of per-channel inputs (`label`, `getValue`,
  `getColor`) and the `from` / `to` pair that converts between HSVA and
  that mode's own representation.
- **The cycle button is conditional**: it renders only when more than one
  mode is enabled. With `:modes="['hex']"` there is nothing to cycle to,
  so no button appears.
- **`change`, not `input`** — the value is committed when the field is
  left or `Enter` is pressed, so a half-typed hex string never repaints
  the picker.

## Anatomy

```html
<div class="origam-color-picker-edit">
    <div class="origam-color-picker-edit__field">
        <input class="origam-color-picker-edit__input">
        <span  class="origam-color-picker-edit__label">R</span>
    </div>
    <!-- one __field per channel of the active mode -->
    <!-- cycle-mode OrigamBtn, only when modes.length > 1 -->
</div>
```

## Related

- `OrigamColorPicker` — the composed picker.
- `OrigamColorPickerCanvas` — the saturation / value gradient.
- `OrigamColorPickerPreview` — hue and alpha sliders.
- `OrigamColorPickerSwatches` — the preset grid.
