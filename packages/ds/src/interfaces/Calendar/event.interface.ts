import type { TIntent } from '../../types'

/**
 * Public event shape consumed by `<OrigamCalendar>` and the
 * `useCalendar` composable. Designed to be friendly to JSON
 * round-trips — `start` / `end` may be passed as ISO-8601 strings,
 * Date objects, or epoch numbers; the calendar normalises them
 * internally.
 *
 * `rrule` follows a strict subset of RFC 5545 (see
 * `src/utils/Calendar/rrule.util.ts`): `FREQ=DAILY|WEEKLY|MONTHLY`
 * + `INTERVAL=N` + `COUNT=N` + `UNTIL=...` + `BYDAY=...`. Anything
 * else is ignored — flag this in the consumer-facing doc.
 */
export interface IEvent {
    /** Stable identifier — used as `:key` and for click-target wiring. */
    id: string | number
    /** Displayed title — also read by the default `aria-label`. */
    title: string
    /** Optional long-form description — surfaced in the agenda view. */
    description?: string
    /** Start instant. ISO-8601 strings and `Date` instances both work. */
    start: string | Date
    /**
     * End instant. Omitted when `allDay=true` (the calendar treats the
     * event as a single-day block) or for "point-in-time" events with
     * no measurable duration.
     */
    end?: string | Date
    /**
     * `true` to render the event in the all-day band above the time
     * grid (week / day views). Has no effect in month view.
     */
    allDay?: boolean
    /**
     * Free-form category string — used as the lookup key for
     * `categoryColors`. Useful when multiple events share a colour
     * (e.g. "meeting", "focus", "personal").
     */
    category?: string
    /**
     * Direct colour override. Wins over `category` when both are set.
     * Accepts a `TIntent` (matches the design-token rail) or any CSS
     * colour string.
     */
    color?: TIntent | string
    /**
     * RRULE subset string. The calendar expands the recurrence to
     * the visible range at render time; the original event is **not**
     * mutated.
     */
    rrule?: string
    /** Free-form metadata — passed through to the `event-click` payload. */
    metadata?: Record<string, unknown>
}
