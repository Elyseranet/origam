# OrigamNumberField

`<OrigamNumberField>` is the numeric input with increment/decrement controls.
It extends the field mixin set with `min`, `max`, `step`, `precision`,
`holdDelay`, `holdRepeat`, split-button mode, hide-controls mode, and compact
mode. Both normal and compact modes fully support `rules`-based validation and
display error messages when a rule fails.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const qty = ref<number | null>(1)
</script>

<template>
  <OrigamNumberField v-model="qty" label="Quantity" :min="0" :max="100" />
</template>
```

## Min / max / step / precision

```vue
<template>
  <OrigamNumberField label="Price" :min="0" :max="9999" :step="0.01" :precision="2" />
</template>
```

## Split mode

```vue
<template>
  <OrigamNumberField label="Counter" split />
</template>
```

## Hide controls

```vue
<template>
  <OrigamNumberField label="No buttons" hide-controls />
</template>
```

## Custom icons

```vue
<template>
  <OrigamNumberField
    label="Volume"
    increment-icon="mdi-volume-plus"
    decrement-icon="mdi-volume-minus"
  />
</template>
```

## States (disabled / readonly / error)

```vue
<template>
  <OrigamNumberField label="Disabled" disabled :model-value="5" />
  <OrigamNumberField label="Error"    :error="true" error-messages="Out of range" />
</template>
```

## Compact mode with validation

The compact mode (`compact` prop) renders a minimal `− value +` control.
It passes through the same `rules`, `error`, `errorMessages`, `validateOn`,
`maxErrors`, and `hideDetails` props as the normal mode — error messages appear
directly below the compact control.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const qty = ref<number | null>(0)
</script>

<template>
  <OrigamNumberField
    v-model="qty"
    compact
    label="Quantity"
    :min="1"
    :max="99"
    :rules="[(v) => v != null && v >= 1 || 'Min 1']"
  />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `increment` | `{ canIncrease, onControlClick, onUpControlMousedown, onControlMouseup }` | Custom increment button |
| `decrement` | `{ canDecrease, onControlClick, onDownControlMousedown, onControlMouseup }` | Custom decrement button |
| `label` | `ILabelProps` | Custom label |
| `prepend` | — | Outside field before |
| `append` | — | Outside field after |
| `prependInner` | — | Inside field before |
| `appendInner` | — | Inside field after |
| `field` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Replace `<input>` |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number \| null` | Value changed |
| `increment` | `number \| null` | Increment button pressed |
| `decrement` | `number \| null` | Decrement button pressed |
| `focus` | `FocusEvent` | Input focused |
| `blur` | `FocusEvent` | Input blurred |
| `click:clear` | `MouseEvent` | Clear button clicked |
| `click:control` | `MouseEvent` | Control area clicked |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-number-field---control-width` | `36px` | Inc/dec button width |
| `--origam-field---border-color` | semantic border | Outline color |
| `--origam-number-field--compact---gap` | `8px` | Gap between compact buttons and input |
| `--origam-number-field--compact__input---width` | `3em` | Width of the compact value input |
