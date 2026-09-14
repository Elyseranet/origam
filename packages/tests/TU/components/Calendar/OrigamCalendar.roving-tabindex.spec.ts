/**
 * OrigamCalendar — roving tabindex on the month grid (issue #390) +
 * Enter/Space keyboard activation of a day cell (issue #443).
 *
 * PRE-FIX: every `.origam-calendar__day-cell` carried `tabindex="0"`
 * unconditionally (35-42 tab stops per month, one per Tab press) and the
 * root `onKeydown` moved `internalDate`/`resolvedDate` on arrow keys WITHOUT
 * ever calling `.focus()` on the new cell — `document.activeElement` never
 * changed. Enter/Space on a focused cell did nothing at all: no listener
 * existed for it.
 *
 * This does NOT touch the view switcher (month/week/day/agenda toggle
 * buttons) — that contract is pinned separately in
 * `OrigamCalendar.aria.spec.ts` and is intentionally NOT a roving-tabindex
 * widget (see that file's header comment for why).
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamCalendar from '@origam/components/Calendar/OrigamCalendar.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

function mountCalendar (props: Record<string, unknown> = {}) {
    return mount(OrigamCalendar, {
        props: { currentDate: new Date(2026, 4, 14), ...props } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

function dayCells (wrapper: ReturnType<typeof mountCalendar>) {
    return wrapper.findAll('.origam-calendar__day-cell')
}

describe('OrigamCalendar — month grid roving tabindex (issue #390)', () => {
    it('exactly ONE day cell is a tab stop (tabindex="0"), all others are "-1"', () => {
        const wrapper = mountCalendar()
        const cells = dayCells(wrapper)
        const tabbable = cells.filter((cell) => cell.attributes('tabindex') === '0')
        const stranded = cells.filter((cell) => cell.attributes('tabindex') === '-1')

        expect(tabbable).toHaveLength(1)
        expect(stranded.length).toBe(cells.length - 1)
        wrapper.unmount()
    })

    it('the tab stop is the cell matching currentDate', () => {
        const wrapper = mountCalendar({ currentDate: new Date(2026, 4, 14) })
        const tabbable = dayCells(wrapper).filter((cell) => cell.attributes('tabindex') === '0')[0]

        expect(tabbable.attributes('data-cy')).toBe('origam-calendar-day-2026-05-14')
        wrapper.unmount()
    })

    it('ArrowRight moves BOTH the tabindex AND real DOM focus (document.activeElement)', async () => {
        const wrapper = mountCalendar({ currentDate: new Date(2026, 4, 14) })
        const initial = wrapper.find('[data-cy="origam-calendar-day-2026-05-14"]')
        initial.element.focus()
        expect(document.activeElement).toBe(initial.element)

        await initial.trigger('keydown', { key: 'ArrowRight' })
        await nextTick()
        await nextTick()

        const next = wrapper.find('[data-cy="origam-calendar-day-2026-05-15"]')
        expect(next.exists()).toBe(true)
        expect(document.activeElement).toBe(next.element)
        expect(next.attributes('tabindex')).toBe('0')
        expect(initial.attributes('tabindex')).toBe('-1')
        wrapper.unmount()
    })

    it('ArrowLeft across a month boundary still moves real focus to the new month grid', async () => {
        // 2026-05-01 is a Friday — ArrowLeft (-1 day) crosses into April,
        // forcing monthGrid to recompute onto an entirely different set of
        // rendered cells (old refs unmount, new ones mount).
        const wrapper = mountCalendar({ currentDate: new Date(2026, 4, 1) })
        const initial = wrapper.find('[data-cy="origam-calendar-day-2026-05-01"]')
        initial.element.focus()

        await initial.trigger('keydown', { key: 'ArrowLeft' })
        await nextTick()
        await nextTick()

        const next = wrapper.find('[data-cy="origam-calendar-day-2026-04-30"]')
        expect(next.exists()).toBe(true)
        expect(document.activeElement).toBe(next.element)
        wrapper.unmount()
    })
})

describe('OrigamCalendar — Enter/Space activates the focused day cell (issue #443)', () => {
    it('Enter on the tabbable day cell triggers date-click', async () => {
        const wrapper = mountCalendar({ currentDate: new Date(2026, 4, 14) })
        const cell = wrapper.find('[data-cy="origam-calendar-day-2026-05-14"]')

        await cell.trigger('keydown', { key: 'Enter' })

        const emitted = wrapper.emitted('date-click')
        expect(emitted).toBeTruthy()
        expect((emitted?.[0][0] as Date).toDateString()).toBe(new Date(2026, 4, 14).toDateString())
        wrapper.unmount()
    })

    it('Space (" ") on the day cell ALSO triggers date-click', async () => {
        const wrapper = mountCalendar({ currentDate: new Date(2026, 4, 14) })
        const cell = wrapper.find('[data-cy="origam-calendar-day-2026-05-14"]')

        await cell.trigger('keydown', { key: ' ' })

        expect(wrapper.emitted('date-click')).toBeTruthy()
        wrapper.unmount()
    })

    it('Enter pressed on the toolbar "Today" button does NOT trigger date-click (scoped to gridcell)', async () => {
        const wrapper = mountCalendar()
        const todayBtn = wrapper.find('[data-cy="origam-calendar-today"]')

        await todayBtn.trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('date-click')).toBeFalsy()
        wrapper.unmount()
    })
})
