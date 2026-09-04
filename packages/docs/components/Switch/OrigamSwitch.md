# OrigamSwitch

`<OrigamSwitch>` is a toggle switch built on `<OrigamInput>` +
`<OrigamSelectionControl type="checkbox">`. It adds an inset track, a thumb,
and optional `flat` / `indeterminate` modes on top of the standard mixin set.

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

## Inset & flat

```vue
<template>
  <OrigamSwitch inset label="Inset track" />
  <OrigamSwitch flat  label="No elevation on thumb" />
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

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Full override of the inner control |
| `label` | — | Custom label content |
| `thumb` | `{ icon }` | Custom thumb element |
| `track.true` | `{ model, isValid }` | Content inside track when ON |
| `track.false` | `{ model, isValid }` | Content inside track when OFF |
| `loader` | — | Custom loading indicator |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Fired on toggle |
| `focus` | `FocusEvent` | Native focus |
| `blur` | `FocusEvent` | Native blur |
| `click:label` | `MouseEvent` | Fired when the user clicks the associated `<label>` rather than the track/thumb |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-switch---track-width` | `51px` | Track width |
| `--origam-switch---track-height` | `24px` | Track height |
| `--origam-switch---thumb-size` | `20px` | Thumb diameter |
