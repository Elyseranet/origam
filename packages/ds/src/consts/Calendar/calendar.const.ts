/*********************************************************
 * CALENDAR_MONTH_GRID_WEEKS
 *
 * @description
 * Number of week rows the month grid always renders. Fixed at 6 so the
 * calendar height stays stable across short months (February starting
 * on a Monday needs 4 rows, a 31-day month starting on a Sunday needs 6).
 ********************************************************/
export const CALENDAR_MONTH_GRID_WEEKS = 6

/*********************************************************
 * CALENDAR_DAYS_PER_WEEK
 *
 * @description
 * Days in a week row. Used both to size the month matrix and to loop
 * the week-timeline columns.
 ********************************************************/
export const CALENDAR_DAYS_PER_WEEK = 7

/*********************************************************
 * CALENDAR_MINUTES_PER_HOUR
 *
 * @description
 * Minutes in an hour. Used to convert the `dayStartHour` / `dayEndHour`
 * props into the total minute span the day timeline covers.
 ********************************************************/
export const CALENDAR_MINUTES_PER_HOUR = 60

/*********************************************************
 * CALENDAR_MS_PER_MINUTE
 *
 * @description
 * Milliseconds in a minute — the unit `Date.getTime()` arithmetic works
 * in when deriving an event end from a duration in minutes.
 ********************************************************/
export const CALENDAR_MS_PER_MINUTE = 60000

/*********************************************************
 * CALENDAR_DEFAULT_EVENT_DURATION_MIN
 *
 * @description
 * Duration (in minutes) assumed for an event that declares a `start`
 * but no `end`. Matches the default slot length of most calendar UIs.
 ********************************************************/
export const CALENDAR_DEFAULT_EVENT_DURATION_MIN = 30

/*********************************************************
 * CALENDAR_MIN_EVENT_HEIGHT_MIN
 *
 * @description
 * Floor (in minutes) applied to an event's rendered height on the
 * week / day timeline. Without it, a 1-minute event collapses to a
 * hairline that is impossible to click.
 ********************************************************/
export const CALENDAR_MIN_EVENT_HEIGHT_MIN = 15
