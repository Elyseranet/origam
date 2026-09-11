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

`rounded` / `border` / `elevation` apply to the control's **state-layer box**
— the hit/hover area behind the glyph — not to the glyph itself. The
selected/unselected mark is an icon-font character (`mdi-radiobox-*`) with no
border-radius of its own.

::: warning `rounded` alone paints nothing at rest
The state-layer box has **no background and no border by default**. Changing
its `border-radius` is real — it is measurable in the computed style — but
there is nothing for the new corner to reveal, so a `rounded` prop passed on
its own produces **no visible difference at rest**.

`rounded` becomes visible when something paints that box: **on hover** (the
state layer fills in and follows the radius), combined with **`border`** (a
ring on the box), combined with **`elevation`** (a shadow shaped by the
radius), or with a custom background of your own.

This matters for theme authors: `'origam-radio': { rounded: 'md' }` changes
the hover halo, **not** the resting silhouette of the radio. Reshaping the
mark itself is a rendering change (glyph → drawn CSS box), not a prop — see
[#241](https://github.com/arnaudprioul/origam/issues/241).
:::

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
