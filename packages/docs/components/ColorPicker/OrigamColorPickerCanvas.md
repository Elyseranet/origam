# OrigamColorPickerCanvas

`<OrigamColorPickerCanvas>` is the 2-D saturation / value gradient of
[`<OrigamColorPicker>`](./OrigamColorPicker.md): a `<canvas>` painted for
the current hue, plus a draggable dot. Mouse, touch and keyboard all
write back through a single `update:colorHsv` channel.

It is a controlled component — it holds no colour of its own.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const hsv = ref({ h: 210, s: 0.7, v: 0.8, a: 1 })
</script>

<template>
  <OrigamColorPickerCanvas v-model:color-hsv="hsv" :dot-size="10" />
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `colorHsv` | `THSVA \| null` | — | The current colour (`{ h, s, v, a }`). `null` renders the gradient with no dot; interacting still commits a colour, starting from `COLOR_NULL`. |
| `disabled` | `boolean` | — | Blocks pointer and keyboard input, sets `aria-disabled`, and switches the dot to its muted shadow. |
| `dotSize` | `string \| number` | *(unset — the stylesheet's `15px` applies)* | Diameter of the position dot. Written as inline `width` / `height`, and the dot's translate is offset by half of it so it stays centred. `<OrigamColorPicker>` passes `10`. |
| `ariaLabel` | `string` | `t('origam.color_picker.canvas.aria_label')` | Accessible name of the canvas region. |

### Dimensions (`IDimensionProps`)

| Prop | Type | Default |
|---|---|---|
| `height` | `number \| string` | `150` |
| `width` | `number \| string` | `'100%'` |
| `minHeight` / `minWidth` / `maxHeight` / `maxWidth` | `number \| string` | — |

All six go through `useDimension(props)` and land as inline styles on the
root, so any CSS length, number (→ px) or custom-property reference works.

Plus `ICommonsComponentProps` (`id`, `class`, `style`).

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:colorHsv` | `THSVA` | Fired on drag, click and every handled key. Hue and alpha are carried over from the incoming `colorHsv` (or `0` / `1` when it is `null`); only `s` and `v` change. |

Use it as `v-model:color-hsv`.

## Slots

None. `IColorPickerCanvasSlots` is empty.

## Keyboard

The root is `role="application"` with `tabindex="0"` and a live
`aria-valuetext`, so it is reachable and announced.

| Key | Effect |
|---|---|
| `←` / `→` | Saturation −/+ one step |
| `↑` / `↓` | Value +/− one step |
| `Home` / `End` | Saturation to `0` / `1` |
| `PageUp` / `PageDown` | Value to `1` / `0` |

The step is `0.01`, or `0.05` with `Shift` held. Handled keys call
`preventDefault()`; anything else falls through untouched.

A canvas with **no** colour yet (an empty `<OrigamColorPickerField>`
opens in exactly that state) still answers the keyboard: it starts from
`COLOR_NULL` rather than bailing out, which is what a mouse click on the
same surface already did.

## Behaviour

- The canvas is repainted whenever the hue changes, and re-measured
  through `useResizeObserver` when the element is resized — the dot
  position is recomputed from the new box.
- `touch-action: none` + a passive `touchstart` listener: dragging on
  touch does not scroll the page.
- The drag listeners are attached to `window` on mousedown/touchstart and
  removed on mouseup/touchend, so a drag that leaves the canvas keeps
  tracking.
- `contain: content` and `will-change: transform` on hover keep the dot's
  movement off the main paint path.
- `:focus-visible` draws a 2px outline from
  `var(--origam-color__border---focus)`.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-color-picker__canvas__dot---border-radius` | `50%` | Dot shape. |
| `--origam-color-picker__canvas__dot---box-shadow` | white ring + inner dark hairline | Dot ring — what makes it readable over any colour. |
| `--origam-color__border---focus` | semantic token | Focus outline colour. |

## Related

- `OrigamColorPicker` — the composed picker.
- `OrigamColorPickerPreview` — hue and alpha sliders.
- `OrigamColorPickerEdit` — numeric / hex inputs.
- `OrigamColorPickerSwatches` — the preset grid.
