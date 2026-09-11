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

```vue
<template>
  <OrigamSwitch color="primary" label="Primary" :model-value="true" />
  <OrigamSwitch color="success" label="Success" :model-value="true" />
</template>
```

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

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-switch---track-width` | `51px` | Track width |
| `--origam-switch---track-height` | `24px` | Track height |
| `--origam-switch---thumb-size` | `20px` | Thumb diameter |
