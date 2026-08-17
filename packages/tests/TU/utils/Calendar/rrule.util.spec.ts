import { describe, expect, it } from 'vitest'

import type { IEvent } from '@origam/interfaces'

import { expandRecurrence, parseRRule } from '@origam/utils/Calendar/rrule.util'

describe('rrule.util — parseRRule', () => {
    it('returns null for empty input', () => {
        expect(parseRRule('')).toBe(null)
    })
    it('returns null for an unsupported FREQ', () => {
        expect(parseRRule('FREQ=YEARLY')).toBe(null)
    })
    it('parses FREQ + INTERVAL + COUNT + BYDAY', () => {
        const out = parseRRule('FREQ=WEEKLY;INTERVAL=2;COUNT=5;BYDAY=MO,WE,FR')
        expect(out).toMatchObject({
            freq: 'WEEKLY',
            interval: 2,
            count: 5,
            byDay: [1, 3, 5]
        })
    })
    it('parses UNTIL=YYYYMMDDTHHMMSSZ', () => {
        const out = parseRRule('FREQ=DAILY;UNTIL=20261231T235959Z')
        expect(out?.until?.getFullYear()).toBe(2026)
    })
    it('strips a leading "RRULE:" prefix', () => {
        const out = parseRRule('RRULE:FREQ=DAILY')
        expect(out?.freq).toBe('DAILY')
    })
})

describe('rrule.util — expandRecurrence (pass-through)', () => {
    it('returns the event itself when it has no rrule', () => {
        const event: IEvent = {
            id: 1,
            title: 'One-off',
            start: new Date(2026, 4, 14, 10, 0),
            end: new Date(2026, 4, 14, 11, 0)
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(1)
        expect(out[0]).toBe(event)
    })
    it('drops the event when it sits before the range', () => {
        const event: IEvent = {
            id: 1,
            title: 'Old',
            start: new Date(2020, 0, 1),
            end: new Date(2020, 0, 1, 1, 0)
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(0)
    })
})

describe('rrule.util — expandRecurrence (DAILY)', () => {
    it('expands FREQ=DAILY;COUNT=5 to 5 occurrences', () => {
        const event: IEvent = {
            id: 'd',
            title: 'Daily',
            start: new Date(2026, 4, 14, 9, 0),
            end: new Date(2026, 4, 14, 9, 30),
            rrule: 'FREQ=DAILY;COUNT=5'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out).toHaveLength(5)
    })

    it('respects INTERVAL=2', () => {
        const event: IEvent = {
            id: 'd',
            title: 'Every 2 days',
            start: new Date(2026, 4, 14, 9, 0),
            rrule: 'FREQ=DAILY;INTERVAL=2;COUNT=3'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out).toHaveLength(3)
        const days = out.map((o) => (o.start as Date).getDate())
        expect(days[1] - days[0]).toBe(2)
    })
})

describe('rrule.util — expandRecurrence (WEEKLY + BYDAY)', () => {
    it('emits only the configured weekdays', () => {
        const event: IEvent = {
            id: 'w',
            title: 'Mon Wed Fri',
            start: new Date(2026, 4, 11, 10, 0), // Monday 2026-05-11
            end: new Date(2026, 4, 11, 11, 0),
            rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=6'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(6)
        const weekdays = out.map((o) => (o.start as Date).getDay())
        expect(weekdays.every((d) => [1, 3, 5].includes(d))).toBe(true)
    })

    it('preserves the original duration on each occurrence', () => {
        const event: IEvent = {
            id: 'w',
            title: 'Weekly 1h',
            start: new Date(2026, 4, 11, 10, 0),
            end: new Date(2026, 4, 11, 11, 0),
            rrule: 'FREQ=WEEKLY;BYDAY=MO;COUNT=2'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(2)
        for (const occ of out) {
            const start = occ.start as Date
            const end = occ.end as Date
            expect(end.getTime() - start.getTime()).toBe(60 * 60 * 1000)
        }
    })
})

describe('rrule.util — expandRecurrence (MONTHLY)', () => {
    it('emits one occurrence per month, locked to the anchor day', () => {
        const event: IEvent = {
            id: 'm',
            title: 'Monthly on the 14th',
            start: new Date(2026, 0, 14, 10, 0),
            rrule: 'FREQ=MONTHLY;COUNT=4'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 0, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out).toHaveLength(4)
        for (const occ of out) {
            expect((occ.start as Date).getDate()).toBe(14)
        }
    })
})

describe('rrule.util — expandRecurrence (UNTIL caps the loop)', () => {
    it('stops generating after UNTIL', () => {
        const event: IEvent = {
            id: 'u',
            title: 'Until cap',
            start: new Date(2026, 4, 1, 9, 0),
            rrule: 'FREQ=DAILY;UNTIL=20260507T000000Z'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out.length).toBeLessThanOrEqual(7)
        expect(out.length).toBeGreaterThan(0)
    })
})

/*
 * ---------------------------------------------------------------------------
 * Coverage restored 2026-08-17.
 *
 * The e2e spec `packages/tests/e2e/calendar.spec.ts` carried a `test.skip`
 * asserting "rrule recurrence is untested" because the story fixture lost
 * its recurring event. That premise was wrong about the *unit* layer (the
 * specs above already existed and passed) but the branch coverage measured
 * only 83.33%. The blocks below close the gap, and they belong in the unit
 * suite on purpose: recurrence expansion is pure date arithmetic, and the
 * CI runs the whole Vitest suite while it runs only a subset of the e2e
 * specs. Putting the guard here is what actually keeps it under CI.
 *
 * Several of these assertions pin *current* behaviour of a deliberately
 * partial RFC 5545 subset rather than full-spec correctness — each such
 * case says so explicitly so a future reader doesn't mistake a documented
 * limitation for an endorsed one.
 * ---------------------------------------------------------------------------
 */

describe('rrule.util — parseRRule (directive edge cases)', () => {
    it('clamps INTERVAL below 1 up to 1', () => {
        expect(parseRRule('FREQ=DAILY;INTERVAL=0')?.interval).toBe(1)
        expect(parseRRule('FREQ=DAILY;INTERVAL=-5')?.interval).toBe(1)
    })

    it('defaults INTERVAL to 1 when the directive is absent', () => {
        expect(parseRRule('FREQ=DAILY')?.interval).toBe(1)
    })

    it('keeps COUNT=0 as 0 rather than falling back to unbounded', () => {
        // `COUNT=0` is degenerate but must not read as "no cap" — that
        // would turn a zero-occurrence rule into a runaway expansion.
        expect(parseRRule('FREQ=DAILY;COUNT=0')?.count).toBe(0)
    })

    it('leaves count/until/byDay null when the directives are absent', () => {
        expect(parseRRule('FREQ=MONTHLY')).toMatchObject({
            freq: 'MONTHLY',
            count: null,
            until: null,
            byDay: null
        })
    })

    it('accepts the date-only UNTIL form (YYYYMMDD) and ends the day at 23:59:59', () => {
        const out = parseRRule('FREQ=DAILY;UNTIL=20261231')
        expect(out?.until).not.toBe(null)
        expect(out?.until?.getFullYear()).toBe(2026)
        expect(out?.until?.getMonth()).toBe(11)
        expect(out?.until?.getDate()).toBe(31)
        expect(out?.until?.getHours()).toBe(23)
        expect(out?.until?.getMinutes()).toBe(59)
        expect(out?.until?.getSeconds()).toBe(59)
    })

    it('yields until=null for a malformed UNTIL instead of an Invalid Date', () => {
        // A NaN Date here would make every `cursor <= until` comparison
        // false and silently produce zero occurrences.
        const out = parseRRule('FREQ=DAILY;UNTIL=not-a-date')
        expect(out).not.toBe(null)
        expect(out?.until).toBe(null)
    })

    it('drops unknown BYDAY tokens instead of emitting undefined day indices', () => {
        expect(parseRRule('FREQ=WEEKLY;BYDAY=MO,XX,FR')?.byDay).toEqual([1, 5])
    })

    it('maps the full BYDAY alphabet to JS day indices (0 = Sunday)', () => {
        expect(parseRRule('FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA')?.byDay)
            .toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    it('uppercases directive keys so "freq=DAILY" still parses', () => {
        expect(parseRRule('freq=DAILY;interval=3')).toMatchObject({
            freq: 'DAILY',
            interval: 3
        })
    })

    it('LIMITATION: directive *values* are case-sensitive — "FREQ=daily" is rejected', () => {
        // Documented subset behaviour, not an endorsement: only the key is
        // upper-cased at parse time. If lowercase values ever need to be
        // supported, this assertion is the one to flip.
        expect(parseRRule('FREQ=daily')).toBe(null)
    })

    it('ignores segments with no "=" and unsupported directives', () => {
        expect(parseRRule('FREQ=DAILY;GARBAGE;BYMONTHDAY=15;WKST=SU')).toMatchObject({
            freq: 'DAILY',
            interval: 1
        })
    })

    it('returns null for a string that carries no FREQ at all', () => {
        expect(parseRRule('COUNT=5;BYDAY=MO')).toBe(null)
    })

    it('returns null when only the "RRULE:" prefix is present', () => {
        expect(parseRRule('RRULE:')).toBe(null)
        expect(parseRRule('   ')).toBe(null)
    })
})

describe('rrule.util — expandRecurrence (guard clauses)', () => {
    const RANGE = { start: new Date(2026, 4, 1), end: new Date(2026, 4, 31) }

    it('returns an empty list when start is unparseable', () => {
        const event = {
            id: 'bad',
            title: 'Broken start',
            start: 'not-a-date'
        } as IEvent
        expect(expandRecurrence(event, RANGE)).toEqual([])
    })

    it('drops a non-recurring event that starts after the range ends', () => {
        const event: IEvent = {
            id: 'future',
            title: 'Later',
            start: new Date(2026, 7, 1, 9, 0),
            end: new Date(2026, 7, 1, 10, 0)
        }
        expect(expandRecurrence(event, RANGE)).toEqual([])
    })

    it('drops an end-less non-recurring event that starts before the range', () => {
        const event: IEvent = {
            id: 'pointless',
            title: 'Point in time, too early',
            start: new Date(2026, 3, 15, 9, 0)
        }
        expect(expandRecurrence(event, RANGE)).toEqual([])
    })

    it('keeps a non-recurring event whose end lands inside the range', () => {
        // Straddles range.start: begins in April, ends in May.
        const event: IEvent = {
            id: 'straddle',
            title: 'Spans into the range',
            start: new Date(2026, 3, 28, 9, 0),
            end: new Date(2026, 4, 2, 10, 0)
        }
        expect(expandRecurrence(event, RANGE)).toEqual([event])
    })

    it('falls back to the single event when the rrule cannot be parsed', () => {
        // Unsupported FREQ must degrade to one-off rendering, never to a
        // dropped event — losing the event outright is the worse failure.
        const event: IEvent = {
            id: 'yearly',
            title: 'Unsupported FREQ',
            start: new Date(2026, 4, 14, 9, 0),
            rrule: 'FREQ=YEARLY;COUNT=3'
        }
        const out = expandRecurrence(event, RANGE)
        expect(out).toHaveLength(1)
        expect(out[0]).toBe(event)
    })

    it('emits nothing for COUNT=0', () => {
        const event: IEvent = {
            id: 'zero',
            title: 'Zero occurrences',
            start: new Date(2026, 4, 4, 9, 0),
            rrule: 'FREQ=DAILY;COUNT=0'
        }
        expect(expandRecurrence(event, RANGE)).toEqual([])
    })
})

describe('rrule.util — expandRecurrence (WEEKLY without BYDAY)', () => {
    it('steps 7 days at a time when BYDAY is absent', () => {
        const event: IEvent = {
            id: 'w-plain',
            title: 'Weekly, same weekday',
            start: new Date(2026, 4, 11, 10, 0), // Monday
            end: new Date(2026, 4, 11, 11, 0),
            rrule: 'FREQ=WEEKLY;COUNT=3'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out).toHaveLength(3)
        expect(out.map((o) => (o.start as Date).getDate())).toEqual([11, 18, 25])
        // Every occurrence stays on the anchor's weekday.
        expect(out.every((o) => (o.start as Date).getDay() === 1)).toBe(true)
    })

    it('multiplies the 7-day step by INTERVAL', () => {
        const event: IEvent = {
            id: 'w-biweekly',
            title: 'Fortnightly',
            start: new Date(2026, 4, 11, 10, 0),
            rrule: 'FREQ=WEEKLY;INTERVAL=2;COUNT=3'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 6, 31)
        })
        expect(out).toHaveLength(3)
        const days = out.map((o) => (o.start as Date).getTime())
        const fortnight = 14 * 24 * 60 * 60 * 1000
        expect(days[1] - days[0]).toBe(fortnight)
        expect(days[2] - days[1]).toBe(fortnight)
    })

    it('honours BYDAY only for WEEKLY — a DAILY rule ignores it', () => {
        // The parser stores byDay regardless of freq; the expander is what
        // scopes it to WEEKLY. Guards against the filter leaking to DAILY.
        const event: IEvent = {
            id: 'd-byday',
            title: 'Daily with a stray BYDAY',
            start: new Date(2026, 4, 11, 9, 0), // Monday
            rrule: 'FREQ=DAILY;BYDAY=MO;COUNT=4'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(4)
        expect(out.map((o) => (o.start as Date).getDate())).toEqual([11, 12, 13, 14])
    })
})

describe('rrule.util — expandRecurrence (occurrence shape)', () => {
    it('strips rrule from every generated occurrence', () => {
        // cloneOccurrence clears `rrule` so a consumer that re-expands the
        // output cannot recurse into an exponential blow-up.
        const event: IEvent = {
            id: 'strip',
            title: 'Recurring',
            start: new Date(2026, 4, 11, 9, 0),
            end: new Date(2026, 4, 11, 10, 0),
            rrule: 'FREQ=DAILY;COUNT=3'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(3)
        expect(out.every((o) => o.rrule === undefined)).toBe(true)
    })

    it('leaves the source event untouched', () => {
        const event: IEvent = {
            id: 'immutable',
            title: 'Recurring',
            start: new Date(2026, 4, 11, 9, 0),
            end: new Date(2026, 4, 11, 10, 0),
            rrule: 'FREQ=DAILY;COUNT=3'
        }
        const startBefore = (event.start as Date).getTime()
        expandRecurrence(event, { start: new Date(2026, 4, 1), end: new Date(2026, 4, 31) })
        expect((event.start as Date).getTime()).toBe(startBefore)
        expect(event.rrule).toBe('FREQ=DAILY;COUNT=3')
    })

    it('carries category / color / metadata onto each occurrence', () => {
        const event: IEvent = {
            id: 'rich',
            title: 'Standup',
            start: new Date(2026, 4, 11, 9, 0),
            end: new Date(2026, 4, 11, 9, 15),
            category: 'meeting',
            color: 'primary',
            metadata: { room: 'B2' },
            rrule: 'FREQ=DAILY;COUNT=2'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(2)
        for (const occ of out) {
            expect(occ.category).toBe('meeting')
            expect(occ.color).toBe('primary')
            expect(occ.metadata).toEqual({ room: 'B2' })
            expect(occ.title).toBe('Standup')
            expect(occ.id).toBe('rich')
        }
    })

    it('leaves end undefined when the template event has no end', () => {
        const event: IEvent = {
            id: 'no-end',
            title: 'Point in time',
            start: new Date(2026, 4, 11, 9, 0),
            rrule: 'FREQ=DAILY;COUNT=2'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(2)
        expect(out.every((o) => o.end === undefined)).toBe(true)
    })

    it('accepts ISO-8601 string start/end and emits Date occurrences', () => {
        // IEvent documents strings as a first-class input shape.
        const event: IEvent = {
            id: 'iso',
            title: 'From JSON',
            start: '2026-05-11T09:00:00',
            end: '2026-05-11T10:00:00',
            rrule: 'FREQ=DAILY;COUNT=2'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 31)
        })
        expect(out).toHaveLength(2)
        for (const occ of out) {
            expect(occ.start).toBeInstanceOf(Date)
            expect((occ.end as Date).getTime() - (occ.start as Date).getTime())
                .toBe(60 * 60 * 1000)
        }
    })
})

describe('rrule.util — expandRecurrence (range clipping)', () => {
    it('omits occurrences that fall past range.end', () => {
        const event: IEvent = {
            id: 'clip',
            title: 'Daily, unbounded',
            start: new Date(2026, 4, 1, 9, 0),
            end: new Date(2026, 4, 1, 10, 0),
            rrule: 'FREQ=DAILY'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 10, 23, 59)
        })
        expect(out).toHaveLength(10)
        expect(out.every((o) => (o.start as Date).getMonth() === 4)).toBe(true)
        expect(Math.max(...out.map((o) => (o.start as Date).getDate()))).toBe(10)
    })

    it('caps an unbounded DAILY rule at MAX_OCCURRENCES over a huge range', () => {
        // No COUNT, no UNTIL, 10-year window: the safety net (366 * 3) is
        // the only thing standing between this and ~3650 objects.
        const event: IEvent = {
            id: 'runaway',
            title: 'Forever',
            start: new Date(2026, 0, 1, 9, 0),
            rrule: 'FREQ=DAILY'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 0, 1),
            end: new Date(2036, 0, 1)
        })
        expect(out).toHaveLength(366 * 3)
    })

    it('returns an empty list when the range sits entirely before the rule starts', () => {
        const event: IEvent = {
            id: 'later',
            title: 'Starts in June',
            start: new Date(2026, 5, 1, 9, 0),
            rrule: 'FREQ=DAILY;COUNT=5'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 0, 1),
            end: new Date(2026, 0, 31)
        })
        expect(out).toEqual([])
    })
})

describe('rrule.util — expandRecurrence (MONTHLY anchor drift)', () => {
    it('keeps a mid-month anchor stable across short months', () => {
        const event: IEvent = {
            id: 'm15',
            title: 'The 15th',
            start: new Date(2026, 0, 15, 10, 0),
            rrule: 'FREQ=MONTHLY;COUNT=6'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 0, 1),
            end: new Date(2026, 11, 31)
        })
        expect(out).toHaveLength(6)
        expect(out.map((o) => (o.start as Date).getMonth())).toEqual([0, 1, 2, 3, 4, 5])
        expect(out.every((o) => (o.start as Date).getDate() === 15)).toBe(true)
    })

    it('LIMITATION: a day-31 anchor drifts and skips short months', () => {
        // `advance()` re-applies `anchor.getDate()` via `setDate(31)`, which
        // JS rolls over on 28/30-day months. RFC 5545 would skip the month
        // instead. Supporting that needs BYMONTHDAY semantics the util
        // explicitly does not implement — pinned here so the drift is a
        // known, visible property rather than a surprise in production.
        //
        // Measured, not assumed: February is skipped outright, and from the
        // second occurrence on the day-of-month is no longer 31.
        const event: IEvent = {
            id: 'm31',
            title: 'The 31st',
            start: new Date(2026, 0, 31, 10, 0),
            rrule: 'FREQ=MONTHLY;COUNT=4'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 0, 1),
            end: new Date(2026, 11, 31)
        })
        expect(out.map((o) => (o.start as Date).toDateString())).toEqual([
            'Sat Jan 31 2026',
            'Tue Mar 03 2026',
            'Fri May 01 2026',
            'Wed Jul 01 2026'
        ])
    })

    it('respects INTERVAL on MONTHLY (every other month)', () => {
        const event: IEvent = {
            id: 'm-bi',
            title: 'Every 2 months',
            start: new Date(2026, 0, 10, 10, 0),
            rrule: 'FREQ=MONTHLY;INTERVAL=2;COUNT=4'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 0, 1),
            end: new Date(2026, 11, 31)
        })
        expect(out).toHaveLength(4)
        expect(out.map((o) => (o.start as Date).getMonth())).toEqual([0, 2, 4, 6])
        expect(out.every((o) => (o.start as Date).getDate() === 10)).toBe(true)
    })
})

describe('rrule.util — expandRecurrence (UNTIL vs COUNT precedence)', () => {
    it('stops at UNTIL even when COUNT would allow more', () => {
        const event: IEvent = {
            id: 'both',
            title: 'UNTIL wins',
            start: new Date(2026, 4, 1, 9, 0),
            rrule: 'FREQ=DAILY;COUNT=30;UNTIL=20260505T000000Z'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out.length).toBeLessThanOrEqual(5)
        expect(out.every((o) => (o.start as Date).getDate() <= 5)).toBe(true)
    })

    it('stops at COUNT even when UNTIL would allow more', () => {
        const event: IEvent = {
            id: 'both2',
            title: 'COUNT wins',
            start: new Date(2026, 4, 1, 9, 0),
            rrule: 'FREQ=DAILY;COUNT=3;UNTIL=20261231T235959Z'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out).toHaveLength(3)
    })

    it('counts only BYDAY-matching days toward COUNT', () => {
        // The cursor walks day-by-day for WEEKLY+BYDAY; `emitted` must only
        // increment on days that pass the filter, otherwise COUNT=4 would
        // exhaust itself on skipped weekdays.
        const event: IEvent = {
            id: 'count-byday',
            title: 'Mon/Fri, 4 times',
            start: new Date(2026, 4, 11, 9, 0), // Monday
            rrule: 'FREQ=WEEKLY;BYDAY=MO,FR;COUNT=4'
        }
        const out = expandRecurrence(event, {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 5, 30)
        })
        expect(out).toHaveLength(4)
        expect(out.map((o) => (o.start as Date).getDate())).toEqual([11, 15, 18, 22])
    })
})
