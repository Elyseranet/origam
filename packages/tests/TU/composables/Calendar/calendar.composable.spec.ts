import { describe, expect, it } from 'vitest'

import type { IEvent } from '@origam/interfaces'

import { useCalendar } from '@origam/composables/Calendar/calendar.composable'

function options (overrides: Partial<{
    view: 'month' | 'week' | 'day' | 'agenda'
    currentDate: Date
    events: Array<IEvent>
    firstDayOfWeek: number
    slotDuration: number
    dayStartHour: number
    dayEndHour: number
}> = {}) {
    return {
        events: () => overrides.events ?? [],
        view: () => overrides.view ?? 'month',
        currentDate: () => overrides.currentDate ?? new Date(2026, 4, 14),
        firstDayOfWeek: () => overrides.firstDayOfWeek ?? 1,
        slotDuration: () => overrides.slotDuration ?? 30,
        dayStartHour: () => overrides.dayStartHour ?? 0,
        dayEndHour: () => overrides.dayEndHour ?? 24
    }
}

describe('useCalendar — visibleDateRange', () => {
    it('spans the full 6-week month grid in month view', () => {
        const cal = useCalendar(options({ view: 'month' }))
        const range = cal.visibleDateRange.value
        const days = Math.round(
            (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000)
        )
        expect(days).toBe(41) // 6 weeks × 7 days - 1 = 41 days span
    })

    it('spans 6 days in week view', () => {
        const cal = useCalendar(options({ view: 'week' }))
        const range = cal.visibleDateRange.value
        const days = Math.round(
            (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000)
        )
        expect(days).toBe(6)
    })

    it('spans one day in day view', () => {
        const cal = useCalendar(options({ view: 'day' }))
        const range = cal.visibleDateRange.value
        expect(range.start.getDate()).toBe(range.end.getDate())
    })
})

describe('useCalendar — expandedEvents', () => {
    it('returns an empty list when no events are provided', () => {
        const cal = useCalendar(options())
        expect(cal.expandedEvents.value).toEqual([])
    })

    it('passes single events through', () => {
        const event: IEvent = {
            id: 1,
            title: 'Meeting',
            start: new Date(2026, 4, 14, 10, 0),
            end: new Date(2026, 4, 14, 11, 0)
        }
        const cal = useCalendar(options({ events: [event] }))
        expect(cal.expandedEvents.value).toHaveLength(1)
    })

    it('expands a weekly RRULE inside the visible month', () => {
        const event: IEvent = {
            id: 'r',
            title: 'Weekly',
            start: new Date(2026, 4, 11, 10, 0), // Mon
            end: new Date(2026, 4, 11, 11, 0),
            rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
        }
        const cal = useCalendar(options({ events: [event] }))
        const out = cal.expandedEvents.value
        expect(out.length).toBeGreaterThan(3)
    })

    it('sorts events by start time then id', () => {
        const a: IEvent = { id: 'a', title: 'A', start: new Date(2026, 4, 14, 9, 0) }
        const b: IEvent = { id: 'b', title: 'B', start: new Date(2026, 4, 14, 8, 0) }
        const cal = useCalendar(options({ events: [a, b] }))
        const out = cal.expandedEvents.value
        expect(out[0].id).toBe('b')
        expect(out[1].id).toBe('a')
    })
})

describe('useCalendar — buildMonthGrid', () => {
    it('returns 6×7 dates', () => {
        const cal = useCalendar(options())
        const grid = cal.buildMonthGrid(new Date(2026, 4, 14))
        expect(grid).toHaveLength(6)
        for (const row of grid) expect(row).toHaveLength(7)
    })
})

describe('useCalendar — buildDayGrid', () => {
    it('returns 48 slots for 24h × 30min', () => {
        const cal = useCalendar(options({ slotDuration: 30, dayStartHour: 0, dayEndHour: 24 }))
        const slots = cal.buildDayGrid(new Date(2026, 4, 14))
        expect(slots).toHaveLength(48)
    })

    it('respects the dayStartHour / dayEndHour cap', () => {
        const cal = useCalendar(options({ slotDuration: 60, dayStartHour: 8, dayEndHour: 18 }))
        const slots = cal.buildDayGrid(new Date(2026, 4, 14))
        expect(slots).toHaveLength(10)
        expect(slots[0].date.getHours()).toBe(8)
    })

    it('marks the hour-mark slots', () => {
        const cal = useCalendar(options({ slotDuration: 30 }))
        const slots = cal.buildDayGrid(new Date(2026, 4, 14))
        expect(slots[0].isHourMark).toBe(true)
        expect(slots[1].isHourMark).toBe(false)
    })
})

describe('useCalendar — buildWeekGrid', () => {
    it('returns 7 columns', () => {
        const cal = useCalendar(options())
        const week = cal.buildWeekGrid(new Date(2026, 4, 14))
        expect(week).toHaveLength(7)
    })
})

describe('useCalendar — buildAgenda', () => {
    it('groups events by day', () => {
        const events: Array<IEvent> = [
            { id: 1, title: 'A', start: new Date(2026, 4, 14, 10, 0) },
            { id: 2, title: 'B', start: new Date(2026, 4, 14, 12, 0) },
            { id: 3, title: 'C', start: new Date(2026, 4, 15, 9, 0) }
        ]
        const cal = useCalendar(options({ view: 'agenda', events }))
        const agenda = cal.buildAgenda()
        expect(agenda).toHaveLength(2)
        expect(agenda[0].events).toHaveLength(2)
        expect(agenda[1].events).toHaveLength(1)
    })
})

describe('useCalendar — navigate', () => {
    it('emits prev/next via the setCurrentDate callback', () => {
        let captured: Date | null = null
        const cal = useCalendar(
            options({ view: 'month' }),
            undefined,
            (date) => { captured = date }
        )
        cal.navigate('next')
        expect((captured as Date | null)?.getMonth()).toBe(5) // June
    })

    it('jumps to today', () => {
        let captured: Date | null = null
        const cal = useCalendar(
            options({ view: 'month', currentDate: new Date(2020, 0, 1) }),
            undefined,
            (date) => { captured = date }
        )
        cal.navigate('today')
        expect((captured as Date | null)?.getFullYear()).toBeGreaterThanOrEqual(2026)
    })
})

describe('useCalendar — positionEvent', () => {
    it('returns null for an event without a start', () => {
        const cal = useCalendar(options())
        const out = cal.positionEvent(
            { id: 1, title: 'X', start: 'not-a-date' },
            new Date(2026, 4, 14),
            1
        )
        expect(out).toBe(null)
    })

    it('positions an event at minute offset × pxPerMin', () => {
        const cal = useCalendar(options())
        const dayStart = new Date(2026, 4, 14, 0, 0)
        const event: IEvent = {
            id: 1,
            title: 'M',
            start: new Date(2026, 4, 14, 10, 0),
            end: new Date(2026, 4, 14, 11, 0)
        }
        const out = cal.positionEvent(event, dayStart, 1)!
        expect(out.top).toBe(600)
        expect(out.height).toBeGreaterThanOrEqual(60)
    })
})
