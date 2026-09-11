# OrigamSliderField

`<OrigamSliderField>` is a range slider built on the native HTML
`<input type="range">`. It supports single value and range (two-thumb)
mode, horizontal and vertical orientation, ticks, and step precision.

As of Phase 2 (2026-05) the component is a superset of the legacy
`<OrigamMediaScrubber>` — see [Variants](#variants) below for the
`field` / `timer` / `audio` rendering paths and the new
`buffered` / `peaks` / `showHoverTooltip` props.

> **Architecture note (Phase 1 — 2026-05).** The component was rewritten
> on top of the native range input. Drag, keyboard navigation, focus and
> a11y are now owned by the browser. The legacy JS drag pipeline
> (`useSlider`, `getSliderFieldOffset`, the standalone
> `OrigamSliderFieldThumb` component) was removed.
>
> **Breaking changes:**
> - `thumb.label`, `thumb.labelStart`, `thumb.labelStop` slots — REMOVED.
>   Native range thumbs cannot host arbitrary HTML. The
>   `showHoverTooltip` prop (Phase 2) covers the common use case.
> - `<OrigamSliderFieldThumb>` component — REMOVED. It's no longer
>   exported.
> - `useSlider` composable — REMOVED. `useSteps` stays.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const volume = ref(50)
</script>

<template>
  <OrigamSliderField v-model="volume" label="Volume" :min="0" :max="100" />
</template>
```

## Range (two-thumb)

```vue
<script setup lang="ts">
import { ref } from 'vue'
const range = ref([20, 80])
</script>

<template>
  <OrigamSliderField v-model="range" range label="Price range" :min="0" :max="200" />
</template>
```

## Step

```vue
<template>
  <OrigamSliderField label="Step 10" :step="10" :min="0" :max="100" />
</template>
```

## Ticks

```vue
<template>
  <OrigamSliderField label="With ticks" show-ticks :step="25" :min="0" :max="100" />
</template>
```

## Vertical orientation

```vue
<template>
  <OrigamSliderField label="Vertical" direction="vertical" :min="0" :max="100" style="height: 200px" />
</template>
```

Vertical orientation uses `writing-mode: vertical-lr` on the native
input (modern path) with a `-webkit-appearance: slider-vertical;` and
Firefox `orient="vertical"` attribute fallback.

## Reverse

```vue
<template>
  <OrigamSliderField label="Reversed" reverse :min="0" :max="100" />
</template>
```

## Color

```vue
<template>
  <OrigamSliderField color="primary" label="Primary" :min="0" :max="100" />
  <OrigamSliderField color="success" label="Success" :min="0" :max="100" />
</template>
```

`color` paints the fill + thumb surface. `bgColor` paints the rail.
When `error` is on, both channels are forced to `danger` (override
convention shared with Input/Form/Snackbar).

## States (disabled / readonly / error)

```vue
<template>
  <OrigamSliderField label="Disabled" disabled :model-value="40" />
  <OrigamSliderField label="Readonly" readonly :model-value="60" />
  <OrigamSliderField label="Error"    :error="true" :model-value="10" />
</template>
```

## Variants

The `variant` prop drives three rendering paths.

### `variant="field"` (default)

The form-grade slider. Wrapped in `<origam-input>` (label, messages,
prepend/append). Used by `OrigamColorPickerPreview`, settings panels,
any slider that needs label + validation chrome. `buffered` / `peaks`
are accepted but ignored visually for backwards compatibility.

```vue
<OrigamSliderField v-model="value" label="Volume" color="primary" :min="0" :max="100" />
```

### `variant="timer"`

The bare media-scrubber look. No `<origam-input>` wrapper, no label,
no messages, no prepend/append. Hairline rail (2 px at rest, 4 px on
hover/focus). The thumb is hidden until hover / focus / drag
(`showThumbOnHoverOnly` is implied). Mirrors the YouTube /
HTMLMediaElement scrubber UX.

```vue
<OrigamSliderField
  v-model="currentTime"
  variant="timer"
  :buffered="bufferedTime"
  show-hover-tooltip
  :format-hover-tooltip="formatTime"
  :max="duration"
  label="Playback timeline"
/>
```

### `variant="audio"`

Same as `timer`, plus a waveform background painted from `peaks` via
inline SVG. Bars left of the thumb use the active color; bars right
use a 35 %-mixed fade so the played-vs-remaining split reads
instantly. The track area defaults to 48 px tall to give the bars
breathing room.

```vue
<OrigamSliderField
  v-model="currentTime"
  variant="audio"
  :peaks="waveformPeaks"
  :buffered="bufferedTime"
  show-hover-tooltip
  :format-hover-tooltip="formatTime"
  :max="duration"
  label="Waveform"
/>
```

## Props

### Common props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `number \| number[]` | `0` | Bound value. Array for `range`. |
| `min` | `number \| string` | `0` | Minimum bound. |
| `max` | `number \| string` | `100` | Maximum bound. |
| `step` | `number \| string` | `0` | Step increment. `0` = continuous (browser `'any'`). |
| `range` | `boolean` | `false` | Two-thumb mode. `modelValue` becomes `[start, stop]`. |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation. |
| `reverse` | `boolean` | `false` | Inverts the start direction. |
| `disabled` | `boolean` | `false` | Disable interaction + dim visuals. |
| `readonly` | `boolean` | `false` | Lock value but keep visuals normal. |
| `error` | `boolean` | `false` | Force `danger` intent on both color channels. |
| `label` | `string` | — | Prepended label text. |
| `density` | `enum` | `'default'` | Vertical density (inherited from `OrigamInput`). |
| `color` | `TIntent` | — | Paints fill + thumb surface. |
| `bgColor` | `TIntent` | — | Paints the rail. |
| `rounded` | `boolean \| number \| string \| TRounded` | — | Corner-radius selector for the rail + the `buffered` fill. Forwarded to the track sub-component (unless overridden by `trackProps.rounded`); falls back to `--origam-slider-field---border-radius` when unset. See [Design tokens](#design-tokens). |
| `showTicks` | `boolean \| 'always'` | `false` | Render tick marks on the track. |
| `ticks` | `Array<number> \| Record<string, string>` | — | Custom tick values / labels. |
| `tickSize` | `number \| string` | `2` | Tick dot size. |
| `inset` | `boolean` | `false` | Compact style — thumb inside the track. |
| `trackProps` | `ISliderFieldTrackProps` | — | Visual props forwarded to the track. Its own `rounded` (when set) takes priority over the top-level `rounded` prop. |

### Variant & media-scrubber props (Phase 2)

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'field' \| 'timer' \| 'audio'` | `'field'` | Visual variant. See [Variants](#variants). |
| `buffered` | `number` | — | Secondary fill from `min` to `buffered`, layered behind the active fill at reduced opacity. Mirrors a media player's "loaded ranges" indicator. |
| `showThumbOnHoverOnly` | `boolean` | `false` | Hide the thumb at rest, reveal on container `:hover`, `:focus-within`, and during drag. CSS-only. `timer`/`audio` force this on. |
| `showHoverTooltip` | `boolean` | `false` | Render a small floating tooltip above the rail showing the value under the cursor. RAF-throttled. |
| `formatHoverTooltip` | `(value: number) => string` | `(v) => String(v)` | Formatter for the tooltip text. Receives the hovered value clamped to `[min, max]`. |
| `peaks` | `ReadonlyArray<number>` | — | Waveform peaks (each in `[0, 1]`). Painted as vertical SVG bars behind the track when `variant='audio'`. No effect for other variants. |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number \| number[]` | Value changed (on input). |
| `start` | `number \| number[]` | Pointer pressed on a thumb. |
| `end` | `number \| number[]` | Pointer released on a thumb. |
| `focus` | — | A thumb received focus. |
| `blur` | — | A thumb lost focus. |
| `update:focused` | `boolean` | Aggregate focus flag. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Inside the input wrapper. |
| `label` | — | Custom label area. |
| `prepend` | — | Prefix area (icon, …). |
| `append` | — | Suffix area. |
| `details` | — | Details area below the field. |
| `messages` | `{ hasMessages, messages }` | Full messages slot override. |
| `message` | `{ message }` | Per-message override. |
| `item` | `{ tick, index }` | Per-tick label override. |
| `item.{index}` | `{ tick, index }` | Per-tick label by index. |

### Removed in Phase 1

- `thumb.label`, `thumb.labelStart`, `thumb.labelStop` — Native range
  thumbs do not host arbitrary HTML.

## Accessibility

The native `<input type="range">` provides full a11y out of the box:
- Keyboard: Arrow keys (step), Home / End (bounds), PageUp / PageDown
  (10×).
- Screen-readers read `aria-valuenow / aria-valuemin / aria-valuemax`
  automatically.
- `aria-label` is bridged from the `label` prop. In range mode each
  thumb gets `"{label} (start)" / "{label} (end)"`.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-slider-field---border-radius` | `{radius.full}` (pill) | Themeable default corner radius for the surfaces owned directly by `OrigamSliderField` (the `buffered` fill, and the inset/bare-variant rail overrides). Overridden inline whenever the `rounded` prop (or `trackProps.rounded`) is set. |
| `--origam-slider-field---track-size` | `14px` (horizontal) / `2px` (vertical) | Track thickness. |
| `--origam-slider-field---thumb-size` | `20px` | Thumb diameter. |
| `--origam-slider-field-track__tick---size` | `2px` | Tick dot size. |
| `--origam-slider-field--bare---track-thickness` | `2px` | Hairline rail thickness at rest (`timer` / `audio`). |
| `--origam-slider-field--bare---track-thickness-active` | `4px` | Rail thickness on hover/focus/scrub (`timer` / `audio`). |
| `--origam-slider-field--bare---thumb-size` | `12px` | Thumb diameter for `timer` / `audio` variants. |
| `--origam-slider-field--bare---accent-color` | `var(--origam-color__action--primary---bg)` | Default accent (left of thumb fill, thumb body, waveform active bars). |
| `--origam-slider-field--audio---track-height` | `48px` | Vertical room reserved for the waveform bars (`variant='audio'`). |
| `--origam-slider-field__buffered---background-color` | `color-mix(in srgb, currentColor 40%, transparent)` | Buffered-fill colour. |
| `--origam-slider-field__buffered---opacity` | `0.5` | Buffered-fill opacity (`variant='field'`). |
| `--origam-slider-field__hover-tooltip---background-color` | `var(--origam-color__surface--inverse---bg, rgba(0,0,0,0.85))` | Hover tooltip background. |
| `--origam-slider-field__hover-tooltip---color` | `var(--origam-color__on--inverse---fg, #ffffff)` | Hover tooltip text colour. |
