# OrigamCheckboxGroup

The checkbox counterpart of [`OrigamRadioGroup`] — a labelled, validated
group of checkboxes bound to a single `v-model`.

```vue
<origam-checkbox-group
    v-model="selected"
    label="Notifications"
    :items="[
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
        { label: 'Push', value: 'push' }
    ]"
/>
```

## The one difference with `OrigamRadioGroup`

`OrigamRadioGroup` `Omit`s `multiple` from its props and hardcodes
`:multiple="false"` — correct, because radio semantics are *exactly one of*.

A checkbox group is the opposite: **selecting several is the normal case**.
`multiple` is therefore exposed here and **defaults to `true`**.

Setting `multiple={false}` stays legitimate — it yields a group of
checkboxes behaving as an exclusive choice, which some designs use for a
"none of the above" toggle list. Nothing forbids it; it is simply not the
default.

Everything else — the `<OrigamInput>` chrome, label, validation messages,
`items`, the `#default` / `#label` / `#item` slots, the visual cascade —
mirrors `OrigamRadioGroup` deliberately, so the two are learned once.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `unknown[]` | — | Selected values. An array, since several may be selected. |
| `multiple` | `boolean` | `true` | Allow more than one selection. **This is the difference with RadioGroup.** |
| `items` | `ICheckboxProps[]` | `[]` | The checkboxes to render. Each entry is spread onto its `<OrigamCheckbox>`. |
| `label` | `string` | — | Group label, rendered through `<OrigamLabel>` and wired as `aria-labelledby`. |
| `required` | `boolean` | — | Forwarded to the label. |

The group also accepts the full `IInputProps` surface (validation, messages,
density, readonly, disabled…), plus padding / margin / border / rounded /
elevation.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces the whole group body. |
| `label` | `{ label, required }` | Replaces the rendered label. |
| `item` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces each rendered checkbox. |

> ⚠️ `#item` receives the **outer `<OrigamInput>` scope**, not the individual
> item being rendered. That is inherited from `OrigamRadioGroup` and kept
> identical on purpose — documented here so the asymmetry with the slot's
> name is not mistaken for a bug.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `unknown[]` | Fired on every selection change. |

> ⛔ Declared from the start, deliberately. `OrigamRadioGroup` shipped with
> **no `emits` option at all** while binding `useVModel(props, 'modelValue')`
> as `v-model` on three children. Vue stays **silent** in that case — its
> warning only fires when a component *has* an `emits` option that omits the
> event, never when it has none. The symptom was `onUpdate:modelValue` stuck
> in `$attrs` and re-applied onto `<origam-input>` by the `rootAttrs` spread:
> the consumer's handler ran **twice per selection**.

## Visual cascade

Group-level `color`, `bgColor`, `density` and `size` reach the checkboxes
through an `<OrigamDefaultsProvider>` wrapper — **not** by reading a `v-for`
ref. Reading such a ref (reassigned on every render) inside a computed
re-triggered rendering endlessly on `OrigamRadioGroup`
(*"Maximum recursive updates in OrigamInput"*).

Only props the consumer **actually passed** are forwarded (see #263). This
matters more than it looks: `color` / `bgColor` are `TColor`, which includes
`false`, so Vue's boolean-prop coercion resolves each *unset* prop to the
concrete value `false` — there is no `undefined` left for a naive filter to
catch. Forwarded unconditionally, they win the `mergeDeep` against a theme's
`'origam-checkbox'` entry and erase it silently.

## Example — exclusive mode

```vue
<origam-checkbox-group
    v-model="answer"
    :multiple="false"
    label="Pick one"
    :items="options"
/>
```
