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

// Regression coverage for issue #677 — C5 (emits). `update:snap` above is
// thoroughly proven, but `OrigamSheet.vue:179` also declares and emits
// `update:open` (`emit('update:open', !isClosed)`, fired from the
// `watch(currentSnap, …)` handler whenever a snap transition crosses the
// closed/open boundary) and NO test — TU or e2e — asserted it before this
// commit (grep of 'update:open' across both suites returned zero
// occurrences). C5 requires that EVERY declared emit be proven, not just
// the most visible one from a batch of fixes (the #461 keyboard fix above
// covered update:snap but happened to leave update:open unproven).
describe('OrigamSheet — update:open emission on closed/open transitions (C5, #677)', () => {
    it('emits update:open(false) when a keyboard snap transition CROSSES INTO closed', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        // defaultSnap is 'half' (not closed) — Home jumps straight to
        // 'closed', crossing the boundary this emit exists to signal.
        await handle.trigger('keydown', { key: KEYBOARD_VALUES.HOME })

        const emittedOpen = wrapper.emitted('update:open')
        expect(emittedOpen).toBeTruthy()
        expect(emittedOpen?.at(-1)?.[0]).toBe(false)
    })

    it('emits update:open(true) when a keyboard snap transition CROSSES OUT of closed', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        await handle.trigger('keydown', { key: KEYBOARD_VALUES.HOME }) // -> closed
        await handle.trigger('keydown', { key: KEYBOARD_VALUES.UP })   // -> peek (open again)

        const emittedOpen = wrapper.emitted('update:open')
        expect(emittedOpen).toBeTruthy()
        expect(emittedOpen?.at(-1)?.[0]).toBe(true)
    })

    it('does NOT emit update:open for a transition that stays on the open side (half -> full)', async () => {
        const wrapper = mountSwipeableSheet()
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        // defaultSnap 'half' -> ArrowUp -> 'full': never touches 'closed',
        // so the boundary this emit exists to signal is never crossed.
        await handle.trigger('keydown', { key: KEYBOARD_VALUES.UP })

        expect(wrapper.emitted('update:snap')?.at(-1)?.[0]).toBe('full')
        expect(wrapper.emitted('update:open')).toBeFalsy()
    })
})
