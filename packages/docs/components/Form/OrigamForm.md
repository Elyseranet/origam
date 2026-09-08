# OrigamForm

`<OrigamForm>` is the form container that coordinates validation across all
registered child fields (TextField, NumberField, Checkbox, etc.). It provides
a `v-model` for the overall validity state, a `validateOn` strategy, and
exposes `submit` / `reset` helpers via slots.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const isValid = ref<boolean | null>(null)

function onSubmit(e: SubmitEvent) {
  // e is also a Promise that resolves with { valid, errors }
}
</script>

<template>
  <OrigamForm v-model="isValid" @submit.prevent="onSubmit">
    <OrigamTextField label="Email" type="email" :rules="[v => !!v || 'Required']" />
    <OrigamBtn type="submit" text="Submit" />
  </OrigamForm>
</template>
```

## Validate on

Controls when validation fires: `'input'`, `'blur'`, `'submit'`, `'lazy'`.

```vue
<template>
  <OrigamForm validate-on="blur">
    <OrigamTextField label="Name" :rules="[v => !!v || 'Required']" />
  </OrigamForm>
</template>
```

## Disabled / readonly

```vue
<template>
  <OrigamForm disabled>
    <OrigamTextField label="All disabled" />
  </OrigamForm>
</template>
```

## Fast fail

Stop validation at the first failed field.

```vue
<template>
  <OrigamForm fast-fail>
    <OrigamTextField label="Field 1" :rules="[v => !!v || 'Required']" />
    <OrigamTextField label="Field 2" :rules="[v => !!v || 'Required']" />
  </OrigamForm>
</template>
```

## Hint

A static hint is shown in the same `__details` row as form-level messages
whenever no error takes priority over it.

```vue
<template>
  <OrigamForm hint="All fields are optional unless marked otherwise">
    <OrigamTextField label="Name" />
  </OrigamForm>
</template>
```

## Actions slot

The `actions` slot renders in its own `.origam-form__actions` row —
only when you provide it — and receives the form's real handlers.

```vue
<template>
  <OrigamForm @submit.prevent="onSubmit">
    <OrigamTextField label="Name" />
    <template #actions="{ submit, reset }">
      <OrigamBtn text="Submit" @click="submit" />
      <OrigamBtn text="Reset"  @click="reset" variant="outlined" />
    </template>
  </OrigamForm>
</template>
```

`submit` runs the same path as a native `type="submit"` button: it
validates every registered field plus the form's own `rules`, emits
`submit` with the originating event augmented into a promise, and honours
`scrollToError`. `reset` clears the fields and the form-level validation,
then emits `reset`.

> `submit` also triggers the form's **native** submission once validation
> passes, unless a `submit` listener calls `preventDefault()` — the same
> rule as for a `type="submit"` button. Use `@submit.prevent` (as above)
> for a client-side form.

> ⛔ **Fixed.** The slot used to be bound as
> `{ submit: () => handleSubmit, reset: () => handleReset }` — arrow
> functions that *returned* the handler instead of being it. Clicking
> either button evaluated the reference and threw it away: no validation,
> no `submit` / `reset` event, no native submission. Pinned by
> `packages/tests/TU/components/Form/OrigamForm.actions-slot.spec.ts`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean \| null` | `undefined` | Overall validity. `v-model` — the form **writes** into it, so it is an outbound channel as much as an inbound one. |
| `validateOn` | `TValidateOn` | `undefined` | When child fields validate: `'input'`, `'blur'`, `'submit'`, `'lazy'` and their combinations. Provided down to every registered field. |
| `rules` | `Array<any>` | `undefined` | Form-level rules, validated alongside the fields'. Their failures render in the `__details` row, not on a field. |
| `errorMessages` | `string[] \| string` | `undefined` | Form-level errors, shown in the `__details` row. Highest priority of the three message sources. |
| `hint` | `string` | `undefined` | Static hint in the same `__details` row, shown when no error outranks it. |
| `messages` | `string[] \| string` | `undefined` | Neutral messages for the `__details` row. Lowest priority. |
| `fastFail` | `boolean` | `undefined` | Stop validating at the first failing field. |
| `disabled` | `boolean` | `undefined` | Disable every registered field. |
| `readonly` | `boolean` | `undefined` | Put every registered field in read-only mode. |
| `scrollToError` | `boolean \| ScrollIntoViewOptions` | `undefined` | After a failed submit, scroll the first `.origam-input--error` into view. An object is forwarded to `scrollIntoView`; `true` uses `{ behavior: 'smooth', block: 'center' }`. |
| `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` | typography tokens | `undefined` | Applied to the `__details` row — see below. |
| `id` | `string` | generated | DOM id of the `<form>` element. |
| `class` | `string \| string[] \| object` | `undefined` | Extra classes on the `<form>`. |
| `style` | `string \| string[] \| object \| StyleValue` | `undefined` | Extra inline styles. |

The `<form>` element itself always renders `novalidate`: validation is
the DS's, not the browser's.

## Exposed methods

`<OrigamForm>` forwards the `useForm` API plus a few extras through
`defineExpose`, and forwards unknown reads to the underlying
`<form>` element (`forwardRefs`):

| Name | Description |
|---|---|
| `validate()` | Validate every registered field; resolves `{ valid, errors }`. |
| `reset()` | Reset every field's value and validation. |
| `resetValidation()` | Clear validation state, keep the values. |
| `isValid` / `errors` / `items` | Reactive validity, error list, registered fields. |
| `isDisabled` / `isReadonly` / `isValidating` | Reactive state flags. |
| `formIsValid` / `errorMessages` | Form-level (`rules` / `errorMessages`) validity and messages. |
| `scrollToFirstError(options?)` | Scroll the first errored input into view. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | the `useForm` return — `errors`, `isDisabled`, `isReadonly`, `isValidating`, `isValid`, `items`, `validate`, `reset`, `resetValidation` | Form fields |
| `actions` | `{ submit: (e: Event) => void, reset: (e: Event) => void }` | Action buttons, wired to the form's real handlers |
| `messages` | `{ hasMessages, messages }` | Replaces the whole `__details` messages row |
| `message` | `{ message }` | Renders a single message inside the built-in `<origam-messages>` |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `SubmitEvent & Promise<{ valid, errors }>` | Form submitted (awaitable) |
| `reset` | `Event` | Form reset |
| `update:modelValue` | `boolean \| null` | Overall validity changed |

## Typography props (`__details` surface)

Applied to the `__details` area (form-level messages row). All four props have a real visual effect because the `__details` SCSS block reads each matching CSS variable.

| Prop | Type | CSS variable |
|---|---|---|
| `fontSize` | `TFontSize` | `--origam-form__details---font-size` |
| `fontWeight` | `TFontWeight` | `--origam-form__details---font-weight` |
| `letterSpacing` | `TLetterSpacing` | `--origam-form__details---letter-spacing` |
| `lineHeight` | `TLineHeight` | `--origam-form__details---line-height` |

The `__details` div is only rendered when `hasMessages` is true (form has `errorMessages`, `messages`, `hint`, or a `#message` slot). Priority when several are set: `errorMessages` first, then `hint`, then `messages`.

## Design tokens

`<OrigamForm>` is a structural container. The `__details` typography tokens above are the only component-level tokens.
Individual field tokens apply to child components.
