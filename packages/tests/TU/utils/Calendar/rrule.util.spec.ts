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
