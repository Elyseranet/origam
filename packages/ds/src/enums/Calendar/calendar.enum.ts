/**
 * Top-level view modes supported by `<OrigamCalendar>`. See
 * `TCalendarView` (types/Calendar/calendar.type.ts) for the per-value
 * rendering rationale.
 */
export enum CALENDAR_VIEW {
    MONTH = 'month',
    WEEK = 'week',
    DAY = 'day',
    AGENDA = 'agenda'
}

/**
 * Navigation direction passed to `useCalendar().navigate(...)` and the
 * `navigate` event. `TODAY` jumps to "now" regardless of the current
 * view.
 */
export enum CALENDAR_NAVIGATE {
    PREV = 'prev',
    NEXT = 'next',
    TODAY = 'today'
}

/**
 * Clock format for time labels in week / day / agenda views.
 */
export enum CALENDAR_TIME_FORMAT {
    H12 = '12h',
    H24 = '24h'
}
