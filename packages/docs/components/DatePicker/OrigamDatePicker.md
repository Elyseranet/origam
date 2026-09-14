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
| `multiple` | `boolean \| number \| string` | `false` | Allow selecting multiple dates. A `number` caps how many dates may be selected |
| `range` | `boolean` | `false` | Allow selecting a date range (start + end) |

### Keyboard modifiers are required

`multiple` and `range` do **not** change what a plain click does — a click with
no modifier always replaces the selection with the single day clicked. The
modifiers are read in `<OrigamDatePickerMonth>`'s click handler:

| Gesture | Behaviour |
|---|---|
| click | Selects that day alone (whatever `multiple` / `range` are set to) |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + click, with `multiple` | Toggles that day in/out of the selection |
| <kbd>Shift</kbd> + click, with `multiple` or `range` | Extends to a contiguous range |

When `multiple` is a number, every unselected day is disabled once that many
dates are selected.

## Navigation constraints

```vue
<template>
    <OrigamDatePicker v-model="date" min="2024-01-01" max="2024-12-31" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `min` | `unknown` | Earliest selectable date — anything the active date adapter accepts (ISO 8601 string, `Date`, …) |
| `max` | `unknown` | Latest selectable date — same accepted shapes as `min` |
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

| Token | Default | Description |
|---|---|---|
| `--origam-date-picker---width` | `328px` | Width of the picker |
| `--origam-date-picker--show-week---width` | `368px` | Width applied instead when `showWeek` is on |

Both are declared in `packages/ds/src/assets/css/tokens/light.css` and its
`dark.css` twin, and read by the `.origam-date-picker` /
`.origam-date-picker--show-week` rules. Override them on any ancestor to
re-size every picker at once.
