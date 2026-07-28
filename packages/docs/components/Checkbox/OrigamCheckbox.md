# OrigamCheckbox

`<OrigamCheckbox>` is the high-level checkbox form atom. It wraps `<OrigamInput>` +
`<OrigamCheckboxBtn>` and wires validation, hint, error messages and the full
mixin set (density, color, rounded, border, elevation).

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const accepted = ref(false)
</script>

<template>
  <OrigamCheckbox v-model="accepted" label="Accept terms" />
</template>
```

## Color

```vue
<template>
  <OrigamCheckbox color="primary"   label="Primary"   :model-value="true" />
  <OrigamCheckbox color="success"   label="Success"   :model-value="true" />
  <OrigamCheckbox color="danger"    label="Danger"    :model-value="true" />
</template>
```

## Density

```vue
<template>
  <OrigamCheckbox density="compact"     label="Compact" />
  <OrigamCheckbox density="default"     label="Default" />
  <OrigamCheckbox density="comfortable" label="Comfortable" />
</template>
```

## Rounded

```vue
<template>
  <OrigamCheckbox rounded="sm" label="Small radius" />
  <OrigamCheckbox rounded="lg" label="Large radius" />
  <OrigamCheckbox :rounded="true" label="Full round" />
</template>
```

`rounded` / `border` / `elevation` apply to the control's state-layer box
(the circular hit/hover area behind the checkbox glyph), not to the glyph
itself — the checked/unchecked mark is an icon-font character (`mdi-checkbox-*`)
with no border-radius of its own. Expect a visible ring/shadow/shape change
around the control, not a reshaped checkbox mark.

## States (disabled / readonly / indeterminate)

```vue
<template>
  <OrigamCheckbox label="Disabled"      disabled />
  <OrigamCheckbox label="Readonly"      readonly :model-value="true" />
  <OrigamCheckbox label="Indeterminate" indeterminate />
</template>
```

## Error & validation

```vue
<script setup lang="ts">
const rules = [(v: boolean) => v || 'You must accept']
</script>

<template>
  <OrigamCheckbox label="Accept" :rules="rules" />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces the inner `<OrigamCheckboxBtn>` entirely |
| `label` | — | Custom label content |
| `input` | `{ props, icon, textColorStyles, backgroundColorStyles, model }` | Custom visual control (the box itself) |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Fired when the checkbox is toggled |
| `focus` | `FocusEvent` | Native focus on the inner input |
| `blur` | `FocusEvent` | Native blur on the inner input |
| `click:label` | `MouseEvent` | Label element was clicked |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-checkbox---density` | inherited | Vertical padding offset |
| `--origam-selection-control---icon-size` | `24px` | Size of the check icon |
