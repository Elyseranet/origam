# useValidation · useMessage

The field-validation engine, and the small hook that decides **which** message a
field container displays.

---

## `useValidation`

```ts
function useValidation (
    props: IValidationProps,
    name = getCurrentInstanceName(),
    id: MaybeRef<string | number> = getUid()
)
```

Runs `props.rules` against `validationValue` (falling back to `modelValue`),
registers the field with the ambient `OrigamForm` through `ORIGAM_FORM_KEY`, and
exposes the field's validation state.

| Returned | Type | Meaning |
|:---|:---|:---|
| `errorMessages` | `ComputedRef<Array<string>>` | External errors + internal ones, truncated to `maxErrors`. |
| `isDirty` | `ComputedRef<boolean>` | The model holds something. |
| `isDisabled` / `isReadonly` | `ComputedRef<boolean>` | Own prop, else the parent form's. |
| `isPristine` | `ShallowRef<boolean>` | Never validated non-silently since the last reset. |
| `isValid` | `ComputedRef<boolean \| undefined>` | **Three-valued** — see below. |
| `isValidating` | `ShallowRef<boolean>` | A `validate()` call is in flight. |
| `reset` | `() => Promise<void>` | Sets the model to `null`, then `resetValidation()`. |
| `resetValidation` | `() => Promise<void>` | Back to pristine; re-validates silently unless `lazy`. |
| `validate` | `(silent?: boolean) => Promise<Array<string>>` | Runs the rules; `silent` keeps `isPristine` true. |
| `validationClasses` | `ComputedRef<Record<string, boolean>>` | `--error`, `--dirty`, `--disabled`, `--readonly`. |

### ⛔ `isValid` is three-valued

`undefined` is *not yet judged* — a pristine field with no internal error, in
`lazy` mode. Distinguish it explicitly from `true` / `false` on the consumer
side; `isValid === false` is the only state that paints `--error`.

Measured, `validateOn: 'lazy'` with a `required` rule on a `null` model:

```
mount               isValid = undefined   isPristine = true    --error = false
await validate()    isValid = false       isPristine = false   errors = ["requis"]
await validate(true) isValid = undefined  isPristine = true
```

`props.error` and a non-empty `props.errorMessages` short-circuit to `false`
before the rules run. Measured: setting `error = true` on a field with no rules
flips `isValid` from `true` to `false`.

`isDirty` normalises the empty string to `null` before wrapping, so
`modelValue = ''` is **not** dirty (measured).

### `validateOn`

`props.validateOn ?? form?.validateOn.value`, defaulting to `'input'`; the value
`'lazy'` is rewritten to `'input lazy'`. The resulting set drives four flags —
note that `blur` is implied by `input`:

```ts
{
    blur:   set.has('blur') || set.has('input'),
    input:  set.has('input'),
    submit: set.has('submit'),
    lazy:   set.has('lazy')
}
```

Each axis is watched inside its own `useToggleScope`, so only the relevant
watchers exist at any time.

### Clearing a field that does not have focus — #702

In `input` mode, emptying a field while it **has focus** defers validation to
the blur: re-running the rules mid-typing would shout "required" at the user.
That deferral is deliberate.

It makes no sense when the field is **not** focused — nobody is typing. That is
a programmatic clear: a parent resetting the `v-model` to `null`, an external
wipe, a data load. An empty third branch left the validation state stale, in
both directions: a `required` rule never re-fired (the empty field stayed
`isValid: true`), and an error message displayed before the clear stayed on
screen although the rule now passed. The parent `<origam-form>` was not notified
either — its aggregate stayed valid on an empty field.

### ⛔ The form-notifying watch is deferred to `onMounted` — ADR-005

`watch([isValid, errorMessages], cb)` reads both sources synchronously to seed
`oldValue`. `isValid` is a `computed` that reads `props.error`. Creating that
watch at the top of `setup()` forced the seeding read **before** `beforeCreate`,
where the ADR-005 theme resolver patches `instance.props`. A `computed` caches
its first evaluation and only invalidates on a tracked dependency change; the
resolver's `Object.defineProperty` patch is not one. `isValid` therefore stayed
frozen at its pre-theme value forever, and a theme naming `error` on any
`useValidation` consumer never flipped the `--error` class.

The watch now lives in `onMounted`, after the first render. **This is not an
optimisation** — moving it back reintroduces the bug.

### Form registration

`onBeforeMount` registers `{ id, vm, validate, reset, resetValidation }`,
`onBeforeUnmount` unregisters, and `onMounted` performs the first
`form?.update()` (after a silent `validate(true)` unless `lazy`). The id is
`props.name ?? unref(id)`, the fallback being `getUid()`.

### Usage

```vue
<script setup lang="ts">
    import { useValidation } from 'origam/composables'
    import type { IValidationProps } from 'origam/interfaces'

    const props = defineProps<IValidationProps>()

    const {
        errorMessages,
        isValid,
        isValidating,
        validate,
        validationClasses
    } = useValidation(props, 'origam-input')
</script>

<template>
    <div :class="validationClasses">
        <input :aria-invalid="isValid === false" :aria-busy="isValidating">
        <p v-for="message in errorMessages" :key="message">{{ message }}</p>
        <button type="button" @click="validate()">Valider</button>
    </div>
</template>
```

### Behaviour notes

- `validate(silent)` sets `isPristine.value = silent` — so `validate(true)`
  leaves the field pristine, which can take `isValid` **back** to `undefined`
  in `lazy` mode (measured above).
- `maxErrors` defaults to `1`; `errorMessages` slices to
  `Math.max(0, +maxErrors)`.
- **#543** notes that `useInlineEdit` reimplements this evaluation loop. This
  page describes what exists; it does not settle that duplicate.

### Consumers

**3** importers in `packages/ds/src`, verified by import: `OrigamForm`,
`OrigamInput`, `OrigamOtpInputField`.

### Source

`packages/ds/src/composables/Commons/validation.composable.ts`

---

## `useMessage`

```ts
function useMessage (
    props: IMessageProps,
    otherMessages: Ref<Array<string>> | ComputedRef<Array<string>> = ref([])
): {
    hasMessages: ComputedRef<boolean>
    messages: ComputedRef<Array<string> | string>
}
```

Resolves which message a field container shows, by priority: external errors
first, else `props.hint`, else `props.messages`.

`otherMessages` — typically the errors coming out of `useValidation` — is a
separate parameter rather than a prop, so the hook stays usable without the full
validation system: a caller with no validator just takes the `ref([])` default.

### ⛔ `props.errorMessages` is a trigger, not a source

The priority branch returns **`otherMessages.value`**, never
`props.errorMessages`:

```ts
if (props.errorMessages?.length || otherMessages.value.length) {
    return otherMessages.value
}
```

Measured with `errorMessages: ['boum']`, `hint: 'aide'`, `messages: ['plain']`
and the default `otherMessages`:

```
hasMessages = true
messages    = []
```

The message area opens **empty**. Setting `errorMessages` only shifts the
priority; it is the caller's job to feed the actual strings through the second
argument — which is what `OrigamForm` does.

### `hasMessages` is broader than `messages`

It is true as soon as any *source* exists — including the `#message` slot, and
including an **empty** `props.messages` array, since the test is
`Boolean(props.messages)` and `Boolean([])` is `true`. Only `otherMessages` is
tested on length.

### Usage

```vue
<script setup lang="ts">
    import { useMessage, useValidation } from 'origam/composables'
    import type { IMessageProps, IValidationProps } from 'origam/interfaces'

    const props = defineProps<IMessageProps & IValidationProps>()

    const { errorMessages } = useValidation(props)
    const { hasMessages, messages } = useMessage(props, errorMessages)
</script>

<template>
    <div v-if="hasMessages" class="origam-form__messages">
        <slot name="message" :messages="messages">{{ messages }}</slot>
    </div>
</template>
```

### Consumers

**1** importer in `packages/ds/src`, verified by import: `OrigamForm` — which
passes its aggregated `errorMessages` as `otherMessages`. Plus one unit spec.
The Field family renders its messages through another path; do not describe this
hook as the one behind `OrigamTextField`, and do not describe it as the snackbar
or notification mechanism.

### Source

`packages/ds/src/composables/Commons/message.composable.ts`

## Related

- [`useVModel`](./useVModel.md) — `useValidation` binds `modelValue` through it.
- [`useToggleScope`](./useToggleScope.md) — hosts the `validateOn` watchers.
- [`useFocus`](./useStateFlag.md) — supplies the `focused` prop the input-mode
  deferral reads.
