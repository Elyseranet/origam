# OrigamStepperItem

Sub-component of `OrigamStepper`. It renders a single
step: a numbered or icon indicator, a title, and an optional subtitle.

`OrigamStepper` generates one of these per entry in its `items` array, so most
consumers never write the tag. You mount it directly when you take over the
stepper's `default` slot and want to lay the steps out yourself.

```vue
<template>
    <origam-stepper v-model="step" clickable>
        <origam-stepper-item :index="0" title="Account" subtitle="Your details"/>
        <origam-stepper-item :index="1" title="Payment"/>
        <origam-stepper-item :index="2" title="Confirm"/>
    </origam-stepper>
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `index` | `number` | `0` | Position of the step. Drives the displayed number (`index + 1`), the status computed from the parent's `modelValue`, and the `click` payload. |
| `title` | `string` | — | Main label. Also gates the `aria-label` — see [Accessibility](#accessibility). |
| `subtitle` | `string` | — | Secondary label rendered under the title. |
| `icon` | `TIcon` | — | Indicator glyph replacing the step number. Ignored when the resolved status is `done` or `error`, which own their icons. |
| `status` | `TStepperItemStatus` | — | `pending` / `active` / `done` / `error`. When set it wins over the status the parent would compute. |
| `clickable` | `boolean` | `false` | See [Clickability](#clickability) — it can only ever turn clicking **on**. |
| `id` | `string` | — | Root `id`. |
| `class` | `string \| Array<string> \| object` | — | Merged into the root class list. |
| `style` | `string \| Array<string> \| object \| StyleValue` | — | Merged into the root style. |

## Emits

| Event | Payload | Description |
|---|---|---|
| `click` | `number` — the step's `index` | Fired only when the step is clickable. The item also writes `index` back into the parent's `modelValue`. |

## Slots

None. Content is driven by `title`, `subtitle` and `icon`. To render arbitrary
step content, take over `OrigamStepper`'s `default` slot instead.

## Status resolution

`status` is resolved in two steps, and an explicit prop always wins:

1. If `status` is set, it is used as-is.
2. Otherwise it is derived from the parent's `modelValue`: `index < modelValue`
   → `done`, `index === modelValue` → `active`, anything past it → `pending`.

`error` is never derived — it only ever comes from an explicit `status="error"`.

The indicator content follows the resolved status: `done` shows a check,
`error` shows an exclamation, then `icon` if one was given, and finally the
step number as the fallback.

## Clickability

The item reads a `clickable` flag from the parent through `provide` / `inject`,
and its own `clickable` prop can only **override it to `true`** — never back to
`false`. So `<origam-stepper clickable>` makes every step clickable, and a
single `<origam-stepper-item clickable>` promotes one step inside a stepper
that isn't.

This asymmetry is deliberate. Vue coerces an unprovided Boolean prop to `false`
rather than `undefined`, so an item cannot distinguish "not specified" from
"explicitly off" — treating `false` as an override would have made every item
opt out of the parent's setting. That was a real bug: items rendered as `<div>`
instead of `<button>` and never consulted the inject.

A clickable step renders as `<button type="button">`; a non-clickable one as a
plain `<div>`.

## Accessibility

- The active step carries `aria-current="step"`.
- A clickable step that is already active is rendered `disabled` — you cannot
  click your way onto the step you are already on.
- The indicator is `aria-hidden`, since the number and icons duplicate
  information the label already carries.
- The `aria-label` is built from `origam.stepper.step_aria_label` through the
  DS locale provider, interpolating the step number and title. **It is emitted
  only when `title` is set** — an item without a title has no accessible name,
  so give every step a title unless something else labels it.

## Examples

Explicit statuses, bypassing the parent's computation:

```vue
<template>
    <origam-stepper :model-value="1">
        <origam-stepper-item :index="0" title="Uploaded"  status="done"/>
        <origam-stepper-item :index="1" title="Scanning"  status="active"/>
        <origam-stepper-item :index="2" title="Rejected"  status="error"/>
    </origam-stepper>
</template>
```

Reacting to a step being selected:

```vue
<template>
    <origam-stepper v-model="step" clickable>
        <origam-stepper-item
            :index="0"
            title="Account"
            @click="onStepClick"
        />
    </origam-stepper>
</template>

<script setup lang="ts">
    const onStepClick = (index: number) => {
        console.info('step selected', index)
    }
</script>
```
