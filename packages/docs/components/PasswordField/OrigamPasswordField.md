# OrigamPasswordField

`<OrigamPasswordField>` is a `<OrigamTextField type="password">` with a built-in
show/hide toggle and an optional strength-requirements popup (minLength, lowercase,
uppercase, digit, special character). Each enabled requirement auto-injects a
validation rule.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const pwd = ref('')
</script>

<template>
  <OrigamPasswordField v-model="pwd" label="Password" />
</template>
```

## Show/hide icons

```vue
<template>
  <OrigamPasswordField
    label="Password"
    on-icon="mdi-eye"
    off-icon="mdi-eye-off"
  />
</template>
```

## Strength requirements popup

```vue
<template>
  <OrigamPasswordField
    label="New password"
    requirements
    :min-length="10"
    need-uppercase
    need-number
    need-special
  />
</template>
```

## Persistent requirements

```vue
<template>
  <OrigamPasswordField label="Password" requirements persistent-requirements />
</template>
```

## States (disabled / readonly / error)

```vue
<template>
  <OrigamPasswordField label="Disabled" disabled />
  <OrigamPasswordField label="Error"    :error="true" error-messages="Too weak" />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `info` | `{ [key: string]: any }` | Custom requirements popup body |
| `counter` | `{ counter, max, value }` | Custom character counter |
| `field` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Replace the `<input>` |
| `label` | `ILabelProps` | Custom label |
| `prependInner` | — | Inside field before input |
| `appendInner` | — | Inside field after input |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Value changed |
| `focus` | `FocusEvent` | Input focused |
| `blur` | `FocusEvent` | Input blurred |
| `click:control` | `MouseEvent` | Control clicked |
| `mousedown:control` | `MouseEvent` | Mousedown on control |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-color` | semantic border | Outline |
| `--origam-password-field---toggle-color` | text-secondary | Toggle icon color |
