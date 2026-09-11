import type { TCalendarStrategy } from "../../types"

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
