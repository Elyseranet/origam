/**
 * Top-level view modes supported by `<OrigamCalendar>`.
 *
 * - `'month'` — 6×7 day grid; the canonical "month at a glance" view.
 * - `'week'`  — 7-column vertical timeline with one row per slot.
 * - `'day'`   — single-column vertical timeline (zoom into one day).
 * - `'agenda'`— flat list grouped by day, useful for screen readers
 *               and dense schedules.
 */
export type TCalendarView = 'month' | 'week' | 'day' | 'agenda'
