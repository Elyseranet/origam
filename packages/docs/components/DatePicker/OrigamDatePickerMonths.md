# OrigamDatePickerMonths

`<OrigamDatePickerMonths>` is the month-picking panel of
[`<OrigamDatePicker>`](./OrigamDatePicker.md): a 2-column grid of twelve
short month names, each rendered as an `<OrigamBtn>`. It is what the picker
swaps in when `viewMode` becomes `'months'`.

## Basic usage

```vue
<template>
    <OrigamDatePickerMonths v-model:month="month" :year="2026" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const month = ref(4)
</script>
```

## Props

### Value

| Prop | Type | Default | Description |
|---|---|---|---|
| `month` | `number` | current month | Selected month, `0`–`11`. Two-way (`v-model:month`), coerced through `int()` |
| `year` | `number` | current year | Which year the twelve tiles belong to. Only affects the labels and how `min` / `max` are compared — it is not itself selectable here |

### Bounds

| Prop | Type | Default | Description |
|---|---|---|---|
| `min` | `unknown` | — | Months starting before it are disabled |
| `max` | `unknown` | — | Months starting after it are disabled |

Both are compared at month granularity (`startOfMonth`), so a `min` mid-month
still leaves that month enabled.

### Color

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Passed to the **selected** tile's `<OrigamBtn>` only |

Unselected tiles always render with the button's default colour — this is
deliberate, and it is why `color` looks like it does nothing until a month is
selected.

### Dimension

All six come from `IDimensionProps` and are consumed through
`useDimension(props)`, which emits inline declarations on the root.

| Prop | Type | Default | Description |
|---|---|---|---|
| `height` | `string \| number` | `288px` (from the stylesheet) | Panel height |
| `width` | `string \| number` | — | Panel width |
| `minHeight` | `string \| number` | — | |
| `minWidth` | `string \| number` | — | |
| `maxHeight` | `string \| number` | — | |
| `maxWidth` | `string \| number` | — | |

### Commons

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Forwarded to the root element and to the `useStyle` scope |
| `class` | `string \| string[] \| object` | `undefined` | Appended to the root class list |
| `style` | `StyleValue` | `undefined` | Appended last, so it wins over the dimension declarations |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:month` | `number` | The month index the user picked |

⚠️ Two different paths reach it. Clicking a **different** month writes to the
`useVModel`-backed model, whose setter emits `update:month`. Clicking the
**already-selected** month emits `update:month` directly without changing the
model — that is how `<OrigamDatePicker>` learns to leave the months view and
go back to the day grid on a confirming second click.

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `month` | `{ month: IDatePickerMonthsItem, index: number, props: IDatePickerMonthsButtonProps }` | Replaces the default tile. `props` is the complete pre-wired `<OrigamBtn>` binding (`active`, `color`, `disabled`, `rounded`, `text`, `key`, `onClick`) — spread it and selection keeps working |

`month` carries `{ isDisabled, text, value }`; `text` is the adapter's
`monthShort` format, so it follows the active locale.

## Behaviour notes

- **Layout.** `grid-template-columns: repeat(2, 1fr)` with a `0 24px` gap and
  `36px` of inline padding; the panel is `288px` tall and the content grid
  inherits that height.
- **No scroll.** Unlike the years panel, all twelve tiles fit, so there is no
  overflow and no scroll-into-view on mount.
- **Text case.** A `:deep` rule removes `<OrigamBtn>`'s default
  `text-transform`, so month names keep their natural casing.
- **Self-healing model.** A `watchEffect` re-seeds the model with the current
  month whenever it would otherwise be `null` / `undefined`.

## Exposed instance API

`defineExpose` publishes `filterProps`, `css`, `id`, `load`, `unload` and
`isLoaded` — the standard `useStyle` / `useProps` surface.

## Examples

### Restricted to the second half of a year

```vue
<template>
    <OrigamDatePickerMonths
        v-model:month="month"
        :year="2026"
        min="2026-07-01"
        max="2026-12-31"
    />
</template>
```

### Custom tile

```vue
<template>
    <OrigamDatePickerMonths v-model:month="month">
        <template #month="{ month: item, props }">
            <origam-btn v-bind="props" :variant="item.value === month ? 'flat' : 'text'"/>
        </template>
    </OrigamDatePickerMonths>
</template>
```
