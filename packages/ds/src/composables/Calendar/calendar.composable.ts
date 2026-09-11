import { computed, type ComputedRef } from 'vue'

import type {
    IEvent,
    IUseCalendarOptions
} from '../../interfaces'

import type {
    TCalendarNavigate,
    TCalendarView
} from '../../types'

import {
    addDays,
    addMonths,
    addWeeks,
    buildMonthMatrix,
    diffMinutes,
    endOfMonth,
    endOfWeekFixed,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    startOfDay,
    startOfMonth,
    startOfWeekFixed,
    toDate
} from '../../utils/Calendar/date.util'

import { expandRecurrence } from '../../utils/Calendar/rrule.util'

/**
 * Time-slot descriptor returned by `buildDayGrid` / `buildWeekGrid`.
 *
 * The grid is **not** event-aware — events are positioned absolutely
 * on top of the timeline using `diffMinutes(dayStart, event.start)`.
 * Decoupling the grid from the events lets us re-use the grid output
 * for the drag-select overlay without re-computing.
 */
export interface ICalendarTimeSlot {
    /** Top-of-slot Date (e.g. 09:30). */
    date: Date
    /** Slot duration in minutes (mirror of `options.slotDuration`). */
    durationMin: number
    /** True when the slot's hour mark falls on the hour. */
    isHourMark: boolean
}

/**
 * Agenda entry — one per day that has at least one event in the
 * visible window. Agenda view skips empty days; the `#empty` slot
 * fires when *no* event is in range.
 */
export interface ICalendarAgendaEntry {
    date: Date
    events: Array<IEvent>
}

/**
 * Internal navigation step lookup. Reads cleaner than a `switch`
 * inside `navigate(...)`.
 */
const NAVIGATION_STEP: Record<
    TCalendarView,
    (date: Date, direction: 1 | -1) => Date
> = {
    month: (date, direction) => addMonths(date, direction),
    week: (date, direction) => addWeeks(date, direction),
    day: (date, direction) => addDays(date, direction),
    agenda: (date, direction) => addMonths(date, direction)
}

/**
 * Public composable. Stateless over the inputs (every getter is a
 * `() => …` thunk), so `<OrigamCalendar>` can drive it from props or
 * a parent store without re-instantiation.
 *
 * Methods (`navigate`, `setView`, `buildXxxGrid`) are intentionally
 * **not** wrapped in computeds — they're pure functions / side-effect
 * channels. The reactive surface is `expandedEvents` +
 * `visibleDateRange`, which depend on every input thunk.
 */
export function useCalendar (
    options: IUseCalendarOptions,
    setView?: (view: TCalendarView) => void,
    setCurrentDate?: (date: Date) => void
) {
    /**
     * Visible date range based on the current view. Used to filter
     * events and decide where to point the recurrence expander.
     * - `month`: first/last day of the month grid (6 weeks).
     * - `week`: snapped Sunday/Monday → Saturday/Sunday.
     * - `day`: that day's 00:00 → 23:59:59.
     * - `agenda`: same as month (we show one month worth of events).
     */
    const visibleDateRange: ComputedRef<{ start: Date, end: Date }> = computed(() => {
        const view = options.view()
        const date = options.currentDate()
        const firstDayOfWeek = options.firstDayOfWeek()
        switch (view) {
            case 'month':
            case 'agenda': {
                const monthStart = startOfMonth(date)
                const gridStart = startOfWeekFixed(monthStart, firstDayOfWeek)
                // The month grid always renders 6 rows × 7 cols so the
                // calendar height stays stable across short months.
                const gridEnd = addDays(gridStart, 6 * 7 - 1)
                return { start: gridStart, end: gridEnd }
            }
            case 'week':
                return {
                    start: startOfWeekFixed(date, firstDayOfWeek),
                    end: endOfWeekFixed(date, firstDayOfWeek)
                }
            case 'day':
            default: {
                const start = startOfDay(date)
                const end = new Date(start)
                end.setHours(23, 59, 59, 999)
                return { start, end }
            }
        }
    })

    /**
     * Events expanded via RRULE + filtered to the visible range +
     * sorted by `start` ascending. Sorting is stable on `id` so
     * concurrent events appear in a deterministic order.
     */
    const expandedEvents: ComputedRef<Array<IEvent>> = computed(() => {
        const range = visibleDateRange.value
        const raw = options.events()
        const out: Array<IEvent> = []
        for (const event of raw) {
            for (const occ of expandRecurrence(event, range)) {
                out.push(occ)
            }
        }
        out.sort((a, b) => {
            const aTime = toDate(a.start)?.getTime() ?? 0
            const bTime = toDate(b.start)?.getTime() ?? 0
            if (aTime !== bTime) return aTime - bTime
            return String(a.id).localeCompare(String(b.id))
        })
        return out
    })

    /**
     * `navigate('prev' | 'next' | 'today')` — emits the change via
     * the optional `setCurrentDate` callback. Bound bidirectionally
     * to the `v-model:currentDate` in `<OrigamCalendar>`.
     */
    function navigate (direction: TCalendarNavigate): void {
        const view = options.view()
        const current = options.currentDate()
        let next: Date
        if (direction === 'today') {
            next = new Date()
        } else {
            const step = direction === 'next' ? 1 : -1
            next = NAVIGATION_STEP[view](current, step)
        }
        // Clamp to min/max.
        const min = options.minDate?.() ?? null
        const max = options.maxDate?.() ?? null
        if (min && isBefore(next, min)) next = new Date(min.getTime())
        if (max && isAfter(next, max)) next = new Date(max.getTime())
        setCurrentDate?.(next)
    }

    function setViewProxy (next: TCalendarView): void {
        setView?.(next)
    }

    /**
     * Build the 6×7 day matrix for the month view. Returned dates are
     * **midnight-local** so callers can compare via `isSameDay`
     * without time-of-day surprises.
     */
    function buildMonthGrid (date: Date): Array<Array<Date>> {
        return buildMonthMatrix(date, options.firstDayOfWeek())
    }

    /**
     * Build one column of the week timeline — i.e. the day's slot
     * list. Caller maps the column index to a date via
     * `addDays(weekStart, columnIndex)` then calls this function.
     */
    function buildDayGrid (date: Date): Array<ICalendarTimeSlot> {
        const startHour = options.dayStartHour()
        const endHour = options.dayEndHour()
        const slotDuration = options.slotDuration()
        const slots: Array<ICalendarTimeSlot> = []
        const base = startOfDay(date)
        const totalMinutes = (endHour - startHour) * 60
        for (let offsetMin = 0; offsetMin < totalMinutes; offsetMin += slotDuration) {
            const slotDate = new Date(base)
            slotDate.setHours(startHour, 0, 0, 0)
            slotDate.setMinutes(slotDate.getMinutes() + offsetMin)
            slots.push({
                date: slotDate,
                durationMin: slotDuration,
                isHourMark: slotDate.getMinutes() === 0
            })
        }
        return slots
    }

    /**
     * Build the full week timeline — 7 columns, each one a day grid.
     * Wraps `buildDayGrid` for ergonomic consumption in the SFC.
     */
    function buildWeekGrid (date: Date): Array<Array<ICalendarTimeSlot>> {
        const firstDayOfWeek = options.firstDayOfWeek()
        const start = startOfWeekFixed(date, firstDayOfWeek)
        const columns: Array<Array<ICalendarTimeSlot>> = []
        for (let i = 0; i < 7; i++) {
            columns.push(buildDayGrid(addDays(start, i)))
        }
        return columns
    }

    /**
     * Build the agenda — events grouped by day, sorted by day ASC.
     * The day list reflects the current visible range (one month).
     */
    function buildAgenda (range?: { start: Date, end: Date }): Array<ICalendarAgendaEntry> {
        const effectiveRange = range ?? visibleDateRange.value
        const map = new Map<string, ICalendarAgendaEntry>()
        for (const event of expandedEvents.value) {
            const start = toDate(event.start)
            if (!start) continue
            if (start.getTime() < effectiveRange.start.getTime()) continue
            if (start.getTime() > effectiveRange.end.getTime()) continue
            const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`
            if (!map.has(key)) {
                map.set(key, { date: startOfDay(start), events: [] })
            }
            map.get(key)!.events.push(event)
        }
        return [...map.values()].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        )
    }

    /**
     * Compute the events that intersect a given day. Used by both the
     * month grid (chip list) and the day/week views (positioning).
     */
    function eventsOnDay (day: Date): Array<IEvent> {
        return expandedEvents.value.filter((event) => {
            const start = toDate(event.start)
            if (!start) return false
            const end = event.end ? toDate(event.end) : start
            if (!end) return false
            return isSameDay(start, day)
                || isSameDay(end, day)
                || (isBefore(start, day) && isAfter(end, day))
        })
    }

    /**
     * Vertical positioning of an event on the week / day timeline.
     * Returns `{ top, height }` in pixels assuming each minute
     * occupies 1 unit — the SFC scales it by the CSS-driven slot
     * height so the timeline stays responsive without JS resize
     * observers.
     */
    function positionEvent (event: IEvent, dayStart: Date, pxPerMin: number): { top: number, height: number } | null {
        const start = toDate(event.start)
        if (!start) return null
        const end = event.end ? toDate(event.end) : new Date(start.getTime() + 30 * 60000)
        if (!end) return null
        const top = Math.max(0, diffMinutes(dayStart, start) * pxPerMin)
        const height = Math.max(pxPerMin * 15, diffMinutes(start, end) * pxPerMin)
        return { top, height }
    }

    return {
        visibleDateRange,
        expandedEvents,
        navigate,
        setView: setViewProxy,
        buildMonthGrid,
        buildWeekGrid,
        buildDayGrid,
        buildAgenda,
        eventsOnDay,
        positionEvent,
        // Re-export low-level helpers so consumers don't have to
        // import them separately when extending the calendar surface.
        helpers: {
            isSameDay,
            isSameMonth,
            startOfDay,
            startOfMonth,
            endOfMonth,
            addDays,
            addMonths,
            addWeeks,
            diffMinutes,
            toDate
        }
    }
}
