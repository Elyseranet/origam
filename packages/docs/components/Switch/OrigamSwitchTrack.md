# OrigamSwitchTrack

`<OrigamSwitchTrack>` is the rounded rail that sits behind an
`<OrigamSwitch>`'s thumb. It owns the switch's **visible surface** —
background, border, corner radius, elevation, the `inset` variant and the
disabled / readonly / error states — and exposes slots for content shown
on the ON and OFF halves of the rail.

It is a sub-component: `<OrigamSwitch>` renders it and forwards its own
`border` / `rounded` / `elevation` / `bgColor` values down to it. You can
also use it standalone as a decorative rail, or as the building block of
a custom toggle.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const on = ref(true)
</script>

<template>
  <OrigamSwitchTrack :model-value="on" bg-color="primary" @click="on = !on" />
</template>
```

## Props

### Surface

| Prop | Type | Default | Description |
|---|---|---|---|
| `bgColor` | `TColor` | — | Paints the rail. Ignored while `disabled` or `error` is truthy, so the token-driven states of those two always win. |
| `color` | `TColor` | — | **Not painted by this component.** Forwarded into the slot payload so slot content can react to the switch's foreground intent — see [Color contract](#color-contract). |
| `border` | `IBorderProps['border']` | — | `true`, a width, or a full `"2px dashed red"` string. |
| `rounded` | `IRoundedProps['rounded']` | — | Utility rung (`xs · sm · md · lg · xl · full · none`) or a legacy named variant. Overrides the default pill shape. |
| `elevation` | `IElevationProps['elevation']` | — | An origam shadow rung (`xs · sm · md · lg · xl`) or a Material-style `0..24` number. |
| `inset` | `boolean` | `false` | Material inset variant — taller, wider rail (`32 × 52` instead of `24 × 44`). |

### State

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | Whether the switch is ON. Drives the `--dirty` modifier, which swaps which half-label is visible. **Read-only here** — the track never writes it back (see Emits). |
| `disabled` | `boolean` | `false` | Applies the muted opacity token and the default cursor; suppresses `click`. |
| `readonly` | `boolean` | `false` | Keeps the appearance but drops pointer events; suppresses `click`. |
| `error` | `string \| boolean` | `false` | Error state — repaints the rail with the danger tokens. Typed `string \| boolean` (same shape as `IValidationProps.error`) so a parent forwarding its own validation surface stays type-compatible; consumed by truthiness only. |
| `isValid` | `boolean \| null` | `null` | Validation state forwarded from the surrounding `<OrigamInput>`. Not styled directly — it is passed through to the slots. |

Plus `ICommonsComponentProps` (`id`, `class`, `style`).

## Emits

| Event | Payload | Description |
|---|---|---|
| `click` | `MouseEvent` | Fired on rail click, **after** `stopPropagation()` and `preventDefault()`. Nothing happens while `disabled` or `readonly`. |

> ⛔ `ISwitchTrackEmits` deliberately does **not** extend
> `ICommonsComponentEmits`: this component never emits
> `update:modelValue`. `modelValue` is a plain display prop here — there
> is no `useVModel`, no write back. The parent decides what a click means
> (`<OrigamSwitch>` forwards it to the hidden `<input>`). A listener bound
> as `@update:model-value` on `<OrigamSwitchTrack>` now flows through
> `$attrs` instead of being swallowed by a declaration that lied about
> firing it.

## Slots

All three receive the same payload: `{ color, model, isValid }`.

| Slot | Description |
|---|---|
| `track.true` | Content on the ON half of the rail. Rendered only when the slot is provided; faded out (`opacity: 0`) while the track is OFF. |
| `track.false` | Content on the OFF half. Faded out while the track is ON. |
| `overlay` | Free-form layer rendered after both half-labels, inside the rail. `<OrigamSwitch>` uses it to host a linear progress bar when `loading = { type: 'line' }`; consumers can put any absolutely-positioned decoration there (gradient sweep, an "ON" caption, …) without subclassing. |

```vue
<template>
  <OrigamSwitchTrack :model-value="on">
    <template #track.true><OrigamIcon icon="mdi-check" /></template>
    <template #track.false><OrigamIcon icon="mdi-close" /></template>
  </OrigamSwitchTrack>
</template>
```

## Color contract

The two colour channels are strictly separated, and this is the single
most common source of surprise:

| Prop | Paints |
|---|---|
| `bgColor` | the rail — this component's own background |
| `color` | **nothing here.** The foreground (thumb, label) is painted by the surrounding `<OrigamSelectionControl>` via `currentColor`. |

`color` is nevertheless accepted and forwarded into the slot payload, so
slot content can pick it up:

```vue
<template>
  <OrigamSwitchTrack :model-value="true" color="success" bg-color="success">
    <template #track.true="{ color }">
      <OrigamIcon icon="mdi-check" :color="color" />
    </template>
  </OrigamSwitchTrack>
</template>
```

Used standalone with `color` but no slot reading it, the prop has no
observable effect. That is by design, not an oversight.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-switch__track---width` | `44px` | Rail min-width. |
| `--origam-switch__track---height` | `24px` | Rail height. |
| `--origam-switch__track--inset---width` | *(undeclared, falls back to `52px`)* | Rail min-width under `inset`. |
| `--origam-switch__track--inset---height` | *(undeclared, falls back to `32px`)* | Rail height under `inset`. |
| `--origam-switch__track---border-radius` | `radius.full` | Corner radius (the `rounded` prop overrides it inline). |
| `--origam-switch__track---background-color` | `color.surface.disabled` | Rail background. |
| `--origam-switch__track---background-color-disabled` | `color.surface.disabled` | Rail background when ON and disabled. |
| `--origam-switch__track---background-color-error` | `color.feedback.danger.bg` | Rail background in the error state. |
| `--origam-switch__track---color-error` | `color.feedback.danger.fg` | Rail foreground in the error state. |
| `--origam-switch__track---backdrop-filter` | `none` | Rail backdrop filter. |
| `--origam-switch---transition-duration` | `motion.duration.medium` | Background transition duration. |
| `--origam-switch---transition-timing-function` | `motion.easing.standard` | Background transition easing. |
| `--origam-switch---opacity-disabled` | `opacity.32` | Rail opacity while disabled. |

> `--origam-switch__track---background-color-checked`,
> `---border-color` and `---border-width` are declared in `light.css` but
> no rule reads them; the ON colour arrives through the `bgColor`
> channel, and the border through the `border` prop.

## Behaviour

- **Motion** — the background transition is suppressed under
  `@media (prefers-reduced-motion: reduce)`.
- **Forced colors** — under `forced-colors: active` the rail draws a
  1px system border (2px when `inset`), drops its transition, and paints
  `highlight` when ON.
- **Click handling** — the handler calls `stopPropagation()` **and**
  `preventDefault()` before emitting. Without it the click both bubbled
  to the underlying `SelectionControl` *and* triggered the parent's
  manual `.click()` forward, toggling twice and so swallowing every other
  click.

## Accessibility

`<OrigamSwitchTrack>` renders a plain `<div>` and carries **no** ARIA
role, no `tabindex` and no keyboard handling — it is a painted surface,
not a control. Inside `<OrigamSwitch>` the accessible control is the
hidden native `<input type="checkbox">`, which is what receives focus and
keyboard input.

If you use the track standalone as an interactive element, you must
supply the semantics yourself (a real `<button>` / `<input>` wrapper is
strongly preferred over ARIA on the `<div>`).

## Related

- `OrigamSwitch` — the full control this track is the surface of.
