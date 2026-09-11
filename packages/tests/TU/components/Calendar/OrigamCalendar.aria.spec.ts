/**
 * OrigamCalendar — ARIA contract of the view switcher.
 *
 * WHY THIS LIVES IN THE UNIT SUITE
 * The e2e spec (`e2e/calendar.spec.ts`) carried a `test.fixme` for over a
 * release because the component and the test disagreed on the switcher's
 * semantics: the component renders `role="group"` + `<button aria-pressed>`,
 * the test asserted `role="tab"` + `aria-selected`. Nothing caught the drift,
 * partly because CI runs the whole Vitest suite but only a subset of the e2e
 * specs. The contract is therefore pinned here, where it is actually guarded.
 *
 * THE CONTRACT: a group of toggle buttons, not a tablist.
 *
 * 1. Tabs need a panel. WAI-ARIA APG "Tabs" requires each `role="tab"` to
 *    reference its panel via `aria-controls`, the panel carrying
 *    `role="tabpanel"` + `aria-labelledby`. OrigamCalendar renders exactly
 *    one body (`v-if` on `resolvedView`); the three inactive views have no
 *    DOM node. Three of four tabs would point `aria-controls` at
 *    non-existent IDs — invalid, with undefined AT behaviour.
 *
 * 2. The switcher swaps a rendering, not a section of content. Month / week
 *    / day / agenda are four projections of the same events into the same
 *    region. That is a mode control (pressed / not pressed), not "more
 *    content elsewhere" (tabs).
 *
 * 3. `tablist` is a composite widget: one tab stop, roving `tabindex`, and
 *    Arrow/Home/End MUST move between tabs. The calendar root already binds
 *    the arrows to date navigation and calls `preventDefault()`. The
 *    `swallows ArrowRight` test below MEASURES that collision. Declaring
 *    `role="tab"` while the arrows belong to the date would announce a
 *    keyboard model the component does not honour — the OrigamColorPicker
 *    defect (`role="application"` + live `aria-valuetext`, arrows ignored).
 *
 * 4. What ships is already complete: named `role="group"`, native
 *    `<button type="button">` (own tab stop, Space/Enter from the platform),
 *    `aria-pressed` tracking state. "No ARIA is better than bad ARIA" is
 *    satisfied by finishing this pattern, not by starting a richer one.
 *
 * Migrating to tabs later is defensible but is a whole delivery: carve the
 * switcher out of the root `onKeydown`, add roving tabindex + Home/End, give
 * each view a persistent panel node with a stable id, wire `aria-controls` /
 * `aria-labelledby`. If that lands, this spec is the one to rewrite — and
 * the `swallows ArrowRight` test is the first that must change.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

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

const VIEWS = ['month', 'week', 'day', 'agenda'] as const

function mountCalendar (props: Record<string, unknown> = {}) {
    return mount(OrigamCalendar, {
        props: props as never,
        global: { plugins: [createOrigam()] }
    })
}

const viewBtn = (wrapper: ReturnType<typeof mountCalendar>, view: string) =>
    wrapper.find(`[data-cy="origam-calendar-view-${view}"]`)

describe('OrigamCalendar view switcher — toggle-button group semantics', () => {
    it('renders one native <button> per view', () => {
        const wrapper = mountCalendar()
        for (const view of VIEWS) {
            const btn = viewBtn(wrapper, view)
            expect(btn.exists(), `missing view button: ${view}`).toBe(true)
            expect(btn.element.tagName).toBe('BUTTON')
            // type="button" keeps the switcher from submitting a wrapping form.
            expect(btn.attributes('type')).toBe('button')
        }
    })

    it('wraps the buttons in a named role=group', () => {
        const wrapper = mountCalendar()
        const group = wrapper.find('.origam-calendar__toolbar-views')
        expect(group.exists()).toBe(true)
        expect(group.attributes('role')).toBe('group')
        // Without an accessible name the group is an anonymous container and
        // AT cannot say what the set of buttons is for.
        expect(group.attributes('aria-label')).toBeTruthy()
    })

    it('exposes aria-pressed on every view button', () => {
        const wrapper = mountCalendar()
        for (const view of VIEWS) {
            expect(viewBtn(wrapper, view).attributes('aria-pressed')).toBeDefined()
        }
    })

    it('presses exactly one button — the active view', async () => {
        const wrapper = mountCalendar({ view: 'week' })
        await wrapper.vm.$nextTick()
        const pressed = VIEWS.filter(
            (view) => viewBtn(wrapper, view).attributes('aria-pressed') === 'true'
        )
        expect(pressed).toEqual(['week'])
    })

    it('moves the pressed state when another view is activated', async () => {
        const wrapper = mountCalendar()
        expect(viewBtn(wrapper, 'month').attributes('aria-pressed')).toBe('true')

        await viewBtn(wrapper, 'day').trigger('click')

        expect(viewBtn(wrapper, 'day').attributes('aria-pressed')).toBe('true')
        expect(viewBtn(wrapper, 'month').attributes('aria-pressed')).toBe('false')
    })

    it('does NOT claim the tablist pattern it cannot honour', () => {
        // The guard against silently re-adopting `role="tab"` without the
        // rest of the tablist contract (roving tabindex, Arrow/Home/End,
        // aria-controls → a real tabpanel). If a future change adds tabs
        // properly, rewrite this spec — do not just delete the assertion.
        const wrapper = mountCalendar()
        for (const view of VIEWS) {
            const btn = viewBtn(wrapper, view)
            expect(btn.attributes('role')).toBeUndefined()
            expect(btn.attributes('aria-selected')).toBeUndefined()
            expect(btn.attributes('aria-controls')).toBeUndefined()
        }
        expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
        expect(wrapper.find('[role="tab"]').exists()).toBe(false)
        expect(wrapper.find('[role="tabpanel"]').exists()).toBe(false)
    })

    it('leaves each button its own tab stop (no roving tabindex)', () => {
        // A toggle-button group is NOT a composite widget: every button is
        // reachable with Tab. A stray tabindex="-1" here would strand the
        // inactive views for keyboard users without providing the arrow-key
        // navigation that would justify removing them from the tab order.
        const wrapper = mountCalendar()
        for (const view of VIEWS) {
            expect(viewBtn(wrapper, view).attributes('tabindex')).toBeUndefined()
        }
    })
})

describe('OrigamCalendar view switcher — why tabs would be a lie today', () => {
    it('the root keydown handler swallows ArrowRight from a view button', () => {
        // MEASURED EVIDENCE for the contract decision above. `@keydown` sits
        // on the calendar root, so a key pressed on a descendant bubbles up
        // and is consumed for date navigation (with preventDefault()).
        //
        // A tablist owes its user ArrowLeft/ArrowRight to move between tabs.
        // Here ArrowRight moves the DATE instead — so the tab contract is
        // already pre-empted. This test is deliberately phrased as "the
        // arrows belong to the date": if the switcher ever becomes a real
        // tablist, this expectation must be inverted in the same commit.
        const wrapper = mountCalendar({ currentDate: new Date(2026, 4, 14) })

        viewBtn(wrapper, 'month').trigger('keydown', { key: 'ArrowRight' })

        const emitted = wrapper.emitted('update:currentDate')
        expect(emitted).toBeTruthy()
        expect((emitted?.[0][0] as Date).toDateString()).toBe('Fri May 15 2026')
    })

    it('has no per-view panel node to point aria-controls at', () => {
        // Only the active view's body exists in the DOM — `v-if`, not
        // `v-show`. Three of four tabs would reference absent IDs.
        const wrapper = mountCalendar()
        expect(wrapper.find('[data-cy="origam-calendar-body-month"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="origam-calendar-body-week"]').exists()).toBe(false)
        expect(wrapper.find('[data-cy="origam-calendar-body-day"]').exists()).toBe(false)
    })
})
