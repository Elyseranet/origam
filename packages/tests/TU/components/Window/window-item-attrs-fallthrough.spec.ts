// Regression coverage — `<OrigamWindowItem>` silently DROPPED every
// fallthrough attribute (ARIA, data-*, title, …).
//
// Root cause: the component's template root is `<origam-transition>`, which
// is itself a thin wrapper whose own root is Vue's built-in `<Transition>`.
// Attributes that fall through land on `<Transition>` — a renderless
// built-in that forwards NOTHING to the element it animates — so the
// `.origam-window-item` div rendered in the slot never receives them.
//
// The consequence is not cosmetic: `role="group"` +
// `aria-roledescription="slide"` is what the ARIA APG carousel pattern
// requires on each slide, and it is impossible to set from the outside.
// `OrigamCarouselItem`, which composes this component, inherits the same
// hole.
//
// The mount uses `h()` for the slot children on purpose: a template STRING
// passed as a VTU slot is rendered as escaped text, mounts zero items, and
// produces a red test that has nothing to do with the component.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { createOrigam } from '@origam/origam'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamWindowItem from '@origam/components/Window/OrigamWindowItem.vue'

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

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

function mountWindowWithItems (itemAttrs: Record<string, unknown> = {}) {
    return mount(OrigamWindow, {
        props: { modelValue: 'a' } as never,
        slots: {
            default: () => [
                h(OrigamWindowItem, { value: 'a', ...itemAttrs }, { default: () => 'slide A' }),
                h(OrigamWindowItem, { value: 'b' }, { default: () => 'slide B' })
            ]
        },
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamWindowItem — fallthrough attributes reach the rendered element', () => {
    it('mounts the items at all (guards the escaped-slot-string trap)', () => {
        const wrapper = mountWindowWithItems()

        expect(wrapper.findAll('.origam-window-item')).toHaveLength(2)
    })

    it('forwards role="group" to the rendered .origam-window-item element', () => {
        const wrapper = mountWindowWithItems({ role: 'group' })
        const item = wrapper.find('.origam-window-item')

        expect(item.attributes('role')).toBe('group')
    })

    it('forwards aria-roledescription="slide" to the rendered element', () => {
        const wrapper = mountWindowWithItems({ 'aria-roledescription': 'slide' })
        const item = wrapper.find('.origam-window-item')

        expect(item.attributes('aria-roledescription')).toBe('slide')
    })

    it('forwards aria-label and data-* attributes to the rendered element', () => {
        const wrapper = mountWindowWithItems({ 'aria-label': 'Slide 1 of 2', 'data-cy': 'first-slide' })
        const item = wrapper.find('.origam-window-item')

        expect(item.attributes('aria-label')).toBe('Slide 1 of 2')
        expect(item.attributes('data-cy')).toBe('first-slide')
    })

    it('does not leak the forwarded attributes onto the sibling item', () => {
        const wrapper = mountWindowWithItems({ role: 'group' })
        const items = wrapper.findAll('.origam-window-item')

        expect(items[0].attributes('role')).toBe('group')
        expect(items[1].attributes('role')).toBeUndefined()
    })
})
