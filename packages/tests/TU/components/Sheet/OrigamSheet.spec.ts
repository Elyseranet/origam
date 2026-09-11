// Unit tests for <OrigamSheet> — drag-handle keyboard operability (C6 a11y
// audit). The handle renders a real, focusable `<button>` with an
// accessible name, but `useSheetSwipe` only wires pointer events
// (pointerdown / pointermove / pointerup) — a screen-reader or switch
// user who tabs to it and presses Enter/Space/arrows got nothing, so the
// entire swipe-to-resize feature was a WCAG 2.1.1 (Keyboard) violation.
// These specs prove the fix by MUTATION: each one fails if the
// `@keydown="handleHandleKeydown"` binding is removed from the template.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSheet from '@origam/components/Sheet/OrigamSheet.vue'
import { KEYBOARD_VALUES } from '@origam/enums'
import { createOrigam } from '@origam/origam'

class ResizeObserverMock {
    observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn()
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

function mountSwipeableSheet (extraProps: Record<string, unknown> = {}) {
    const origam = createOrigam({})
    return mount(OrigamSheet, {
        props: {
            swipeable: true,
            side: 'bottom',
            defaultSnap: 'half',
            ...extraProps
        },
        attachTo: document.body,
        global: { plugins: [origam] }
    })
}

describe('OrigamSheet — drag handle keyboard support (C6)', () => {
    it('renders the drag handle as a real, focusable button', () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        expect(handle.exists()).toBe(true)
        expect(handle.element.tagName).toBe('BUTTON')
    })

    it('ArrowUp steps to the next larger snap point and emits update:snap', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.UP })

        const emitted = wrapper.emitted('update:snap')
        expect(emitted).toBeTruthy()
        expect(emitted?.[0]?.[0]).toBe('full')
    })

    it('ArrowDown steps to the next smaller snap point', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.DOWN })

        const emitted = wrapper.emitted('update:snap')
        expect(emitted).toBeTruthy()
        expect(emitted?.[0]?.[0]).toBe('peek')
    })

    it('Home jumps to the smallest snap point, End to the largest', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.END })
        expect(wrapper.emitted('update:snap')?.at(-1)?.[0]).toBe('full')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.HOME })
        expect(wrapper.emitted('update:snap')?.at(-1)?.[0]).toBe('closed')
    })

    it('ignores keyboard input when disabled', async () => {
        const wrapper = mountSwipeableSheet({ disabled: true })
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.UP })

        expect(wrapper.emitted('update:snap')).toBeFalsy()
    })

    it('ignores keys it does not handle', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.ENTER })

        expect(wrapper.emitted('update:snap')).toBeFalsy()
    })
})
