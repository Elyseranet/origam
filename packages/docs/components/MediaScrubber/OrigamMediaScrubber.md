# OrigamMediaScrubber

`<OrigamMediaScrubber>` is the headless, media-agnostic "value on a track"
primitive: a `role="slider"` widget with a full pointer-drag, keyboard and
ARIA pipeline, and **no state of its own**. The parent owns `modelValue` and
listens to `update:modelValue`.

It is used twice inside the design system — as the timeline of
`<OrigamMediaController>` and as the (vertical) level slider of
`<OrigamMediaVolumeControl>` — which is the whole point: one drag/keyboard
implementation instead of the `<input type="range">` + `rotate(-90deg)` hack.

## Basic usage

```vue
<template>
    <OrigamMediaScrubber
        v-model="position"
        :min="0"
        :max="duration"
        aria-label="Playback position"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const position = ref(0)
    const duration = ref(180)
</script>
```

## Orientation

Horizontal is the YouTube-timeline shape; vertical is the volume / level-meter
shape, where the **top** of the track is `max` and the bottom is `min`.

The component sizes itself off its parent — `width: 100%` when horizontal,
`height: 100%` when vertical. A vertical instance in an unbounded wrapper
collapses to zero height and becomes invisible, so give it a bounded height.

```vue
<template>
    <div style="height: 160px">
        <OrigamMediaScrubber
            v-model="level"
            :min="0"
            :max="100"
            orientation="vertical"
            aria-label="Volume"
        />
    </div>
</template>
```

## Buffered channel

`buffered` paints a second bar from `min` up to the buffered position — the
browser's media buffer, in the media use case. Pass `undefined` to hide it
entirely.

```vue
<template>
    <OrigamMediaScrubber
        v-model="position"
        :min="0"
        :max="200"
        :buffered="140"
        aria-label="Playback position"
    />
</template>
```

## Hover tooltip

`showHoverTooltip` reveals a tooltip above the cursor while it sits over the
track. It is **horizontal-only** — the vertical variant is too narrow to
anchor one cleanly; build your own outside the component if you need it.

```vue
<template>
    <OrigamMediaScrubber
        v-model="position"
        :min="0"
        :max="100"
        show-hover-tooltip
        :format-hover-tooltip="(v) => `${Math.round(v)}%`"
        aria-label="Playback position"
    />
</template>
```

## Props

### Value & range

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `number` | — (required) | Current value, clamped into `[min, max]`. Supports `v-model`. Never mutated internally. |
| `min` | `number` | `0` | Lower bound of the range. |
| `max` | `number` | — (required) | Upper bound. `max <= min` freezes the scrubber at the start. |
| `step` | `number` | `0` | Discrete step. `0` means continuous — pointer events emit the raw float. |
| `buffered` | `number \| undefined` | `undefined` | Optional buffered position. Renders the `__buffer` bar; `undefined` hides it. |

### Design

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `TMediaScrubberOrientation` (`'horizontal' \| 'vertical'`) | `'horizontal'` | Layout axis. |
| `color` | `TColor` | `undefined` | Paints the progress bar (track and buffer stay neutral by design). Tokenised values emit a utility class; custom values fall back to inline style. |
| `rounded` | `TRounded` | `undefined` | Track radius. Also accepts the per-corner `roundedTopLeft` / … variants via `IRoundedProps`. |
| `showThumbOnHoverOnly` | `boolean` | `false` | Hides the thumb at rest, reveals it on hover / focus / drag — the YouTube pattern. |
| `showHoverTooltip` | `boolean` | `false` | Shows a tooltip above the cursor. Horizontal only. |
| `formatHoverTooltip` | `(value: number) => string` | `value => String(value)` | Formatter for the default tooltip label. Overridden entirely by the `tooltip` slot. |

### Behaviour & a11y

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Drops `role`, sets `tabindex="-1"`, and turns pointer + keyboard into no-ops. |
| `ariaLabel` | `string` | `undefined` | Read by screen readers on focus. **Always pass a translated string.** |
| `ariaValueText` | `string` | `undefined` | Human-readable value (`"1:23"`, `"45 %"`) mapped to `aria-valuetext`. |
| `dataCy` | `string` | `'origam-media-scrubber'` | `data-cy` selector for the host. A parent-forwarded value **wins** over the literal fallback. |

`dataCy` is declared as a prop, which removes it from `$attrs` — the template
renders it explicitly. Both in-house parents forward one, so inside
`<OrigamMediaController>` / `<OrigamMediaVolumeControl>` the fallback is never
what renders: target the composed name (`origam-media-controller-scrubber`,
`origam-media-controller-volume`) in tests, not the bare literal.

## Emits

| Emit | Payload | When |
|---|---|---|
| `update:modelValue` | `number` | Live — during drag, on keyboard, and on click. |
| `change` | `number` | Commit — on `pointerup` / `pointercancel` after a drag, and on every keyboard change. |
| `dragstart` | — | `pointerdown` captured. |
| `dragend` | — | `pointerup` / `pointercancel`. |
| `hover` | `number \| null` | Hovered value on `pointermove`; `null` on `pointerleave`. |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `tooltip` | `{ value: number }` | Hover-tooltip body. Rendered only when `showHoverTooltip` is `true`, the orientation is horizontal, and the cursor is over the track. |

## Accessibility

The host carries the full slider contract: `role="slider"` (dropped when
disabled, so assistive tech is not invited to interact with a frozen widget),
`aria-orientation`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`,
`aria-valuetext`, `aria-label` and `aria-disabled`.

Keyboard, matching the WAI-ARIA Authoring Practices slider pattern:

| Key | Effect |
|---|---|
| `ArrowRight` / `ArrowLeft` | ±1 step — horizontal only |
| `ArrowUp` / `ArrowDown` | ±1 step — vertical only |
| `PageUp` / `PageDown` | ±10 % of the range |
| `Home` / `End` | Jump to `min` / `max` |

The step size is `step` when it is `> 0`, otherwise 5 % of the range.

### `aria-valuemax` reports the declared max, never the epsilon

The percentage math divides by `max - min`, which is floored by an internal
epsilon (`MEDIA_SCRUBBER_MIN_RANGE`) so an empty range paints `0%` rather than
`NaN%`. That floor is deliberately **not** shared with `aria-valuemax`, which
reports `Math.max(max, min)` — the value a consumer could recognise.

This matters because a frozen range is the *normal* mount state of a media
scrubber, not an error: `OrigamMediaController` feeds a `max` of `0` until
`state.duration` becomes finite. Folding the two quantities together leaked
`aria-valuemax="1e-7"` to assistive tech for the whole pre-`loadedmetadata`
window.

## Reduced motion

Track-thickness and thumb-scale transitions are disabled under
`prefers-reduced-motion: reduce`.

## Exposed

`defineExpose` surfaces `rootEl` (the host element), `isScrubbing` and
`hoverValue` for consumers that need to coordinate with an in-flight drag.
