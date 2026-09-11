import OrigamCalendar from '../../components/Calendar/OrigamCalendar.vue'
import { CALENDAR_NAVIGATE, CALENDAR_TIME_FORMAT, CALENDAR_VIEW } from '../../enums/Calendar/calendar.enum'

export type TOrigamCalendar = InstanceType<typeof OrigamCalendar>

/**
 * Clock format for time labels in week / day / agenda views.
 *
 * `'24h'` — 00:00 → 23:59. Default for everywhere except en-US.
 * `'12h'` — 12:00 AM → 11:59 PM. Honours locale-specific AM/PM.
 */
export type TCalendarTimeFormat = `${CALENDAR_TIME_FORMAT}`

/**
 * Navigation direction passed to `useCalendar().navigate(...)` and
 * the `navigate` event. `'today'` jumps to "now" regardless of the
 * current view.
 */
export type TCalendarNavigate = `${CALENDAR_NAVIGATE}`

/**
 * Top-level view modes supported by `<OrigamCalendar>`.
 *
 * - `'month'` — 6×7 day grid; the canonical "month at a glance" view.
 * - `'week'`  — 7-column vertical timeline with one row per slot.
 * - `'day'`   — single-column vertical timeline (zoom into one day).
 * - `'agenda'`— flat list grouped by day, useful for screen readers
 *               and dense schedules.
 */
export type TCalendarView = `${CALENDAR_VIEW}`
