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
| `default` | field props | Extra content appended after the cells (does not replace them) |
| `label` | — | Custom label |
| `floatingLabel` | — | Custom floating label |
| `prefix` | — | Content before the cells |
| `suffix` | — | Content after the cells |
| `prependInner` | — | Icon/content inside the control, before the cells |
| `appendInner` | — | Icon/content inside the control, after the cells |
| `clear` | — | Custom clear icon (only rendered when `clearable`) |
| `loader` | — | Custom loading indicator (shown while `loading`) |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| null` | Partial / full value |
| `update:focused` | `boolean` | Focus state changed (own `useFocus(props)` call) |
| `finish` | `string` | All cells filled |
| `click:control` | `MouseEvent` | Click on the control area (`.origam-otp-input-field__content`) |
| `mousedown:control` | `MouseEvent` | Mousedown on the control area (`.origam-otp-input-field__content`) |
| `click:clear` | `MouseEvent` | Clear button clicked — also resets the model to empty |
| `click:appendInner` | `MouseEvent` | Append-inner adornment clicked (relayed from the focused cell's `<origam-field>`) |
| `click:prependInner` | `MouseEvent` | Prepend-inner adornment clicked (relayed from the focused cell's `<origam-field>`) |

`focus` and `blur` are not component emits — `IOtpInputFieldEmits` does not
declare them. They reach the consumer as plain DOM events, relayed by
Vue's attribute fallthrough: `@focus` / `@blur` bound on
`<origam-otp-input-field>` work the normal HTML way, they just aren't part
of the typed `emits` contract.

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

## Accessibility

- The root wrapper carries `role="group"`, and `aria-label` sourced from
  `label` when set — one accessible name for the whole widget.
- Each individual cell ALSO carries its own accessible name (`t('origam.
  input.otp', i + 1)`, "Please enter OTP character N") — the two combine
  the same way a `<fieldset><legend>` groups individually-labelled inputs.
- `label` is intentionally NOT forwarded onto individual cells: doing so
  would render it as a visible floating label repeated once per digit box.

## Design tokens

Ces cinq variables sont les **seules** que le composant lit réellement —
liste établie par `grep -oE "--origam-otp-input-field[a-z-]*"` sur son
`.vue`, pas recopiée d'un fichier de tokens.

| CSS variable | Description |
|---|---|
| `--origam-otp-input-field---gap` | Espace entre les cellules |
| `--origam-otp-input-field---border-radius` | Rayon des cellules |
| `--origam-otp-input-field---padding-block` | Padding vertical |
| `--origam-otp-input-field---error-color` | Couleur du texte des messages d'erreur |
| `--origam-otp-input-field__details---padding-inline` | Padding horizontal de la zone details / messages |

> ⛔ **Corrigé le 2026-09-02.** Cette table citait
> `--origam-otp-input---cell-width` et `--origam-otp-input---cell-gap`, qui
> n'existent **nulle part** — ni dans le SCSS, ni dans les feuilles de
> tokens. Le préfixe réel porte `-field`. Elle citait aussi
> `--origam-field---border-color`, que ce composant ne lit pas, et une
> variable de largeur par cellule qui n'existe pas non plus : la largeur des
> cellules n'est pas thémable aujourd'hui.
>
> Une doc de tokens ne se recopie pas d'un fichier de tokens : elle se
> **mesure sur le composant**. C'est précisément l'écart que le critère C7 du
> classeur appelle « doc MENSONGÈRE », par opposition à « doc absente ».
