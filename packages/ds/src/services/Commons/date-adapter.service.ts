import type { IDateAdapter } from "../../interfaces"

import type { TCustomDateFormat } from "../../types"

import {
    addDays,
    addHours,
    addMinutes,
    addMonths,
    addWeeks,
    date,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    formatDate,
    getDate,
    getDiff,
    getHours,
    getMinutes,
    getMonth,
    getNextMonth,
    getPreviousMonth,
    getWeekArray,
    getWeekdays,
    getYear,
    isAfter,
    isAfterDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isSameYear,
    isValid,
    isWithinRange,
    parseISO,
    setDate,
    setHours,
    setMinutes,
    setMonth,
    setYear,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    toISO
} from '../../utils'

export class DateAdapter implements IDateAdapter<Date> {
    locale: string
    formats?: Record<string, TCustomDateFormat>

    constructor (options: { locale: string, formats?: Record<string, TCustomDateFormat> }) {
        this.locale = options.locale
        this.formats = options.formats
    }

    date (value?: any) {
        return date(value)
    }

    toJsDate (date: Date) {
        return date
    }

    toISO (date: Date): string {
        return toISO(this, date)
    }

    parseISO (date: string) {
        return parseISO(date)
    }

    addMinutes (date: Date, amount: number) {
        return addMinutes(date, amount)
    }

    addHours (date: Date, amount: number) {
        return addHours(date, amount)
    }

    addDays (date: Date, amount: number) {
        return addDays(date, amount)
    }

    addWeeks (date: Date, amount: number) {
        return addWeeks(date, amount)
    }

    addMonths (date: Date, amount: number) {
        return addMonths(date, amount)
    }

    getWeekArray (date: Date, firstDayOfWeek?: number | string) {
        return getWeekArray(date, this.locale, firstDayOfWeek ? Number(firstDayOfWeek) : undefined)
    }

    startOfWeek (date: Date, firstDayOfWeek?: number | string): Date {
        return startOfWeek(date, this.locale, firstDayOfWeek ? Number(firstDayOfWeek) : undefined)
    }

    endOfWeek (date: Date): Date {
        return endOfWeek(date, this.locale)
    }

    startOfMonth (date: Date) {
        return startOfMonth(date)
    }

    endOfMonth (date: Date) {
        return endOfMonth(date)
    }

    format (date: Date, formatString: string) {
        return formatDate(date, formatString, this.locale, this.formats)
    }

    isEqual (date: Date, comparing: Date) {
        return isEqual(date, comparing)
    }

    isValid (date: any) {
        return isValid(date)
    }

    isWithinRange (date: Date, range: [Date, Date]) {
        return isWithinRange(date, range)
    }

    isAfter (date: Date, comparing: Date) {
        return isAfter(date, comparing)
    }

    isAfterDay (date: Date, comparing: Date) {
        return isAfterDay(date, comparing)
    }

    isBefore (date: Date, comparing: Date) {
        return !isAfter(date, comparing) && !isEqual(date, comparing)
    }

    isSameDay (date: Date, comparing: Date) {
        return isSameDay(date, comparing)
    }

    isSameMonth (date: Date, comparing: Date) {
        return isSameMonth(date, comparing)
    }

    isSameYear (date: Date, comparing: Date) {
        return isSameYear(date, comparing)
    }

    setMinutes (date: Date, count: number) {
        return setMinutes(date, count)
    }

    setHours (date: Date, count: number) {
        return setHours(date, count)
    }

    setMonth (date: Date, count: number) {
        return setMonth(date, count)
    }

    setDate (date: Date, day: number): Date {
        return setDate(date, day)
    }

    setYear (date: Date, year: number) {
        return setYear(date, year)
    }

    getDiff (date: Date, comparing: Date | string, unit?: string) {
        return getDiff(date, comparing, unit)
    }

    getWeekdays (firstDayOfWeek?: number | string) {
        return getWeekdays(this.locale, firstDayOfWeek ? Number(firstDayOfWeek) : undefined)
    }

    getYear (date: Date) {
        return getYear(date)
    }

    getMonth (date: Date) {
        return getMonth(date)
    }

    getDate (date: Date) {
        return getDate(date)
    }

    getNextMonth (date: Date) {
        return getNextMonth(date)
    }

    getPreviousMonth (date: Date) {
        return getPreviousMonth(date)
    }

    getHours (date: Date) {
        return getHours(date)
    }

    getMinutes (date: Date) {
        return getMinutes(date)
    }

    startOfDay (date: Date) {
        return startOfDay(date)
    }

    endOfDay (date: Date) {
        return endOfDay(date)
    }

    startOfYear (date: Date) {
        return startOfYear(date)
    }

    endOfYear (date: Date) {
        return endOfYear(date)
    }
}
