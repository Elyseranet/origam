// Tests for `createDate` / `useDate` composable.
//
// `createDate(options, locale)` is tested directly: it merges provided options
// with the built-in locale map and returns { options, instance }.
//
// `useDate()` is skipped: it calls `inject(ORIGAM_DATE_OPTIONS_KEY)` AND
// `useLocale()` (which itself calls `inject(ORIGAM_LOCALE_KEY)`). Both
// injections require a Vue application context provided by a full
// `createOrigam()` setup. Providing fake injection values headlessly would
// require monkey-patching the injection symbols, which is testing
// implementation details rather than behaviour. The adapter integration is
// covered by the Histoire smoke tests and the e2e suite.
//
// `vi.useFakeTimers()` is used where tests would otherwise depend on wall time.

import { ref } from 'vue'
import { describe, expect, it, vi, afterEach } from 'vitest'

import { createDate } from '@origam/composables/Commons/date.composable'
import { DateAdapter } from '@origam/services/Commons/date-adapter.service'

import type { IDateOptions, ILocaleInstance } from '@origam/interfaces'

// Minimal ILocaleInstance stub — only `current` is consumed by createInstance.
function makeLocale (lang = 'en'): ILocaleInstance {
    return {
        current: ref(lang),
        fallback: ref('en'),
        messages: ref({}),
        t: (k: string) => k,
        n: (v: number) => String(v),
        provide: () => undefined
    } as unknown as ILocaleInstance
}

afterEach(() => {
    vi.useRealTimers()
})

describe('createDate — structure', () => {
    it('returns { options, instance }', () => {
        const locale = makeLocale()
        const result = createDate(undefined, locale)
        expect(result).toHaveProperty('options')
        expect(result).toHaveProperty('instance')
    })

    it('options.adapter defaults to DateAdapter constructor', () => {
        const locale = makeLocale()
        const { options } = createDate(undefined, locale)
        expect(options.adapter).toBe(DateAdapter)
    })

    it('built-in locale map includes standard languages', () => {
        const locale = makeLocale()
        const { options } = createDate(undefined, locale)
        expect(options.locale).toHaveProperty('en', 'en-US')
        // 'fr' is intentionally absent from the built-in map (comment: "not the same value for all variants")
        expect(options.locale).not.toHaveProperty('fr')
        expect(options.locale).toHaveProperty('de', 'de-DE')
        expect(options.locale).toHaveProperty('ja', 'ja-JP')
        expect(options.locale).toHaveProperty('it', 'it-IT')
    })

    it('custom options.locale entry overrides built-in', () => {
        const locale = makeLocale()
        const custom: Partial<IDateOptions> = {
            locale: { en: 'en-GB' } as any
        }
        const { options } = createDate(custom as IDateOptions, locale)
        expect(options.locale.en).toBe('en-GB')
    })

    it('custom adapter constructor is preserved after merge', () => {
        const locale = makeLocale()

        class MyAdapter extends DateAdapter {}

        const custom = { adapter: MyAdapter, locale: {} as any }
        const { options } = createDate(custom as IDateOptions, locale)
        expect(options.adapter).toBe(MyAdapter)
    })
})

describe('createDate — instance is a DateAdapter', () => {
    it('instance exposes date() method', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        expect(typeof instance.date).toBe('function')
    })

    it('instance exposes format() method', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        expect(typeof instance.format).toBe('function')
    })

    it('instance.date(undefined) returns a Date (current date)', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date()
        expect(d).toBeInstanceOf(Date)
    })

    it('instance.date("2026-01-15") parses correctly', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-01-15') as Date
        expect(d).toBeInstanceOf(Date)
        expect(d.getFullYear()).toBe(2026)
        expect(d.getMonth()).toBe(0) // January = 0
        expect(d.getDate()).toBe(15)
    })

    it('instance.isValid returns true for a valid date', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-06-01') as Date
        expect(instance.isValid(d)).toBe(true)
    })

    it('instance.isValid returns false for invalid date', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        expect(instance.isValid('not-a-date')).toBe(false)
    })

    it('instance.isAfter — correctly orders two dates', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const earlier = instance.date('2025-01-01') as Date
        const later = instance.date('2026-01-01') as Date
        expect(instance.isAfter(later, earlier)).toBe(true)
        expect(instance.isAfter(earlier, later)).toBe(false)
    })

    it('instance.isBefore — correctly orders two dates', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const earlier = instance.date('2025-01-01') as Date
        const later = instance.date('2026-01-01') as Date
        expect(instance.isBefore(earlier, later)).toBe(true)
    })

    it('instance.isSameDay — same day', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d1 = instance.date('2026-03-15') as Date
        const d2 = instance.date('2026-03-15') as Date
        expect(instance.isSameDay(d1, d2)).toBe(true)
    })

    it('instance.isSameDay — different day', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d1 = instance.date('2026-03-15') as Date
        const d2 = instance.date('2026-03-16') as Date
        expect(instance.isSameDay(d1, d2)).toBe(false)
    })

    it('instance.toISO returns YYYY-MM-DD string', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-07-04') as Date
        expect(instance.toISO(d)).toBe('2026-07-04')
    })

    it('instance.addDays adds the correct number of days', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-01-01') as Date
        const result = instance.addDays(d, 10) as Date
        expect(result.getDate()).toBe(11)
    })

    it('instance.addMonths advances by month boundary', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-01-31') as Date
        const result = instance.addMonths(d, 1) as Date
        // addMonths sets day to 1 first, so month boundary is clean
        expect(result.getMonth()).toBe(1) // February
    })

    it('instance.getYear returns the year number', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-09-20') as Date
        expect(instance.getYear(d)).toBe(2026)
    })

    it('instance.getMonth returns 0-based month', () => {
        const locale = makeLocale()
        const { instance } = createDate(undefined, locale)
        const d = instance.date('2026-09-20') as Date
        expect(instance.getMonth(d)).toBe(8) // September = 8
    })
})

describe('useDate — requires injected context (skipped)', () => {
    it.skip(
        'useDate() throws if no date options are injected (inject returns undefined)',
        () => {
            // Cannot test in isolation: requires ORIGAM_DATE_OPTIONS_KEY and
            // ORIGAM_LOCALE_KEY to be provided via a full createOrigam() app context.
            // Tested via Histoire smoke spec and e2e suite.
        }
    )
})
