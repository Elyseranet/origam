import { reactive, watch } from "vue"
import { DATE_2000_JUNARY_SUNDAY, FIRST_DAY, REGEX_DATE_YYYY_MM_DD } from "../../consts"

import type { IDateAdapter, IDateOptions, ILocaleInstance } from "../../interfaces"
import { DateAdapter } from "../../services"
import type { TCustomDateFormat } from "../../types"

import { createRange, padStart } from "../../utils"

/**
 * Create instance.
 *
 * @param options …
 * @param locale  …
 */
export function createInstance (options: IDateOptions, locale: ILocaleInstance) {
    const instance = reactive(
        typeof options.adapter === 'function'

            ? new options.adapter({
                locale: options.locale[locale.current.value] ?? locale.current.value,
                formats: options.formats
            })
            : options.adapter
    )

    watch(locale.current, value => {
        instance.locale = options.locale[value] ?? value ?? instance.locale
    })

    return instance
}

/**
 * Date.
 *
 * @param value …
 * @returns …
 */
export function date (value?: any): Date | null {
    if (value == null) return new Date()

    if (value instanceof Date) return value

    if (typeof value === 'string') {
        let parsed

        if (REGEX_DATE_YYYY_MM_DD.test(value)) {
            return parseLocalDate(value)
        } else {
            parsed = Date.parse(value)
        }

        if (!isNaN(parsed)) return new Date(parsed)
    }

    return null
}

/**
 * Parse local date.
 *
 * @param value …
 * @returns …
 */
export function parseLocalDate (value: string): Date {
    const parts = value.split('-').map(Number)

    // new Date() uses local time zone when passing individual date component values
    return new Date(parts[0], parts[1] - 1, parts[2])
}

/**
 * To iso.
 *
 * @param adapter …
 * @param value   …
 */
export function toISO (adapter: IDateAdapter<any>, value: Date) {
    const date = adapter.toJsDate(value)
    const year = date.getFullYear()
    const month = padStart(String(date.getMonth() + 1), 2, '0')
    const day = padStart(String(date.getDate()), 2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Parse iso.
 *
 * @param value …
 */
export function parseISO (value: string) {
    const [year, month, day] = value.split('-').map(Number)

    return new Date(year, month - 1, day)
}

/**
 * Add minutes.
 *
 * @param date   …
 * @param amount …
 */
export function addMinutes (date: Date, amount: number) {
    const d = new Date(date)

    d.setMinutes(d.getMinutes() + amount)

    return d
}

/**
 * Add hours.
 *
 * @param date   …
 * @param amount …
 */
export function addHours (date: Date, amount: number) {
    const d = new Date(date)

    d.setHours(d.getHours() + amount)

    return d
}

/**
 * Add days.
 *
 * @param date   …
 * @param amount …
 */
export function addDays (date: Date, amount: number) {
    const d = new Date(date)

    d.setDate(d.getDate() + amount)

    return d
}

/**
 * Add weeks.
 *
 * @param date   …
 * @param amount …
 */
export function addWeeks (date: Date, amount: number) {
    const d = new Date(date)

    d.setDate(d.getDate() + (amount * 7))

    return d
}

/**
 * Add months.
 *
 * @param date   …
 * @param amount …
 */
export function addMonths (date: Date, amount: number) {
    const d = new Date(date)

    d.setDate(1)
    d.setMonth(d.getMonth() + amount)

    return d
}

/**
 * Get year.
 *
 * @param date …
 */
export function getYear (date: Date) {
    return date.getFullYear()
}

/**
 * Get month.
 *
 * @param date …
 */
export function getMonth (date: Date) {
    return date.getMonth()
}

/**
 * Get date.
 *
 * @param date …
 */
export function getDate (date: Date) {
    return date.getDate()
}

/**
 * Get next month.
 *
 * @param date …
 */
export function getNextMonth (date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

/**
 * Get previous month.
 *
 * @param date …
 */
export function getPreviousMonth (date: Date) {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

/**
 * Get hours.
 *
 * @param date …
 */
export function getHours (date: Date) {
    return date.getHours()
}

/**
 * Get minutes.
 *
 * @param date …
 */
export function getMinutes (date: Date) {
    return date.getMinutes()
}

/**
 * Start of year.
 *
 * @param date …
 */
export function startOfYear (date: Date) {
    return new Date(date.getFullYear(), 0, 1)
}

/**
 * End of year.
 *
 * @param date …
 */
export function endOfYear (date: Date) {
    return new Date(date.getFullYear(), 11, 31)
}

/**
 * Is within range.
 *
 * @param date  …
 * @param range …
 */
export function isWithinRange (date: Date, range: [Date, Date]) {
    return isAfter(date, range[0]) && isBefore(date, range[1])
}

/**
 * Is valid.
 *
 * @param date …
 */
export function isValid (date: any) {
    const d = new Date(date)

    return d instanceof Date && !isNaN(d.getTime())
}

/**
 * Is after.
 *
 * @param date      …
 * @param comparing …
 */
export function isAfter (date: Date, comparing: Date) {
    return date.getTime() > comparing.getTime()
}

/**
 * Is after day.
 *
 * @param date      …
 * @param comparing …
 * @returns …
 */
export function isAfterDay (date: Date, comparing: Date): boolean {
    return isAfter(startOfDay(date), startOfDay(comparing))
}

/**
 * Is before.
 *
 * @param date      …
 * @param comparing …
 */
export function isBefore (date: Date, comparing: Date) {
    return date.getTime() < comparing.getTime()
}

/**
 * Is equal.
 *
 * @param date      …
 * @param comparing …
 */
export function isEqual (date: Date, comparing: Date) {
    return date.getTime() === comparing.getTime()
}

/**
 * Is same day.
 *
 * @param date      …
 * @param comparing …
 */
export function isSameDay (date: Date, comparing: Date) {
    return date.getDate() === comparing.getDate() &&
        date.getMonth() === comparing.getMonth() &&
        date.getFullYear() === comparing.getFullYear()
}

/**
 * Is same month.
 *
 * @param date      …
 * @param comparing …
 */
export function isSameMonth (date: Date, comparing: Date) {
    return date.getMonth() === comparing.getMonth() &&
        date.getFullYear() === comparing.getFullYear()
}

/**
 * Is same year.
 *
 * @param date      …
 * @param comparing …
 */
export function isSameYear (date: Date, comparing: Date) {
    return date.getFullYear() === comparing.getFullYear()
}

/**
 * Get diff.
 *
 * @param date      …
 * @param comparing …
 * @param unit      …
 */
export function getDiff (date: Date, comparing: Date | string, unit?: string) {
    const d = new Date(date)
    const c = new Date(comparing)
    let result: number

    switch (unit) {
        case 'years':
            result = d.getFullYear() - c.getFullYear()
            break
        case 'quarters':
            result = Math.floor((d.getMonth() - c.getMonth() + (d.getFullYear() - c.getFullYear()) * 12) / 4)
            break
        case 'months':
            result = d.getMonth() - c.getMonth() + (d.getFullYear() - c.getFullYear()) * 12
            break
        case 'weeks':
            result = Math.floor((d.getTime() - c.getTime()) / (1000 * 60 * 60 * 24 * 7))
            break
        case 'days':
            result = Math.floor((d.getTime() - c.getTime()) / (1000 * 60 * 60 * 24))
            break
        case 'hours':
            result = Math.floor((d.getTime() - c.getTime()) / (1000 * 60 * 60))
            break
        case 'minutes':
            result = Math.floor((d.getTime() - c.getTime()) / (1000 * 60))
            break
        case 'seconds':
            result = Math.floor((d.getTime() - c.getTime()) / 1000)
            break
        default:
            result = d.getTime() - c.getTime()
    }

    return result
}

/**
 * Set hours.
 *
 * @param date  …
 * @param count …
 */
export function setHours (date: Date, count: number) {
    const d = new Date(date)

    d.setHours(count)

    return d
}

/**
 * Set minutes.
 *
 * @param date  …
 * @param count …
 */
export function setMinutes (date: Date, count: number) {
    const d = new Date(date)

    d.setMinutes(count)

    return d
}

/**
 * Set month.
 *
 * @param date  …
 * @param count …
 */
export function setMonth (date: Date, count: number) {
    const d = new Date(date)

    d.setMonth(count)

    return d
}

/**
 * Set date.
 *
 * @param date …
 * @param day  …
 */
export function setDate (date: Date, day: number) {
    const d = new Date(date)

    d.setDate(day)

    return d
}

/**
 * Set year.
 *
 * @param date …
 * @param year …
 */
export function setYear (date: Date, year: number) {
    const d = new Date(date)

    d.setFullYear(year)

    return d
}

/**
 * Start of day.
 *
 * @param date …
 */
export function startOfDay (date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

/**
 * End of day.
 *
 * @param date …
 */
export function endOfDay (date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

/**
 * Get week array.
 *
 * @param date           …
 * @param locale         …
 * @param firstDayOfWeek …
 */
export function getWeekArray (date: Date, locale: string, firstDayOfWeek?: number) {
    const weeks = []
    let currentWeek = []
    const firstDayOfMonth = startOfMonth(date)
    const lastDayOfMonth = endOfMonth(date)
    const first = firstDayOfWeek ?? FIRST_DAY[locale.slice(-2).toUpperCase()] ?? 0
    const firstDayWeekIndex = (firstDayOfMonth.getDay() - first + 7) % 7
    const lastDayWeekIndex = (lastDayOfMonth.getDay() - first + 7) % 7

    for (let i = 0; i < firstDayWeekIndex; i++) {
        const adjacentDay = new Date(firstDayOfMonth)
        adjacentDay.setDate(adjacentDay.getDate() - (firstDayWeekIndex - i))
        currentWeek.push(adjacentDay)
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const day = new Date(date.getFullYear(), date.getMonth(), i)

        // Add the day to the current week
        currentWeek.push(day)

        // If the current week has 7 days, add it to the weeks array and start a new week
        if (currentWeek.length === 7) {
            weeks.push(currentWeek)
            currentWeek = []
        }
    }

    for (let i = 1; i < 7 - lastDayWeekIndex; i++) {
        const adjacentDay = new Date(lastDayOfMonth)
        adjacentDay.setDate(adjacentDay.getDate() + i)
        currentWeek.push(adjacentDay)
    }

    if (currentWeek.length > 0) {
        weeks.push(currentWeek)
    }

    return weeks
}

/**
 * Start of week.
 *
 * @param date           …
 * @param locale         …
 * @param firstDayOfWeek …
 */
export function startOfWeek (date: Date, locale: string, firstDayOfWeek?: number) {
    const day = firstDayOfWeek ?? FIRST_DAY[locale.slice(-2).toUpperCase()] ?? 0
    const d = new Date(date)

    while (d.getDay() !== day) {
        d.setDate(d.getDate() - 1)
    }

    return d
}

/**
 * End of week.
 *
 * @param date   …
 * @param locale …
 */
export function endOfWeek (date: Date, locale: string) {
    const d = new Date(date)
    const lastDay = ((FIRST_DAY[locale.slice(-2).toUpperCase()] ?? 0) + 6) % 7

    while (d.getDay() !== lastDay) {
        d.setDate(d.getDate() + 1)
    }

    return d
}

/**
 * Start of month.
 *
 * @param date …
 */
export function startOfMonth (date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * End of month.
 *
 * @param date …
 */
export function endOfMonth (date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * Format date.
 *
 * @param value        …
 * @param formatString …
 * @param locale       …
 * @param formats      …
 * @returns …
 */
export function formatDate (
    value: Date,
    formatString: string,
    locale: string,
    formats?: Record<string, TCustomDateFormat>
): string {
    const newDate = date(value) ?? new Date()
    const customFormat = formats?.[formatString]
    let day: number
    let month: string

    if (typeof customFormat === 'function') {
        return customFormat(newDate, formatString, locale)
    }

    let options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    switch (formatString) {
        case 'fullDate':
            options = {year: 'numeric', month: 'long', day: 'numeric'}
            break
        case 'fullDateWithWeekday':
            options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
            break
        case 'normalDate':
            day = newDate.getDate()
            month = new Intl.DateTimeFormat(locale, {month: 'long'}).format(newDate)
            return `${day} ${month}`
        case 'normalDateWithWeekday':
            options = {weekday: 'short', day: 'numeric', month: 'short'}
            break
        case 'shortDate':
            options = {month: 'short', day: 'numeric'}
            break
        case 'year':
            options = {year: 'numeric'}
            break
        case 'month':
            options = {month: 'long'}
            break
        case 'monthShort':
            options = {month: 'short'}
            break
        case 'monthAndYear':
            options = {month: 'long', year: 'numeric'}
            break
        case 'monthAndDate':
            options = {month: 'long', day: 'numeric'}
            break
        case 'weekday':
            options = {weekday: 'long'}
            break
        case 'weekdayShort':
            options = {weekday: 'short'}
            break
        case 'dayOfMonth':
            return new Intl.NumberFormat(locale).format(newDate.getDate())
        case 'hours12h':
            options = {hour: 'numeric', hour12: true}
            break
        case 'hours24h':
            options = {hour: 'numeric', hour12: false}
            break
        case 'minutes':
            options = {minute: 'numeric'}
            break
        case 'seconds':
            options = {second: 'numeric'}
            break
        case 'fullTime':
            options = {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true}
            break
        case 'fullTime12h':
            options = {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true}
            break
        case 'fullTime24h':
            options = {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false}
            break
        case 'fullDateTime':
            options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            }
            break
        case 'fullDateTime12h':
            options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            }
            break
        case 'fullDateTime24h':
            options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            }
            break
        case 'keyboardDate':
            options = {year: 'numeric', month: '2-digit', day: '2-digit'}
            break
        case 'keyboardDateTime':
            options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            }
            break
        case 'keyboardDateTime12h':
            options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            }
            break
        case 'keyboardDateTime24h':
            options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false
            }
            break
        default:
            options = customFormat ?? {timeZone: 'UTC', timeZoneName: 'short'}
    }

    return new Intl.DateTimeFormat(locale, options).format(newDate)
}

/**
 * Get weekdays.
 *
 * @param locale         …
 * @param firstDayOfWeek …
 */
export function getWeekdays (locale: string, firstDayOfWeek?: number) {
    const daysFromSunday = firstDayOfWeek ?? FIRST_DAY[locale.slice(-2).toUpperCase()] ?? 0

    return createRange(7)
        .map((i) => {
            const weekday = new Date(DATE_2000_JUNARY_SUNDAY)

            weekday.setDate(DATE_2000_JUNARY_SUNDAY.getDate() + daysFromSunday + i)

            return new Intl.DateTimeFormat(locale, {weekday: 'narrow'}).format(weekday)
        })
}

/**
 * Get week.
 *
 * @param adapter …
 * @param value   …
 */
export function getWeek (adapter: DateAdapter, value: any) {
    const date = adapter.toJsDate(value)
    let year = date.getFullYear()
    let d1w1 = new Date(year, 0, 1)

    if (date < d1w1) {
        year = year - 1
        d1w1 = new Date(year, 0, 1)
    } else {
        const tv = new Date(year + 1, 0, 1)
        if (date >= tv) {
            year = year + 1
            d1w1 = tv
        }
    }

    const diffTime = Math.abs(date.getTime() - d1w1.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.floor(diffDays / 7) + 1
}
