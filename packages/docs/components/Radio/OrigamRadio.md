# OrigamRadio

`<OrigamRadio>` is the high-level radio-button atom. It wraps `<OrigamInput>` +
`<OrigamRadioBtn>` and inherits the full mixin set (density, color, rounded,
border, elevation). Radio buttons should be grouped with `<OrigamRadioGroup>`.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const selected = ref<string>('a')
</script>

<template>
  <OrigamRadio v-model="selected" value="a" label="Option A" />
  <OrigamRadio v-model="selected" value="b" label="Option B" />
</template>
```

## Color

```vue
<template>
  <OrigamRadio color="primary"   label="Primary"   value="p" :model-value="'p'" />
  <OrigamRadio color="secondary" label="Secondary" value="s" :model-value="'s'" />
</template>
```

## Density

```vue
<template>
  <OrigamRadio density="compact"     value="c" label="Compact" />
  <OrigamRadio density="default"     value="d" label="Default" />
  <OrigamRadio density="comfortable" value="e" label="Comfortable" />
</template>
```

## Rounded

```vue
<template>
  <OrigamRadio rounded="sm" value="a" label="Small radius" />
  <OrigamRadio :rounded="true" value="b" label="Full round" />
</template>
```

`rounded` / `border` / `elevation` apply to the control's state-layer box
(the circular hit/hover area behind the radio glyph), not to the glyph
itself — the selected/unselected mark is an icon-font character
(`mdi-radiobox-*`) with no border-radius of its own. Expect a visible
ring/shadow/shape change around the control, not a reshaped radio dot.

## States (disabled / readonly)

```vue
<template>
  <OrigamRadio label="Disabled" value="x" disabled />
  <OrigamRadio label="Readonly" value="x" readonly :model-value="'x'" />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces inner `<OrigamRadioBtn>` |
| `label` | — | Custom label content |
| `input` | `{ props, icon, textColorStyles, backgroundColorStyles, model }` | Custom visual control |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Fired on selection change |
| `focus` | `FocusEvent` | Native focus |
| `blur` | `FocusEvent` | Native blur |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-radio---density` | inherited | Vertical padding offset |
| `--origam-selection-control---icon-size` | `24px` | Size of the radio dot icon |
