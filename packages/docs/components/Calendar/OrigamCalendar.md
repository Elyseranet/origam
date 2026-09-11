# OrigamCalendar

Full in-house calendar component. Four views (month, week, day,
agenda), an integrated toolbar with view-switcher, drag-select on
the grid to request new events, and RRULE-driven recurring events.
Zero external dependency — no FullCalendar, no Vue-Cal, no
event-source. SSR-safe.

## The four views

| View       | What you see                                                              |
|------------|---------------------------------------------------------------------------|
| `month`    | 6×7 grid; each cell shows up to 3 event chips with a "+N more" overflow.  |
| `week`     | 7-column vertical timeline; events absolute-positioned by start/duration. |
| `day`      | Same as `week` but for a single day (full width per event).               |
| `agenda`   | Flat list grouped by day. Empty days are skipped.                         |

## Quick start

```vue
<template>
    <origam-calendar
        v-model:view="view"
        v-model:current-date="currentDate"
        :events="events"
        :first-day-of-week="1"
        :time-format="'24h'"
        locale="fr-FR"
        :selectable="true"
        :category-colors="{ meeting: 'primary', focus: 'success' }"
        @event-click="onEventClick"
        @date-click="onDateClick"
        @range-select="onRangeSelect"
        @create-event-request="onCreateRequest"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const view = ref<'month' | 'week' | 'day' | 'agenda'>('month')
    const currentDate = ref(new Date())
    const events = [
        { id: 1, title: 'Standup', start: '2026-05-14T10:00', end: '2026-05-14T10:15', category: 'meeting' }
    ]
</script>
```

## Props

| Prop                | Type                                                          | Default       | Notes                                                              |
|---------------------|---------------------------------------------------------------|---------------|--------------------------------------------------------------------|
| `view`              | `'month' \| 'week' \| 'day' \| 'agenda'`                      | `'month'`     | v-model:view.                                                      |
| `currentDate`       | `Date \| string`                                              | `new Date()`  | v-model:currentDate.                                               |
| `events`            | `IEvent[]`                                                    | `[]`          | Recurring events expanded internally to the visible range.         |
| `firstDayOfWeek`    | `0..6`                                                        | `1`           | 0 = Sunday, 1 = Monday, 6 = Saturday.                              |
| `timeFormat`        | `'12h' \| '24h'`                                              | `'24h'`       | Drives hour-label rendering in week / day views.                   |
| `locale`            | `string`                                                      | auto          | BCP 47 tag — falls back to `<html lang>` and `'en-US'`.            |
| `selectable`        | `boolean`                                                     | `true`        | Enables click + drag-select on cells / slots.                      |
| `eventColorKey`     | `'category' \| 'color' \| string`                             | `'category'`  | Which `IEvent` prop drives the chip colour.                        |
| `categoryColors`    | `Record<string, TIntent \| string>`                           | `{}`          | Map category → intent (token) or raw CSS colour.                   |
| `weekendHighlight`  | `boolean`                                                     | `true`        | Tint Sat/Sun cells.                                                |
| `showWeekNumbers`   | `boolean`                                                     | `false`       | ISO week-number column on the left of the grid.                    |
| `dayStartHour`      | `number`                                                      | `0`           | First hour rendered in week / day views.                           |
| `dayEndHour`        | `number`                                                      | `24`          | Last hour rendered in week / day views.                            |
| `slotDuration`      | `number` (minutes)                                            | `30`          | Granularity of the timeline rows + drag-create resolution.         |
| `minDate`           | `Date \| string`                                              | —             | Lower navigation bound (disables `<`).                             |
| `maxDate`           | `Date \| string`                                              | —             | Upper navigation bound (disables `>`).                             |
| `disabledDates`     | `Array<Date \| string> \| (d: Date) => boolean`               | —             | Cells to grey out.                                                 |

### Cross-cutting surface

Like every other origam component, the calendar carries the standard
Commons surface — consumed through the shared composables, so it paints /
sizes / spaces consistently with the rest of the system.

| Prop          | Type                                              | Default | Notes                                                                |
|---------------|---------------------------------------------------|---------|----------------------------------------------------------------------|
| `bgColor`     | `TIntent \| <css-color>`                          | —       | Paints the **header band** (toolbar + weekday row). Day cells keep their own light surface. |
| `color`       | `TIntent \| <css-color>`                          | —       | Drives the text colour. On the painted header it auto-contrasts; on the day cells it applies directly. |
| `rounded`     | `TRounded \| number \| string \| boolean`         | `8px`   | Corner radius (root). `overflow:hidden` clips the grid to it.        |
| `elevation`   | `number` / shadow rung                            | —       | Drop shadow rung.                                                    |
| `border`      | `'thin' \| 'thick' \| number \| string \| boolean` | `1px`   | Border width.                                                        |
| `borderColor` | `TIntent \| <css-color>`                          | subtle  | Intent keywords resolve to their token.                             |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted' \| …`            | `solid` | Border style.                                                       |
| `density`     | `'default' \| 'compact' \| 'comfortable'`         | —       | Compresses / expands toolbar padding + day-cell height.             |
| `width` / `height` / `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number \| string` | — | Root dimensions. |
| `padding*` / `margin*` | `number \| string`                       | —       | Use a CSS unit (`40px`, `1rem`); a bare number string is ignored.   |

**Contrast is region-aware.** `bgColor` paints only the header band, never
the day cells. The header text always **contrasts that painted surface**
(readability wins), while the day cells — which keep their light surface —
render `color` directly. So `color="primary"` + `bgColor="primary"` gives a
primary header with white text **and** primary-tinted day numbers, instead
of bleeding white text onto the white cells. With no `bgColor`, the header
adopts `color` like the body.

## Emits

| Event                  | Payload                                              | Notes                                                                       |
|------------------------|------------------------------------------------------|-----------------------------------------------------------------------------|
| `update:view`          | `TCalendarView`                                      | Two-way binding for the toolbar tabs.                                       |
| `update:currentDate`   | `Date`                                               | Two-way binding for navigation + keyboard arrows.                           |
| `event-click`          | `(event: IEvent, dom: MouseEvent)`                   | Fires when a chip / timeline event / agenda row is clicked.                 |
| `date-click`           | `(date: Date)`                                       | Fires on a single cell / slot click that wasn't part of a drag.             |
| `range-select`         | `(start: Date, end: Date)`                           | Fires on `mouseup` after a drag spans at least 2 cells / slots.             |
| `create-event-request` | `(start: Date, end: Date)`                           | Convenience alias of `range-select` — wire your "create event" modal here.  |
| `view-change`          | `TCalendarView`                                      | Convenience — re-emits `update:view`.                                       |
| `navigate`             | `'prev' \| 'next' \| 'today'`                        | Fires before the side-effect on `currentDate`.                              |

## `IEvent` interface

```ts
interface IEvent {
    id: string | number
    title: string
    description?: string
    start: string | Date              // ISO 8601 strings accepted
    end?: string | Date
    allDay?: boolean
    category?: string                 // used as the categoryColors key
    color?: TIntent | string          // direct override
    rrule?: string                    // RRULE subset — see below
    metadata?: Record<string, unknown>
}
```

## RRULE subset

`<OrigamCalendar>` ships a minimal in-house RRULE parser. The subset
handles 95% of business-calendar patterns ("every Monday/Wednesday
at 10am", "the 14th of every month", "every 2 weeks until July")
without dragging in `rrule.js`.

| Directive | Supported                              |
|-----------|----------------------------------------|
| `FREQ`    | `DAILY` / `WEEKLY` / `MONTHLY`         |
| `INTERVAL`| Yes                                    |
| `COUNT`   | Yes                                    |
| `UNTIL`   | Yes (`YYYYMMDD` or `YYYYMMDDTHHMMSSZ`) |
| `BYDAY`   | Yes (only for `FREQ=WEEKLY`)           |
| `BYMONTH` | **No** — ignored                       |
| `BYMONTHDAY` | **No** — ignored                    |
| `BYSETPOS`   | **No** — ignored                    |
| `WKST`    | **No** — ignored                       |
| `EXDATE`  | **No** — ignored                       |

A safety net caps expansion at 1 098 occurrences (3 years of daily
events) so a malformed `FREQ=DAILY` without `COUNT` / `UNTIL` can't
run away.

## Composable — `useCalendar`

```ts
import { useCalendar } from '@origam/composables'

const cal = useCalendar(
    {
        events: () => events.value,
        view: () => view.value,
        currentDate: () => currentDate.value,
        firstDayOfWeek: () => 1,
        slotDuration: () => 30,
        dayStartHour: () => 0,
        dayEndHour: () => 24
    },
    (next) => view.value = next,
    (next) => currentDate.value = next
)

cal.visibleDateRange.value       // { start: Date, end: Date }
cal.expandedEvents.value         // events expanded via RRULE + filtered
cal.navigate('next')             // 'prev' | 'next' | 'today'
cal.setView('week')
cal.buildMonthGrid(date)         // Date[][] — 6 × 7
cal.buildWeekGrid(date)          // ICalendarTimeSlot[][] — 7 × N
cal.buildDayGrid(date)           // ICalendarTimeSlot[]
cal.buildAgenda(range?)          // [{ date, events }]
cal.eventsOnDay(date)            // IEvent[]
cal.positionEvent(event, dayStart, pxPerMin)  // { top, height }
```

## Slots

| Slot         | Scoped bindings                                                            | Notes                                                       |
|--------------|----------------------------------------------------------------------------|-------------------------------------------------------------|
| `header`     | `{ title, view, currentDate, navigate, setView }`                          | Replace the built-in toolbar (title + nav + view switcher). |
| `event`      | `{ event, view, isPast, isToday }`                                         | Replace the event card body. Rendered for every visible event in month/week/day/agenda views. |
| `day`        | `{ date, events, isToday, isPast, isOutside, isWeekend }`                  | Replace a month-view day cell content (the date label + events chips). |
| `dayHeader`  | `{ date }`                                                                 | Replace a day header (week / day views).                    |
| `empty`      | `{ view }`                                                                 | Rendered when the agenda view has no events in range.       |

```vue
<origam-calendar :events="events">
    <template #header="{ title, navigate, setView }">
        <my-toolbar :title="title" @prev="navigate('prev')" @next="navigate('next')" />
    </template>

    <template #event="{ event, isPast }">
        <my-event-card :event="event" :dim="isPast" />
    </template>

    <template #day="{ date, events }">
        <my-day-cell :date="date" :events="events" />
    </template>

    <template #dayHeader="{ date }">
        <my-day-header :date="date" />
    </template>

    <template #empty>
        <my-empty-state>Create your first event</my-empty-state>
    </template>
</origam-calendar>
```

## Accessibility

- Root: `role="application"` + `aria-label="Calendar"`.
- Toolbar: `role="toolbar"`.
- View switcher: `role="tablist"` + `role="tab"` + `aria-selected`.
- Day cells: `role="gridcell"` + full `aria-label` (weekday, month, day, year).
- Event chips: `role="button"` + `aria-label` combining title + start time.
- Keyboard:
    - `←` / `→` move the current date by 1 day.
    - `↑` / `↓` move it by 7 days.
    - `Page Up` / `Page Down` move it by 1 month.

## i18n

Weekday and month names come from `Intl.DateTimeFormat(locale, …)`.
Pass the BCP 47 tag via the `locale` prop, or leave it unset and the
calendar will read `<html lang>` (defaulting to `'en-US'`).

Time labels follow `timeFormat` (`'12h'` / `'24h'`). The locale's
AM/PM marker is honoured automatically — passing `locale="fr-FR"`
+ `timeFormat="12h"` will still render `1:00 PM` style labels
because French speakers reading mixed-locale calendars expect it.

## Tokens

Component-level CSS variables live under
`tokens/component/calendar.json`. Override them on
`<OrigamThemeProvider>` or a single instance via inline style.

Notable variables:

- `--origam-calendar---background-color`
- `--origam-calendar__day-cell---bg-color-today`
- `--origam-calendar__day-cell---bg-color-weekend`
- `--origam-calendar__event---bg-color-default`
- `--origam-calendar__timeline---slot-height`
- `--origam-calendar__range-select---bg-color`
- `--origam-calendar__week-number---color`

## Performance

The calendar is intentionally **un-virtualised**. The 42-cell month
grid is always rendered (≈ 50ms paint cost). The week view emits
`24 × 2 = 48` slot rows × 7 cols = 336 nodes; the day view caps at
48 rows.

For schedules with ≥ 500 distinct events per visible window:

1. Pre-filter `events` in the parent (the calendar will still expand
   recurring events to the visible window — but smaller `events`
   means less to expand).
2. Consider switching to the `agenda` view (no grid math, no
   absolute-positioning maths per event).

A virtualised week timeline is on the roadmap but isn't a v1
concern.
