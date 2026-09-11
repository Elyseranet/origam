# OrigamDatePicker

`<OrigamDatePicker>` is a self-contained calendar widget. It supports single date, multiple dates, and range selection. The view can be navigated across days, months, and years.

## Basic usage

```vue
<template>
    <OrigamDatePicker v-model="date" />
</template>

<script setup>
import { ref } from 'vue'
const date = ref(null)
</script>
```

## Selection modes

```vue
<template>
    <!-- Range selection -->
    <OrigamDatePicker v-model="dates" range />
    <!-- Multiple selection -->
    <OrigamDatePicker v-model="dates" multiple />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `string \| Date \| Array<string \| Date>` | `undefined` | Selected date(s) |
| `multiple` | `boolean` | `false` | Allow selecting multiple dates |
| `range` | `boolean` | `false` | Allow selecting a date range (start + end) |

## Navigation constraints

```vue
<template>
    <OrigamDatePicker v-model="date" min="2024-01-01" max="2024-12-31" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `min` | `string` | Earliest selectable date (ISO 8601) |
| `max` | `string` | Latest selectable date (ISO 8601) |
| `month` | `number` | Override the displayed month (0–11) |
| `year` | `number` | Override the displayed year |

## View mode

| Prop | Type | Default | Description |
|---|---|---|---|
| `viewMode` | `TDateMode` | `'month'` | Active view: `'month'` \| `'months'` \| `'years'` |
| `showWeek` | `boolean` | `false` | Show week numbers alongside the grid |
| `weeksInMonth` | `TCalendarStrategy` | `'static'` | Week-count strategy |

## Disabled controls

| Prop | Type | Description |
|---|---|---|
| `disabled` | `boolean` | Disable all controls |
| `disabledMonth` | `boolean` | Disable the month mode toggle |
| `disabledYear` | `boolean` | Disable the year mode toggle |
| `disabledNext` | `boolean` | Disable the "next month" arrow |
| `disabledPrev` | `boolean` | Disable the "previous month" arrow |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `title` | — | Custom title area |
| `header` | `{ header, transition }` | Full header override |
| `default` | — | Replaces the entire picker body |
| `actions` | — | Footer actions (confirm / cancel) |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string \| Date \| Array<...>` | Fires when the date selection changes |
| `update:month` | `number` | Fires when the displayed month changes |
| `update:year` | `number` | Fires when the displayed year changes |
| `update:viewMode` | `TDateMode` | Fires when the view mode switches |

## Design tokens

| Token | Description |
|---|---|
| `--origam-date-picker---width` | Default width (`328px`) |
| `--origam-date-picker--show-week---width` | Width when week numbers visible (`368px`) |
