# OrigamAudioWaveform

Peak bars painted behind an audio scrubber.

```vue
<origam-audio-waveform
    :peaks="[0.2, 0.8, 0.5, 1, 0.3]"
    :progress="40"
/>
```

## Why it exists

It used to live inside `OrigamSliderField`, as an inline `<svg>` in the
component's *second* template branch.

That mattered more than it sounds. `OrigamSliderField` carried **two whole
HTML branches** — `v-if="isFieldVariant"` rendering an `<origam-input>`,
`v-else` rendering a bare `<section>` — across a 421-line template. Every
other element (track, input, thumb, `item` slot, buffered, hover tooltip)
was duplicated identically between them. This waveform was the **only**
markup the second branch actually owned, and it is audio-specific by
nature: a form slider has no waveform.

Extracting it is the first step in collapsing those two branches into one.

## Design

The component is deliberately dumb. It owns **no audio state**, reads no
media element, and has no notion of "current time". It draws bars and
colours them against a percentage its parent computes. That keeps it usable
anywhere a waveform is wanted, not just inside a scrubber.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `peaks` | `readonly number[]` | `[]` | Peak amplitudes, each expected in `[0..1]`. Values outside the range are clamped; non-finite values become `0` — a waveform is decorative and must never throw on malformed input. An **empty array renders nothing at all**, leaving no empty `<svg>` in the DOM. |
| `progress` | `number` | `0` | Playback position as a percentage in `[0..100]`. Bars at or before it are `--active`, the rest `--inactive`. |

`id`, `class` and `style` come from `ICommonsComponentProps`.

> `class` and `style` are **not** bound in the template. Vue merges them
> automatically onto a single root, and `class` is a reserved JavaScript
> word the template parser rejects inside an expression
> (`vue/no-parsing-error`). Declaring them on the interface is enough.

## Accessibility

The root `<svg>` is `aria-hidden="true"`. A waveform conveys no information
a screen-reader user can act on — the scrubber that owns it carries the
accessible value, label and keyboard interaction. Announcing the decoration
as well would be noise.

## Styling

| Class | Role |
|---|---|
| `.origam-audio-waveform` | Root. Absolutely positioned, `inset: 0`, `pointer-events: none` — it never intercepts a click meant for the scrubber underneath. |
| `.origam-audio-waveform__bar--active` | `fill: currentColor` |
| `.origam-audio-waveform__bar--inactive` | `fill: color-mix(in srgb, currentColor 35%, transparent)` |

Both fills derive from `currentColor`, so the waveform follows whatever
colour its parent paints — no dedicated token to keep in sync.

## Example — inside a scrubber

```vue
<template>
    <div class="scrubber">
        <origam-audio-waveform
            :peaks="peaks"
            :progress="percent"
        />
        <origam-slider-field
            v-model="currentTime"
            variant="audio"
            :max="duration"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'

    const currentTime = ref(0)
    const duration = ref(180)
    const peaks = ref([0.2, 0.8, 0.5, 1, 0.3, 0.6])

    const percent = computed(() => (currentTime.value / duration.value) * 100)
</script>
```
