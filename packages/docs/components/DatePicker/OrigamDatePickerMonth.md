# OrigamDatePickerMonth

`<OrigamDatePickerMonth>` is the day grid of
[`<OrigamDatePicker>`](./OrigamDatePicker.md): an optional week-number column,
an optional weekday header row, and one cell per day rendered as an
`<OrigamBtn>`. It owns the selection logic (single, multiple, range) and
pushes the result up through `update:date`.

It renders inside `<OrigamDatePicker>` automatically; you use it directly when
you want a bare month grid with no chrome.

## Basic usage

```vue
<template>
    <OrigamDatePickerMonth v-model:date="dates" :month="4" :year="2026" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const dates = ref<Array<string>>([])
</script>
```

## Props

### Calendar

| Prop | Type | Default | Description |
|---|---|---|---|
| `month` | `number` | current month | Displayed month, `0`–`11`. Two-way through `useVModel` |
| `year` | `number` | current year | Displayed year. Two-way through `useVModel` |
| `firstDayOfWeek` | `number` | `undefined` (read as `0`) | Weekday the grid starts on (`0` = Sunday) |
| `weekdays` | `number[]` | `[0, 1, 2, 3, 4, 5, 6]` | Which weekday columns to render, before the `firstDayOfWeek` rotation. Days whose weekday is absent are filtered out of the grid entirely |
| `weeksInMonth` | `TCalendarStrategy` | `'dynamic'` | `'static'` always pads the grid to 6 × 7 cells with days of the following month; `'dynamic'` renders only the weeks the month occupies. ⚠️ `<OrigamDatePicker>` defaults this to `'static'` instead |
| `showAdjacentMonths` | `boolean` | `undefined` | Render the leading / trailing days of neighbouring months. When off, those cells are still laid out but hidden (`opacity: 0`), so the grid keeps its shape |
| `displayValue` | `unknown` | — | Forces which date the grid centres on when `month` / `year` are unset. Resolution order: `displayValue` → first selected date → `min` → first entry of `allowedDates` → today |

### Selection

| Prop | Type | Default | Description |
|---|---|---|---|
| `date` | `unknown[]` | `[]` | The selected day(s). This is the component's v-model — `v-model:date` |
| `multiple` | `boolean \| number \| string` | `undefined` | Enables multi-selection. A `number` (or numeric string) caps it: once that many dates are selected, every unselected day is disabled |
| `range` | `boolean` | `undefined` | Enables contiguous range selection |

Gestures are modifier-driven, in `handleClick`:

| Gesture | Behaviour |
|---|---|
| click | Selects that day alone, regardless of `multiple` / `range` |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + click, with `multiple` | Toggles the day in and out of the selection |
| <kbd>Shift</kbd> + click, with `multiple` or `range` | Fills a contiguous range from the current start |

### Bounds

| Prop | Type | Default | Description |
|---|---|---|---|
| `min` | `unknown` | — | Days strictly before it are disabled |
| `max` | `unknown` | — | Days strictly after it are disabled |
| `allowedDates` | `unknown[] \| ((date: unknown) => boolean)` | — | Array form: only the listed days stay enabled. Function form: a day is enabled when the predicate returns `true`. An **empty array** is ignored, not treated as "nothing allowed" |
| `disabled` | `boolean` | `undefined` | Disables every day |

### Layout

| Prop | Type | Default | Description |
|---|---|---|---|
| `showWeek` | `boolean` | `undefined` | Renders the week-number column on the left |
| `hideWeekdays` | `boolean` | `undefined` | Hides the weekday header row (and the blank spacer at the top of the week column) |

### Transitions

| Prop | Type | Default | Description |
|---|---|---|---|
| `transition` | `TTransitionProps` | `{ component: OrigamTranslatePicker }` | Used when moving forward in time |
| `reverseTransition` | `TTransitionProps` | `{ component: OrigamReverseTranslatePicker }` | Used when moving backward. The direction is detected by comparing the first day of the new grid with the previous one |

### Color

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground only (`IColorProps`) |

Repaints the month grid's text: weekday labels, week numbers, and the day
labels. A `TIntent` value resolves to the intent's **own** hue (`fgSubtle`); a
raw CSS colour is passed through untouched. Gradients are not supported on
this prop.

```vue
<origam-date-picker-month :month="4" :year="2026" color="primary"/>
```

Unlike most components, the value is not emitted as a `color:` declaration on
the root — it feeds two custom properties instead,
`--origam-date-picker__day---color` (read by every `&__day` cell) and
`--origam-btn---color` (read by the `<origam-btn>` that renders a day label).
Both of those elements declare their own `color`, so a value set on the root,
which acts only by inheritance, would never reach them. Setting the tokens is
what makes the prop actually paint — and it leaves the selected day alone,
which keeps its own `--origam-date-picker__day---color-selected`.

Consequence for `:style` overrides: to force a colour on a single instance,
set the token rather than the property.

```vue
<origam-date-picker-month :style="{ '--origam-date-picker__day---color': '#ff0080' }"/>
```

### Commons

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Forwarded to the root element and to the `useStyle` scope |
| `class` | `string \| string[] \| object` | `undefined` | Appended to the root class list |
| `style` | `StyleValue` | `undefined` | Appended after the colour custom properties |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:date` | `unknown[]` | The selection changed. Every click handler writes to the `useVModel`-backed `date` model, whose setter emits this |

`year` and `month` are wired through `useVModel` in the same composable, so
`update:year` / `update:month` exist at the Vue runtime level — but this
component only ever **reads** them. They are deliberately absent from
`IDatePickerMonthEmits`: declaring them would document an event this component
never fires.

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `days` | `{ props: { onClick }, item: IDay, index: number }` | Replaces the default `<OrigamBtn>` for one day cell. `props` is pre-wired — spread it onto any element and selection keeps working. `item` carries the full `IDay` record (`isSelected`, `isToday`, `isAdjacent`, `isDisabled`, `localized`, `isoDate`, …) |

The cell wrapper is always laid out, but its content — slot or default
button — is only rendered when `showAdjacentMonths` is on or the day belongs
to the displayed month. An adjacent day with `showAdjacentMonths` off is
therefore an empty cell, not a missing column.

## Behaviour notes

- **Cell classes.** Each cell carries `origam-date-picker-month__day` plus, as
  applicable, `--adjacent`, `--hide-adjacent`, `--selected`, `--today`,
  `--week-start`, `--week-end`. A cell also exposes `data-v-date` with the ISO
  date, omitted when the day is disabled.
- **Range fill.** The band between two selected days is drawn by `::after` /
  `::before` pseudo-elements on consecutive `--selected` cells, so it survives
  the grid gap without extra markup.
- **Default day button.** Rendered with `density="comfortable"`, `icon`,
  `ripple={false}`, `active` bound to `item.isSelected` and `border` to
  `item.isToday`.
- **`rem` and the teleport bridge.** The three font-size tokens are read
  generic-first (`var(--origam-…, .85rem)`) rather than written as literals so
  `<OrigamDatePickerField>` can republish the typography scale onto its
  teleported surface — see `useTeleportTypography`.

## Design tokens

| Token | Default | Description |
|---|---|---|
| `--origam-date-picker__day---size` | `40px` | Height of a day cell |
| `--origam-date-picker__day---color` | `var(--origam-color__text---primary)` | Day label colour — this is what the `color` prop writes |
| `--origam-date-picker__day---background-color` | `transparent` | Cell background |
| `--origam-date-picker__day---background-color-selected` | `var(--origam-color__action--primary---bg)` | Selected day background |
| `--origam-date-picker__day---color-selected` | `var(--origam-color__action--primary---fg)` | Selected day label |
| `--origam-date-picker__day---background-color-in-range` | `var(--origam-color__surface---overlay)` | Band drawn between two selected days |
| `--origam-date-picker-month__weeks---font-size` | `0.85rem` | Week-number column |
| `--origam-date-picker-month__weekday---font-size` | `0.85rem` | Weekday header row |
| `--origam-date-picker-month__day---font-size` | `0.85rem` | Day label inside the button |

## Exposed instance API

`defineExpose` publishes `filterProps`, `css`, `id`, `load`, `unload` and
`isLoaded` — the standard `useStyle` / `useProps` surface.

## Examples

### Week numbers, Monday first, no adjacent days

```vue
<template>
    <OrigamDatePickerMonth
        v-model:date="dates"
        :month="month"
        :year="year"
        :first-day-of-week="1"
        show-week
    />
</template>
```

### Weekdays only, capped at three dates

```vue
<template>
    <OrigamDatePickerMonth
        v-model:date="dates"
        :multiple="3"
        :allowed-dates="isWeekday"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dates = ref<Array<unknown>>([])
const isWeekday = (date: unknown) => {
    const day = new Date(date as string).getDay()
    return day !== 0 && day !== 6
}
</script>
```

### Custom day rendering

```vue
<template>
    <OrigamDatePickerMonth v-model:date="dates">
        <template #days="{ props, item }">
            <button v-bind="props" :class="{ busy: isBusy(item.isoDate) }">
                {{ item.localized }}
            </button>
        </template>
    </OrigamDatePickerMonth>
</template>
```
