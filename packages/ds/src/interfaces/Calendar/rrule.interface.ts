/**
 * Normalized form of the RRULE subset understood by
 * `src/utils/Calendar/rrule.util.ts`.
 *
 * Only the directives the parser actually honours are modelled here —
 * `FREQ`, `INTERVAL`, `COUNT`, `UNTIL` and `BYDAY`. Everything else in
 * RFC 5545 is dropped at parse time, so a value of this shape is a
 * complete description of what the expander will do.
 *
 * The name is `ICalendarParsedRule` rather than a bare `IParsedRule`
 * because `src/interfaces/index.ts` is a flat `export *` barrel — an
 * unqualified name there reads as a repo-wide concept and is a
 * collision waiting to happen.
 */
export interface ICalendarParsedRule {
    /** Recurrence frequency. The parser rejects any other `FREQ` value. */
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    /** `INTERVAL=N`, defaulted to 1 when absent. */
    interval: number
    /** `COUNT=N` occurrence cap, or `null` when unbounded. */
    count: number | null
    /** `UNTIL=` cut-off date, or `null` when unbounded. */
    until: Date | null
    /** `BYDAY=` as JS day indices (0 = Sunday). `WEEKLY` only; else `null`. */
    byDay: Array<number> | null
}
