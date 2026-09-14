# OrigamRadioGroup

`<OrigamRadioGroup>` renders a set of mutually exclusive radios from an
`items` array, wrapped in the standard `<OrigamInput>` field chrome
(label, hint, validation messages) and an
`<OrigamSelectionControlGroup multiple="false">`.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const plan = ref('pro')
const plans = [
  { label: 'Free',       value: 'free' },
  { label: 'Pro',        value: 'pro' },
  { label: 'Enterprise', value: 'enterprise' }
]
</script>

<template>
  <OrigamRadioGroup v-model="plan" :items="plans" label="Billing plan" />
</template>
```

## Props

`IRadioGroupProps` is an aggregate — it declares nothing of its own and
composes:

- `Partial<Omit<IRadioProps, 'trueValue' | 'falseValue'>>` — everything
  a single `<OrigamRadio>` accepts, minus the two per-item value props
  that make no sense at group level;
- `Partial<Omit<ISelectionControlGroupProps, 'multiple'>>` — the group
  surface, minus `multiple` (pinned to `false`: a radio group is
  single-choice by definition);
- `IInputProps` — the field chrome;
- `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`,
  `IElevationProps`, `ICommonsComponentProps`.

The rows below are the ones you reach for in practice.

### Data

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<any> \| Record<string, any>` | `[]` | One entry per radio. Each entry is spread onto the rendered `<OrigamRadio>` as props (`{ label, value, disabled, … }`). |
| `modelValue` | `any` | — | The selected value (`v-model`). |
| `valueComparator` | `(a, b) => boolean` | identity | How each item's `value` is matched against `modelValue`. |
| `name` | `string` | — | Native `name` shared by every radio in the group. |

### Field chrome

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Group label, rendered through `<OrigamLabel>` and wired as `aria-labelledby` on the control group. |
| `required` | `boolean` | Marks the label as required. |
| `disabled` / `readonly` | `boolean` | Forwarded down to every radio. |
| `error` | `string \| boolean` | Error state; a string doubles as the message. |
| `messages`, `hint`, `rules`, … | `IInputProps` | The rest of the standard field surface — see [`OrigamInput`](/components/Input/OrigamInput). |

### Design

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | — | Foreground intent, cascaded to the radios. |
| `bgColor` | `TColor` | — | Background intent, cascaded to the radios. |
| `density` | `TDensity` | `'default'` | Cascaded to the radios **only when the consumer passed it** — see the cascade note below. |
| `size` | `TSize` | — | Cascaded to the radios. |
| `inline` | `boolean` | — | Lays the radios out on one line. |
| `trueIcon` / `falseIcon` | `TIcon` | Radio glyphs | Forwarded to the control group. |
| `border` / `rounded` / `elevation` / `padding*` / `margin*` | Commons | Applied to the group's own box. |

> **Cascade rule.** The group forwards `color` / `bgColor` / `density` /
> `size` to its radios through an `<OrigamDefaultsProvider>`, and it
> forwards **only what the consumer actually passed** (`usePassedProps`).
> Two reasons, both measured (#263):
> `TColor` includes `false`, so Vue's boolean coercion turns every unset
> colour prop into the concrete value `false` — there is nothing left for
> `omitUndefined` to strip; and forwarding `density` unconditionally
> would push this component's own `withDefaults` value (`'default'`)
> into the cascade, where it won the `mergeDeep` against a theme's
> `'origam-radio'` block and silently erased it. Per-item props in
> `items` still win over the cascade.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | Fired when the selection changes. |

> This declaration is load-bearing, not decorative. `useVModel(props,
> 'modelValue')` is bound as `v-model` on three children
> (`origam-input`, `origam-selection-control-group`, `origam-radio`), so
> a selection genuinely emits. Vue stays **silent** about an undeclared
> emit when a component has no `emits` option at all — it only warns when
> the option exists and omits the event. Before the declaration was
> added, `onUpdate:modelValue` stayed trapped in `$attrs` and was
> re-injected on `<origam-input>` by the `rootAttrs` spread: the
> consumer's handler ran **twice per selection**. Proven at runtime in
> `packages/tests/TU/origam/relay-emits-declaration.spec.ts`.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces the whole group body — label and control group included. |
| `label` | `{ label, required }` | Replaces the `<OrigamLabel>` only. |
| `item` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Replaces the rendered `<OrigamRadio>` for **every** item. |

> ⛔ `item` does **not** receive the item being rendered. The template
> forwards the outer `<OrigamInput>` scope unchanged — the same object
> `default` gets. If you need per-item data, drive it from your own
> `items` array in the parent scope, or use
> `<OrigamSelectionControlGroup>` directly.

## Behaviour

- **`multiple` is pinned to `false`** on the inner control group and is
  omitted from the prop surface — passing it has no effect.
- **`aria-labelledby`** points at the group id only when `label` is set;
  `aria-describedby` always points at the messages id, so validation
  text is announced.
- **Recursion guard** — the radios inherit visual props through
  `<OrigamDefaultsProvider>` rather than through a `computed` reading a
  `v-for` array ref. Reading that ref re-triggered the render endlessly
  ("Maximum recursive updates in OrigamInput"); the defaults provider
  gives the same forwarding with no ref read.

## Related

- `OrigamRadio` — a single radio field.
- `OrigamRadioBtn` — the bare control, no field chrome.
- `OrigamSelectionControlGroup` — the generic group primitive shared with
  Checkbox.
