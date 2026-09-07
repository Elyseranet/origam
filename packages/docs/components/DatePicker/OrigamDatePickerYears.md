# OrigamDatePickerYears

`<OrigamDatePickerYears>` is the year-picking panel of
[`<OrigamDatePicker>`](./OrigamDatePicker.md): a scrollable 3-column grid of
year tiles, each rendered as an `<OrigamBtn>`. It is what the picker swaps in
when `viewMode` becomes `'years'`.

## Basic usage

```vue
<template>
    <OrigamDatePickerYears v-model:year="year" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const year = ref(2026)
</script>
```

## Props

### Value

| Prop | Type | Default | Description |
|---|---|---|---|
| `year` | `number` | current year | Selected year. Two-way (`v-model:year`), coerced through `int()` |

### Range

| Prop | Type | Default | Description |
|---|---|---|---|
| `min` | `unknown` | current year − 100 | First year in the list — its **year** is taken, the rest of the date is ignored |
| `max` | `unknown` | current year + 52 | Last year in the list |

Unlike the months panel, these do not disable tiles: they define which years
are rendered at all. Without them the list spans 153 years.

### Color

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Passed to the **selected** tile's `<OrigamBtn>` only |

Unselected tiles always render with the button's default colour.

### Dimension

All six come from `IDimensionProps` and are consumed through
`useDimension(props)`, which emits inline declarations on the root.

| Prop | Type | Default | Description |
|---|---|---|---|
| `height` | `string \| number` | `288px` (from the stylesheet) | Panel height — this is the scroll viewport |
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
| `update:year` | `number` | The year the user picked |

⚠️ Two different paths reach it. Clicking a **different** year writes to the
`useVModel`-backed model, whose setter emits `update:year`. Clicking the
**already-selected** year emits `update:year` directly without changing the
model — that is how `<OrigamDatePicker>` learns to leave the years view on a
confirming second click.

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `year` | `{ year: IDatePickerYearsItem, index: number, props: IDatePickerYearsButtonProps }` | Replaces the default tile. `props` is the complete pre-wired `<OrigamBtn>` binding (`ref`, `active`, `color`, `rounded`, `text`, `key`, `onClick`) — spread it and both selection and the mount-time scroll keep working |

`year` carries `{ text, value }`; `text` is the adapter's `year` format.

⚠️ `props.ref` is only set on the currently-selected tile — it is what
`scrollIntoView` targets. Spread `props` rather than picking fields out of it,
or the panel will open at the top of the list instead of on the current year.
It is typed `unknown` on purpose: Vue treats a `ref` key on a spread object as
a reserved vnode binding and rewrites its type, so the concrete
`templateRef()` type never survives the template boundary. The field exists to
be spread, not to be read.

## Behaviour notes

- **Scroll into view on mount.** `onMounted` + `nextTick`, then
  `scrollIntoView({ block: 'center' })` on the selected tile, so the panel
  opens centred on the current year rather than 100 years in the past.
- **Layout.** `grid-template-columns: repeat(3, 1fr)` with an `8px 24px` gap
  and `32px` of inline padding, inside a `288px`-tall `overflow-y: scroll`
  viewport.
- **No disabled state.** `IDatePickerYearsItem` has no `isDisabled` — bounds
  shorten the list instead of greying tiles out.
- **Self-healing model.** A `watchEffect` re-seeds the model with the current
  year whenever it would otherwise be `null` / `undefined`.

## Exposed instance API

`defineExpose` publishes `filterProps`, `css`, `id`, `load`, `unload` and
`isLoaded` — the standard `useStyle` / `useProps` surface.

## Examples

### A decade, in a shorter panel

```vue
<template>
    <OrigamDatePickerYears
        v-model:year="year"
        min="2020-01-01"
        max="2029-12-31"
        height="180"
    />
</template>
```

### Custom tile

```vue
<template>
    <OrigamDatePickerYears v-model:year="year">
        <template #year="{ year: item, props }">
            <origam-btn v-bind="props" :text="`'${String(item.value).slice(2)}`"/>
        </template>
    </OrigamDatePickerYears>
</template>
```
