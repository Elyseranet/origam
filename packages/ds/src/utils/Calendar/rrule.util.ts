/**
 * RRULE subset parser + recurrence expander.
 *
 * Supports — and ONLY supports — the following RFC 5545 directives:
 * - `FREQ=DAILY | WEEKLY | MONTHLY`
 * - `INTERVAL=N` (default 1)
 * - `COUNT=N` (caps occurrences)
 * - `UNTIL=YYYYMMDDTHHMMSSZ` (ISO 8601 basic with optional `Z`)
 * - `BYDAY=MO,TU,...` (only for `FREQ=WEEKLY`)
 *
 * Everything else (`BYMONTHDAY`, `BYSETPOS`, `BYMONTH`, `BYHOUR`,
 * `WKST`, `EXDATE`, …) is silently ignored. This matches what
 * @origam/Calendar promises in its docs: a minimal subset that
 * handles 95% of "every Monday/Wednesday/Friday at 10am"-style
 * patterns without dragging in a full RRULE engine like `rrule.js`.
 *
 * Pure / SSR-safe: no `Date.now()` at module scope, no DOM access.
 */

import type { IEvent } from '../../interfaces'

import { addDays, addMonths, diffMinutes, toDate } from './date.util'

interface IParsedRule {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    interval: number
    count: number | null
    until: Date | null
    byDay: Array<number> | null
}

const BY_DAY_MAP: Record<string, number> = {
    SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
}

/**
 * Parse the `UNTIL=` directive. RFC 5545 accepts both
 * `YYYYMMDD` (date) and `YYYYMMDDTHHMMSSZ` (UTC datetime); we accept
 * the same.
 */
function parseUntil (value: string): Date | null {
    if (!value) return null
    const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/)
    if (!m) return null
    const [, yy, mm, dd, hh, mi, ss] = m
    const y = Number(yy)
    const mo = Number(mm) - 1
    const d = Number(dd)
    const h = hh ? Number(hh) : 23
    const mn = mi ? Number(mi) : 59
    const s = ss ? Number(ss) : 59
    return new Date(y, mo, d, h, mn, s)
}

/**
 * Parse a raw RRULE string into a normalized rule object. Returns
 * `null` when the directive is malformed or uses an unsupported
 * `FREQ` value — the caller should fall back to single-occurrence
 * rendering in that case.
 */
export function parseRRule (rrule: string): IParsedRule | null {
    if (!rrule) return null
    const cleaned = rrule.replace(/^RRULE:/i, '').trim()
    if (!cleaned) return null
    const parts: Record<string, string> = {}
    for (const segment of cleaned.split(';')) {
        const [key, value] = segment.split('=')
        if (key && value !== undefined) parts[key.toUpperCase()] = value
    }
    const freq = parts.FREQ as IParsedRule['freq']
    if (freq !== 'DAILY' && freq !== 'WEEKLY' && freq !== 'MONTHLY') return null
    const interval = parts.INTERVAL ? Math.max(1, Number(parts.INTERVAL)) : 1
    const count = parts.COUNT ? Math.max(0, Number(parts.COUNT)) : null
    const until = parts.UNTIL ? parseUntil(parts.UNTIL) : null
    const byDay = parts.BYDAY
        ? parts.BYDAY
            .split(',')
            .map((token) => BY_DAY_MAP[token.trim().toUpperCase()])
            .filter((value): value is number => value !== undefined)
        : null
    return { freq, interval, count, until, byDay }
}

/**
 * Compute the duration of an event in minutes. Used so we can clone
 * the start/end pair when generating an occurrence (preserving the
 * original event's duration even when only `start` was changed).
 */
function eventDuration (event: IEvent): number {
    const start = toDate(event.start)
    const end = event.end ? toDate(event.end) : null
    if (!start || !end) return 0
    return diffMinutes(start, end)
}

/**
 * Clone an event with new start/end timestamps. The original `rrule`
 * is stripped so the generated occurrences don't infinite-loop if a
 * downstream consumer expands them again.
 */
function cloneOccurrence (template: IEvent, occurrenceStart: Date, durationMin: number): IEvent {
    const end = durationMin > 0
        ? new Date(occurrenceStart.getTime() + durationMin * 60000)
        : undefined
    return {
        ...template,
        start: occurrenceStart,
        end,
        rrule: undefined
    }
}

/**
 * Hard cap on the number of occurrences we'll generate. Protects
 * against `FREQ=DAILY` without `COUNT` / `UNTIL` from running away
 * for years.
 */
const MAX_OCCURRENCES = 366 * 3 // 3 years worth of daily events

/**
 * Expand an event with an `rrule` into the list of concrete
 * occurrences that fall inside `[range.start, range.end]`. Events
 * without an `rrule` are passed through as a single-element list.
 *
 * The expander stops at the first of:
 * - `range.end`
 * - `rule.until`
 * - `rule.count` reached
 * - `MAX_OCCURRENCES` reached (safety net)
 */
export function expandRecurrence (
    event: IEvent,
    range: { start: Date, end: Date }
): Array<IEvent> {
    const start = toDate(event.start)
    if (!start) return []

    if (!event.rrule) {
        // Pass-through. We still filter against the range so callers
        // never receive events outside the visible window.
        if (start.getTime() > range.end.getTime()) return []
        const eventEnd = event.end ? toDate(event.end) : null
        if (eventEnd && eventEnd.getTime() < range.start.getTime()) return []
        if (!eventEnd && start.getTime() < range.start.getTime()) return []
        return [event]
    }

    const rule = parseRRule(event.rrule)
    if (!rule) return event.rrule ? [event] : []

    const duration = eventDuration(event)
    const occurrences: Array<IEvent> = []
    let cursor = new Date(start.getTime())
    let emitted = 0

    while (
        cursor.getTime() <= range.end.getTime()
        && (!rule.until || cursor.getTime() <= rule.until.getTime())
        && (rule.count == null || emitted < rule.count)
        && emitted < MAX_OCCURRENCES
    ) {
        const passesByDay = rule.freq === 'WEEKLY' && rule.byDay
            ? rule.byDay.includes(cursor.getDay())
            : true

        if (passesByDay && cursor.getTime() >= range.start.getTime() - duration * 60000) {
            occurrences.push(cloneOccurrence(event, new Date(cursor.getTime()), duration))
        }

        if (passesByDay) emitted++

        cursor = advance(cursor, rule, start)
    }

    return occurrences
}

/**
 * Move the cursor forward by one tick of the rule. For WEEKLY+BYDAY
 * we advance one day at a time so the `passesByDay` filter can
 * accept the right weekdays; otherwise we jump by `interval` units.
 */
function advance (cursor: Date, rule: IParsedRule, anchor: Date): Date {
    if (rule.freq === 'WEEKLY' && rule.byDay && rule.byDay.length > 0) {
        return addDays(cursor, 1)
    }
    if (rule.freq === 'DAILY') return addDays(cursor, rule.interval)
    if (rule.freq === 'WEEKLY') return addDays(cursor, 7 * rule.interval)
    // MONTHLY — preserve the day-of-month from the anchor so e.g.
    // "the 15th of every month" stays on the 15th even when
    // intermediate months have fewer days.
    const next = addMonths(cursor, rule.interval)
    next.setDate(anchor.getDate())
    return next
}
