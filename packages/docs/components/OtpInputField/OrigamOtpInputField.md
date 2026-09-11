# OrigamOtpInputField

`<OrigamOtpInputField>` renders a row of `N` single-character inputs (default 6)
for one-time password / verification code entry. It emits `finish` when every
slot is filled, and handles auto-advance, backspace, and paste natively.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const code = ref('')
</script>

<template>
  <OrigamOtpInputField v-model="code" label="OTP code" />
</template>
```

## Length

```vue
<template>
  <OrigamOtpInputField :length="4" label="4-digit PIN" />
  <OrigamOtpInputField :length="8" label="8-char token" />
</template>
```

## Type (text / password / number)

```vue
<template>
  <OrigamOtpInputField type="password" :length="6" label="Hidden OTP" />
  <OrigamOtpInputField type="number"   :length="6" label="Numeric OTP" />
</template>
```

## Divider

```vue
<template>
  <OrigamOtpInputField :length="6" divider="-" label="With divider" />
</template>
```

## Focus all on mount

```vue
<template>
  <OrigamOtpInputField :length="4" focus-all autofocus label="Focus all" />
</template>
```

## States (disabled / readonly / error)

```vue
<template>
  <OrigamOtpInputField :length="4" disabled label="Disabled" />
  <OrigamOtpInputField :length="4" :error="true" error-messages="Invalid code" label="Error" />
</template>
```

## Validation with rules

The `rules` prop accepts an array of validator functions. Each function receives
the current OTP string (all cells joined) and must return `true` to pass, or an
error string / `false` to fail. Validation is wired through `useValidation` and
error messages are displayed below the cell row via `<OrigamMessages>`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const code = ref('')
const rules = [
  (v: string) => v.length === 6 || 'Code incomplet (6 chiffres requis)',
  (v: string) => /^\d+$/.test(v) || 'Chiffres uniquement',
]
</script>

<template>
  <OrigamOtpInputField
    v-model="code"
    :rules="rules"
    :length="6"
    validate-on="input"
    label="Code de vérification"
  />
</template>
```

The `validateOn` prop controls when validation fires:

| Value | Behaviour |
|---|---|
| `input` (default) | Validates on every keystroke |
| `blur` | Validates when the last focused cell loses focus |
| `submit` | Validates only on `<OrigamForm>` submit |
| `lazy` | Like `input` but skips the initial silent pass |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | field props | Override field body |
| `label` | `ILabelProps` | Custom label |
| `field` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Replace individual `<input>` cells |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| null` | Partial / full value |
| `finish` | `string` | All cells filled |
| `focus` | `FocusEvent` | Any cell focused |
| `blur` | `FocusEvent` | All cells blurred |
| `click:clear` | `MouseEvent` | Clear button clicked |
| `click:control` | `MouseEvent` | Control area clicked |

## Props (validation)

| Prop | Type | Default | Description |
|---|---|---|---|
| `rules` | `Array<(v: string) => true \| string>` | `[]` | Validator functions. Receive the full OTP string and return `true` or an error message. |
| `errorMessages` | `string \| Array<string>` | — | Static error messages bypassing rule evaluation. |
| `validateOn` | `'input' \| 'blur' \| 'submit' \| 'lazy'` | `'input'` | When validation is triggered. |
| `hideDetails` | `boolean \| 'auto'` | — | `true` hides the details zone (messages). `'auto'` hides it when no messages are present. |
| `hint` | `string` | — | Helper text shown below the cells when focused (or with `persistentHint`). |
| `persistentHint` | `boolean` | — | Always show `hint`, even when the field is not focused. |

### Validation behaviour

- Validation evaluates `props.rules` against the **joined OTP string** (`model.join('')`).
- Error messages are rendered below the cell row via `<OrigamMessages>`.
- The component also fires `validate()` automatically when the `finish` event fires (all cells filled).
- The `origam-otp-input-field--error` CSS class is applied to the root when `isValid === false`.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-otp-input---cell-width` | `48px` | Width per cell |
| `--origam-otp-input---cell-gap` | `8px` | Gap between cells |
| `--origam-field---border-color` | semantic border | Cell outline |
| `--origam-otp-input-field__details---padding-inline` | `4px` | Horizontal padding of the details / messages zone |
| `--origam-otp-input-field---error-color` | `var(--origam-color__feedback--danger---fg-subtle)` | Text color of error messages |
