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
| `update:focused` | `boolean` | Focus state changed (own `useFocus(props)` call) |
| `update:strength` | `TPasswordStrengthLevel` (`'weak' \| 'fair' \| 'good' \| 'strong'`) | Fires when the computed strength level changes — v-modelable for analytics or cross-field validation |
| `click:control` | `MouseEvent` | Control clicked |
| `mousedown:control` | `MouseEvent` | Mousedown on control |
| `click:clear` | `MouseEvent` | Clear icon clicked |
| `click:prependInner` | `MouseEvent` | Inner prepend adornment clicked |
| `click:appendInner` | `MouseEvent` | Inner append adornment (show/hide toggle) clicked |
| `click:prepend` | `MouseEvent` | Outer prepend clicked |
| `click:append` | `MouseEvent` | Outer append clicked |

`focus` and `blur` are not component emits — `IPasswordFieldEmits` does not
declare them. They reach the consumer as plain DOM events, relayed by
Vue's attribute fallthrough: `@focus` / `@blur` bound on
`<origam-password-field>` work the normal HTML way, they just aren't part
of the typed `emits` contract.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-color` | semantic border | Outline |
| `--origam-password-field---toggle-color` | text-secondary | Toggle icon color |
