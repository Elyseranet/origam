# OrigamTextField

`<OrigamTextField>` is the standard single-line text input. It wraps
`<OrigamField>` + `<OrigamInput>` and exposes type, counter, placeholder,
prefix/suffix, inner prepend/append icons, and the full validation pipeline.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const name = ref('')
</script>

<template>
  <OrigamTextField v-model="name" label="Full name" />
</template>
```

## Variants

`variant` is a **props preset** resolved on the INNER `<OrigamField>` this
component renders (ADR-005, ticket #24 — see
[`OrigamField`'s Variants section](/components/Field/OrigamField.md#variants)
for the full preset table and what did / didn't convert). An explicit prop
at the call site always beats the preset:

```vue
<template>
  <OrigamTextField variant="outlined" label="Outlined" />
  <OrigamTextField variant="filled"   label="Filled" />
  <OrigamTextField variant="plain"    label="Plain" />

  <!-- Paints primary — bgColor is a call-site prop, the outlined preset's
       bgColor is the weakest tier. -->
  <OrigamTextField variant="outlined" bg-color="primary" label="Primary outlined" />
</template>
```

Note: `TextField` defaults its OWN `rounded` prop to `true`, which is
always forwarded to the inner `OrigamField` as an explicit value — so the
`filled` preset's asymmetric-corner-radius entry never reaches a
`TextField` (it's reachable through a bare `OrigamField` only). This does
not change any TextField rendering; see `field-variant.const.ts` for the
verified detail.

## Color

```vue
<template>
  <OrigamTextField color="primary"   label="Primary" />
  <OrigamTextField color="secondary" label="Secondary" />
</template>
```

## Density

```vue
<template>
  <OrigamTextField density="compact"     label="Compact" />
  <OrigamTextField density="default"     label="Default" />
  <OrigamTextField density="comfortable" label="Comfortable" />
</template>
```

## Type

```vue
<template>
  <OrigamTextField type="text"   label="Text" />
  <OrigamTextField type="email"  label="Email" />
  <OrigamTextField type="search" label="Search" />
  <OrigamTextField type="tel"    label="Tel" />
  <OrigamTextField type="url"    label="URL" />
</template>
```

## Counter

```vue
<template>
  <OrigamTextField label="Bio" :counter="150" />
</template>
```

## Prefix & suffix

```vue
<template>
  <OrigamTextField label="Price" prefix="$" suffix=".00" />
</template>
```

## Prepend / append inner icons

```vue
<template>
  <OrigamTextField label="Search" prepend-inner-icon="mdi-magnify" clearable />
</template>
```

## States (disabled / readonly / error)

```vue
<template>
  <OrigamTextField label="Disabled" disabled model-value="locked" />
  <OrigamTextField label="Readonly" readonly model-value="read-only" />
  <OrigamTextField label="Error"    error error-messages="Required" />
</template>
```

## Validation

```vue
<script setup lang="ts">
const rules = [(v: string) => !!v || 'Field is required']
</script>

<template>
  <OrigamTextField label="Required" :rules="rules" />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ class }` + field props | Full field-body override |
| `label` | `ILabelProps` | Custom label |
| `floatingLabel` | `ILabelProps` | Custom floating label |
| `prefix` | — | Content before the input |
| `suffix` | — | Content after the input |
| `prependInner` | — | Content inside field, before input |
| `appendInner` | — | Content inside field, after input |
| `prepend` | — | Content outside field, before |
| `append` | — | Content outside field, after |
| `loader` | — | Custom loading indicator |
| `counter` | `{ counter, max, value }` | Custom counter display |
| `field` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Replace the `<input>` element |
| `messages` | `{ hasMessages, messages }` | Custom messages area |
| `details` | any | Custom details row |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Value changed |
| `focus` | `FocusEvent` | Input focused |
| `blur` | `FocusEvent` | Input blurred |
| `click:clear` | `MouseEvent` | Clear button clicked |
| `click:control` | `MouseEvent` | Field control area clicked |
| `mousedown:control` | `MouseEvent` | Mousedown on field control |
| `click:prepend` | `MouseEvent` | Outer prepend clicked |
| `click:append` | `MouseEvent` | Outer append clicked |
| `click:prependInner` | `MouseEvent` | Inner prepend clicked |
| `click:appendInner` | `MouseEvent` | Inner append clicked |
| `valid` | `boolean` | (mask) Emitted on every input/paste when a mask is active — reports current validity |
| `complete` | `{ complete: boolean, unmasked: string }` | (mask) Emitted when every consumer slot of the mask is filled |

## Masks (autoformat + validation)

The `mask` prop turns a plain TextField into an autoformatting + validating
input — without bringing in `imask.js` / `cleave.js` / `vue-the-mask`. The
in-house engine ships built-in presets (`phone:fr`, `creditcard`, `iban`,
`date:iso`, …) and accepts arbitrary patterns.

When a mask is active:

- `v-model` exposes the **unmasked** value (no separators).
- The DOM input displays the **masked** (formatted) value.
- `@valid` / `@complete` reflect live validation state.
- `aria-invalid` toggles automatically; the field surfaces an `error`
  state via the validation rule pipeline.

### Quick start

```vue
<origam-text-field
    v-model="phone"
    mask="phone:fr"
    label="Mobile number"
/>
<!-- Typing "0612345678" displays "06 12 34 56 78"
     phone === "0612345678" -->
```

### Pattern syntax

| Token | Accepts |
|-------|---------|
| `#`   | A digit `[0-9]` |
| `A`   | A letter `[a-zA-Z]` |
| `*`   | Any character |
| any other char | Literal — emitted verbatim, does not consume input |

Custom example: `mask="(##) ###-####"` — three consumer slots (2/3/4 digits)
with `(` `)` `-` and spaces as literals.

### Built-in patterns

| Key | Pattern | Validator |
|-----|---------|-----------|
| `phone:fr` | `## ## ## ## ##` | — |
| `phone:us` | `(###) ###-####` | — |
| `phone:international` | `+## ## ## ## ## ##` | — |
| `iban` | `**** **** **** **** **** **** ****  **` | `iban` (mod-97) |
| `siret` | `### ### ### #####` | — |
| `creditcard` | `#### #### #### ####` | `luhn` |
| `date:iso` | `####-##-##` | `date:iso` (real-date) |
| `date:fr`  | `##/##/####` | `date:fr` |
| `date:us`  | `##/##/####` | `date:us` |
| `time` | `##:##` | — |
| `time:12h` | `##:## AA` | — |
| `postcode:fr` | `#####` | — |
| `postcode:us` | `#####` | — |

### Custom pattern + custom validator

```vue
<origam-text-field
    v-model="ref"
    :mask="{
        pattern: 'AA-##-####',
        required: true,
        validator: (v) => v.startsWith('FR')
    }"
    label="Internal reference"
/>
```

### Validators

| Name | Algorithm |
|------|-----------|
| `luhn` | Standard Luhn checksum (credit cards, IMEI) |
| `iban` | ISO 13616 — rearrange + mod 97 == 1 |
| `date:iso` | `YYYYMMDD` → real Gregorian date |
| `date:fr`  | `DDMMYYYY` → real Gregorian date |
| `date:us`  | `MMDDYYYY` → real Gregorian date |
| `(v) => boolean` | Any user-supplied function on the unmasked value |

### Migration from imask.js / cleave.js

| imask.js                   | origam                       |
|----------------------------|------------------------------|
| `mask: '(000) 000-0000'`   | `mask="(###) ###-####"`     |
| `mask: '0000 0000 0000 0000'` | `mask="creditcard"` (with Luhn) |
| `IMask.MaskedRange`         | not supported — write a `validator` fn |
| `lazy: false`               | default. There is no eager "show all literals when empty" mode. |

### Accessibility

- The input keeps its native `<input type="text">` (or `tel` for
  phone-shaped patterns — better mobile keyboard).
- `aria-invalid` reflects mask validity on touched fields.
- Error messages flow through OrigamField's `aria-describedby` chain.
- The mask never blocks accessible inputs — invalid keystrokes are
  silently dropped, not announced.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-color` | semantic border | Field outline color |
| `--origam-field---label-color` | semantic text | Floating label color |
| `--origam-field---bg-color` | surface | Field background |
