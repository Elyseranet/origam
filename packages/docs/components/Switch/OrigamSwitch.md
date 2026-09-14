# OrigamSwitch

`<OrigamSwitch>` is a toggle switch built on `<OrigamInput>` +
`<OrigamSelectionControl type="checkbox">`. It adds an inset track, a thumb,
and an optional `indeterminate` mode on top of the standard mixin set.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const enabled = ref(false)
</script>

<template>
  <OrigamSwitch v-model="enabled" label="Enable notifications" />
</template>
```

## Color

`OrigamSwitch` has **two independent colour axes**, and they paint two
different parts:

| prop | paints | token read |
|---|---|---|
| `color` | the **thumb** — the knob that slides | `--origam-color__…--{intent}---fg` |
| `bgColor` | the **track** — the surface underneath | `--origam-color__…--{intent}---bg` |

```vue
<template>
  <OrigamSwitch color="primary" label="Primary" :model-value="true" />
  <OrigamSwitch color="success" label="Success" :model-value="true" />
</template>
```

### ⛔ `bgColor` alone leaves the thumb white

This trap is silent: the prop is accepted, typed, and has no effect on
the thumb. Nothing warns you.

```vue
<template>
  <!-- track painted, thumb still white -->
  <OrigamSwitch bg-color="primary" :model-value="true" />

  <!-- thumb painted, track at its default grey -->
  <OrigamSwitch color="primary" :model-value="true" />

  <!-- ✅ both axes — the complete rendering -->
  <OrigamSwitch bg-color="primary" color="primary" :model-value="true" />
</template>
```

The rule is general, not specific to Switch: **`bgColor` paints a
surface, never the part resting on it.** The same holds for the
BottomNav active pill and the Checkbox tick. Making `bgColor` paint the
inner part too would require auto-contrast — picking `fg` against the
surface — and a static utility class cannot make that choice, since it
cannot know whether `fg` or `fgSubtle` suits a given surface.

See `IBgColorProps` in `interfaces/Commons/color.interface.ts` for the
canonical statement of this contract.

## Density

```vue
<template>
  <OrigamSwitch density="compact"     label="Compact" />
  <OrigamSwitch density="default"     label="Default" />
  <OrigamSwitch density="comfortable" label="Comfortable" />
</template>
```

## Inset

```vue
<template>
  <OrigamSwitch inset label="Inset track" />
</template>
```

## Border, rounded & elevation (visual surface)

`border` / `rounded` / `elevation` target the track — the visible rail —
so a themed switch can match the same border thickness / corner radius /
shadow rung as the rest of a theme's form fields (`origam-text-field`,
`origam-select`, …), matching the reference `props.components['origam-switch']`
block set on a marketing theme.

```vue
<template>
  <OrigamSwitch border rounded="lg" elevation="2" label="Themed track" />
</template>
```

- `border` accepts the same shapes as every other Commons `IBorderProps`
  consumer (`true` for the default thin border, a width, or a full
  `"2px dashed red"` string).
- `rounded` accepts a utility rung (`'xs'|'sm'|'md'|'lg'|'xl'|'full'|'none'`)
  or a legacy named variant — overrides the track's default fully-round
  pill shape.
- `elevation` accepts an origam shadow rung (`'xs'|'sm'|'md'|'lg'|'xl'`) or
  a Material-style `0..24` number, same as `OrigamBtn`/`OrigamCard`.

## Indeterminate

```vue
<template>
  <OrigamSwitch indeterminate label="Indeterminate" />
</template>
```

## States (disabled / readonly)

```vue
<template>
  <OrigamSwitch label="Disabled" disabled />
  <OrigamSwitch label="Readonly" readonly :model-value="true" />
</template>
```

## Slots

`ISwitchSlots` declares **three** slots, and the template renders exactly
those three:

| Slot | Scope | Description |
|------|-------|-------------|
| `track.true` | `{ color, model, isValid }` | Content shown on the ON half of the track. Forwarded verbatim to `<OrigamSwitchTrack>`'s own slot of the same name. |
| `track.false` | `{ color, model, isValid }` | Content shown on the OFF half of the track. Same forwarding. |
| `loader` | — | Replaces the circular `<OrigamProgress>` painted inside the thumb during an async toggle. Providing this slot is itself enough to render the thumb loader, even without a `loading` prop. |

```vue
<template>
  <OrigamSwitch v-model="on">
    <template #track.true><OrigamIcon icon="mdi-check" /></template>
    <template #track.false><OrigamIcon icon="mdi-close" /></template>
  </OrigamSwitch>
</template>
```

> ⛔ There is **no** `thumb` slot, no `label` slot and no `default` slot
> on `<OrigamSwitch>`. Earlier revisions of this page listed all three;
> they never existed. The thumb is a plain `<div>` rendered by the
> component with no slot outlet, the label is driven by the `label` prop
> (inherited from `ISelectionControlProps`), and the `default` slot the
> component passes to `<OrigamInput>` is its own internal wiring, not a
> consumer surface.

## Emits

`ISwitchEmits` = `ICommonsComponentEmits` + `IFocusEmits` +
`IIndeterminateEmits` + `IClickLabelEmits`:

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Fired on toggle. |
| `update:focused` | `any` | Focus state, via `useFocus` — the `focus` / `blur` events of the inner control are normalised into this single `v-model:focused` channel. |
| `update:indeterminate` | `boolean` | Companion channel for the three-state mode (`v-model:indeterminate`). Toggling the switch clears `indeterminate` and emits `false`. |
| `click:label` | `MouseEvent` | Fired when the user clicks the associated `<label>` rather than the track/thumb. |

> There are no separate `focus` / `blur` emits. Bind
> `v-model:focused` (or `@update:focused`) instead.

## Design tokens

The Switch's own surface is split between the track and the thumb, so
the variables are **BEM-child scoped** (`__track` / `__thumb`), not flat
`--origam-switch---*` names.

Every variable below is **read by a rule** in `OrigamSwitch.vue` or
`OrigamSwitchTrack.vue`; the defaults are the values declared in
`packages/ds/src/assets/css/tokens/light.css` (search `origam-switch`),
mirrored in `dark.css` and the `_*.scss` twins.

| CSS variable | Default | Description |
|---|---|---|
| `--origam-switch__track---width` | `44px` | Track min-width. |
| `--origam-switch__track---height` | `24px` | Track height. |
| `--origam-switch__track--inset---width` | *(undeclared, falls back to `52px`)* | Track min-width under `inset`. |
| `--origam-switch__track--inset---height` | *(undeclared, falls back to `32px`)* | Track height under `inset`. |
| `--origam-switch__track---border-radius` | `radius.full` | Track corner radius — overridden per instance by the `rounded` prop. |
| `--origam-switch__track---background-color` | `color.surface.disabled` | Track background. |
| `--origam-switch__track---background-color-disabled` | `color.surface.disabled` | Track background when ON **and** disabled. |
| `--origam-switch__track---background-color-error` | `color.feedback.danger.bg` | Track background in the error state. |
| `--origam-switch__track---color-error` | `color.feedback.danger.fg` | Track foreground in the error state. |
| `--origam-switch__track---backdrop-filter` | `none` | Track backdrop filter. |
| `--origam-switch__thumb---size` | `20px` | Thumb diameter. |
| `--origam-switch__thumb---background-color` | `color.surface.default` | Thumb fill. |
| `--origam-switch__thumb---color` | `currentColor` | Thumb foreground (icon inside the thumb). |
| `--origam-switch__thumb---border-color` | *(undeclared, falls back to `rgba(0,0,0,.18)`)* | Thumb outline. |
| `--origam-switch__thumb---border-radius` | `radius.full` | Thumb corner radius — the `rounded` prop overrides it inline so thumb and track never drift apart. |
| `--origam-switch__thumb---background-color-error` / `---color-error` | `color.feedback.danger.bg` / `.fg` | Thumb pair in the error state. |
| `--origam-switch__selection-control---min-height` | *(undeclared, falls back to `56px`)* | Row height of the wrapping selection control, before the density delta. |
| `--origam-switch__skeleton---width` / `---height` | *(undeclared, fall back to `52px` / `32px`)* | Footprint of the `loading: 'skeleton'` placeholder. |
| `--origam-switch__skeleton-track---background-color` / `--origam-switch__skeleton-thumb---background-color` | *(undeclared, fall back to `color-mix` of `currentColor`)* | Skeleton fills. |
| `--origam-switch---transition-duration` | `motion.duration.medium` | Track background transition. |
| `--origam-switch---transition-timing-function` | `motion.easing.standard` | Track background easing. |
| `--origam-switch---opacity-disabled` | `opacity.32` | Applied to the track when `disabled`. |

> The following variables are declared under `origam-switch` in
> `light.css` but **no rule reads them** — overriding them does nothing
> today:
> `--origam-switch__track---background-color-checked`,
> `--origam-switch__track---border-color`,
> `--origam-switch__track---border-width`,
> `--origam-switch__thumb---background-color-checked`,
> `--origam-switch__thumb---background-color-disabled`,
> `--origam-switch__thumb---box-shadow`,
> `--origam-switch__thumb---translate-distance`,
> `--origam-switch__thumb---transition-duration`,
> the `--origam-switch__label---*` set and
> `--origam-switch__input---opacity`. The ON colour comes from the
> `bgColor` channel (utility class or inline style), not from a
> `-checked` token.
