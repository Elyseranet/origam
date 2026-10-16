// Regression for #1152 — every `<OrigamSelect>` warned
// "[Origam] A clickable icon is a button…" at mount, TWICE (once from
// `OrigamIcon`, once from the `OrigamClassIcon` the click listener fell
// through to). Source: the menu chevron carried `@click="noop"`, a handler
// that does nothing — inherited from Vuetify's VSelect, where an `onClick`
// is what gives the icon its pointer cursor. Here `useIconAccessibility`
// reads `$attrs.onClick` to decide the glyph is "clickable", so the noop
// also flipped the chevron to `aria-hidden="false"`: a decorative glyph,
// exposed to assistive tech, with no name and no keyboard path.
//
// The chevron is NOT a control. Opening the menu by mouse goes through
// `@mousedown` (kept), and by keyboard through the field itself — the
// combobox. The pointer cursor is restored by the Select's own scoped rule
// on `.origam-select__menu-icon`.
//
// Measured in the playground e2e (#1152): 662 warnings on 4 scenarios, all
// with the component chain `OrigamIcon < OrigamField < OrigamInput <
// OrigamTextField < OrigamSelect` (331) or
// `OrigamClassIcon < component < OrigamIcon < OrigamField …` (331).

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
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

class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

const CLICKABLE_ICON = 'A clickable icon is a button'

describe('OrigamSelect — the menu chevron is decorative (#1152)', () => {
    afterEach(() => vi.restoreAllMocks())

    it('mounting a Select emits no "clickable icon" warning', async () => {
        const warnings: Array<string> = []
        vi.spyOn(console, 'warn').mockImplementation((...args: Array<unknown>) => {
            warnings.push(String(args[0]))
        })

        const wrapper = mount(OrigamSelect, {
            props: { items: ['a', 'b'] } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        expect(wrapper.find('.origam-select__menu-icon').exists()).toBe(true)
        expect(warnings.filter((w) => w.includes(CLICKABLE_ICON))).toEqual([])

        wrapper.unmount()
    })

    it('the chevron stays hidden from assistive tech and carries no "clickable" class', async () => {
        const wrapper = mount(OrigamSelect, {
            props: { items: ['a', 'b'] } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const icon = wrapper.find('.origam-select__menu-icon')

        expect(icon.attributes('aria-hidden')).toBe('true')
        expect(icon.classes()).not.toContain('origam-icon--clickable')

        wrapper.unmount()
    })
})
