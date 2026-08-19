import type { TCalendarStrategy } from "../../types"

/*********************************************************
 * ICalendarProps / IDay
 *
 * @description
 * Despite the name, this surface has nothing to do with the
 * `<OrigamCalendar>` component (its own props live in
 * `interfaces/Calendar/calendar.interface.ts` as
 * `ICalendarComponentProps` — a much larger, unrelated event-calendar
 * surface). This one is the day-grid mixin consumed exclusively by
 * `useDatePickerCalendar` (`composables/Commons/date-picker-calendar.
 * composable.ts`) and `<OrigamDatePickerMonth>`
 * (`interfaces/DatePicker/date-picker-month.interface.ts`).
 *
 * @description
 * Issue #364 relocated it from `interfaces/Commons/calendar.
 * interface.ts` to this DatePicker-only home — it was never
 * transverse, it was misfiled under a name that collided with the
 * unrelated Calendar family.
 ********************************************************/
export interface ICalendarProps {
    allowedDates?: Array<unknown> | ((date: unknown) => boolean)
    disabled?: boolean
    displayValue?: unknown
    date?: ReadonlyArray<unknown> | Array<unknown>
    month?: number
    max?: unknown
    min?: unknown
    showAdjacentMonths?: boolean
    year?: number
    weekdays?: Array<number>
    weeksInMonth?: TCalendarStrategy
    firstDayOfWeek?: number
}

export interface IDay {
    date: unknown
    isoDate: string
    formatted: string
    year: number
    month: number
    isDisabled: boolean
    isWeekStart: boolean
    isWeekEnd: boolean
    isToday: boolean
    isAdjacent: boolean
    isHidden: boolean
    isStart: boolean
    isSelected: boolean
    isEnd: boolean
    isSame: boolean
    localized: string
}
