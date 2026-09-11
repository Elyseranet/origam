// Unit tests for `useHotkey`.
// Covers: single key, modifier+key combos, key sequences (a-b),
// preventDefault, inputs guard, event type option, reactive key ref,
// cleanup (returned stop fn removes listener).
//
// IMPORTANT: each test must unmount its host component to run
// `onBeforeUnmount(cleanup)` so window listeners don't bleed between tests.

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useHotkey } from '@origam/composables/Commons/hotkey.composable'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeKeyEvent (
    key: string,
    mods: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {},
    type = 'keydown'
): KeyboardEvent {
    return new KeyboardEvent(type, {
        key,
        ctrlKey: mods.ctrl ?? false,
        shiftKey: mods.shift ?? false,
        altKey: mods.alt ?? false,
        metaKey: mods.meta ?? false,
        bubbles: true,
        cancelable: true
    })
}

/** Mount a host so Vue lifecycle is active (onBeforeUnmount etc.) */
function mountWithHotkey (keys: string | undefined, callback: (e: KeyboardEvent) => void, options: Record<string, unknown> = {}) {
    let cleanupFn!: (() => void)
    const Host = defineComponent({
        setup () {
            cleanupFn = useHotkey(keys, callback, options) as () => void
            return () => h('div')
        }
    })
    const wrapper = mount(Host)
    return { wrapper, cleanup: () => cleanupFn }
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('useHotkey — single key', () => {
    afterEach(() => vi.restoreAllMocks())

    it('fires callback when the registered key is pressed', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('a', cb)
        window.dispatchEvent(makeKeyEvent('a'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('does NOT fire for a different key', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('a', cb)
        window.dispatchEvent(makeKeyEvent('b'))
        wrapper.unmount()
        expect(cb).not.toHaveBeenCalled()
    })

    it('is case-insensitive (uppercase key dispatched, lowercase registered)', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('a', cb)
        window.dispatchEvent(makeKeyEvent('A'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })
})

describe('useHotkey — modifier + key combos', () => {
    afterEach(() => vi.restoreAllMocks())

    it('ctrl+k fires when ctrl is held', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('ctrl+k', cb)
        window.dispatchEvent(makeKeyEvent('k', { ctrl: true }))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('ctrl+k does NOT fire when ctrl is not held', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('ctrl+k', cb)
        window.dispatchEvent(makeKeyEvent('k'))
        wrapper.unmount()
        expect(cb).not.toHaveBeenCalled()
    })

    it('shift+s fires with shift modifier', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('shift+s', cb)
        window.dispatchEvent(makeKeyEvent('s', { shift: true }))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('alt+a fires with alt modifier', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('alt+a', cb)
        window.dispatchEvent(makeKeyEvent('a', { alt: true }))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('ctrl+shift+z fires only with both modifiers', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('ctrl+shift+z', cb)
        window.dispatchEvent(makeKeyEvent('z', { ctrl: true }))
        expect(cb).not.toHaveBeenCalled()
        window.dispatchEvent(makeKeyEvent('z', { ctrl: true, shift: true }))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })
})

describe('useHotkey — key sequence (a-b)', () => {
    afterEach(() => vi.restoreAllMocks())

    it('fires callback only after both keys in sequence', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('a-b', cb)

        window.dispatchEvent(makeKeyEvent('a'))
        expect(cb).not.toHaveBeenCalled()

        window.dispatchEvent(makeKeyEvent('b'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('resets sequence when wrong key pressed mid-sequence', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('a-b', cb)

        window.dispatchEvent(makeKeyEvent('a'))
        window.dispatchEvent(makeKeyEvent('x')) // wrong key — resets
        window.dispatchEvent(makeKeyEvent('b'))
        expect(cb).not.toHaveBeenCalled()

        // Start again correctly
        window.dispatchEvent(makeKeyEvent('a'))
        window.dispatchEvent(makeKeyEvent('b'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })
})

describe('useHotkey — preventDefault option', () => {
    afterEach(() => vi.restoreAllMocks())

    it('calls preventDefault by default', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('a', cb)
        const evt = makeKeyEvent('a')
        const preventSpy = vi.spyOn(evt, 'preventDefault')
        window.dispatchEvent(evt)
        wrapper.unmount()
        expect(preventSpy).toHaveBeenCalled()
    })

    it('does NOT call preventDefault when option is false', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('p', cb, { preventDefault: false })
        const evt = makeKeyEvent('p')
        const preventSpy = vi.spyOn(evt, 'preventDefault')
        window.dispatchEvent(evt)
        wrapper.unmount()
        // Only our handler runs (isolated key 'p', fresh component, unmounted right after)
        expect(preventSpy).not.toHaveBeenCalled()
    })
})

describe('useHotkey — inputs guard', () => {
    afterEach(() => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
        vi.restoreAllMocks()
    })

    it('does NOT fire when an input is focused (inputs=false by default)', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('q', cb, { inputs: false })

        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()

        window.dispatchEvent(makeKeyEvent('q'))
        wrapper.unmount()
        expect(cb).not.toHaveBeenCalled()

        document.body.removeChild(input)
    })

    it('fires even when an input is focused when inputs=true', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('q', cb, { inputs: true })

        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()

        window.dispatchEvent(makeKeyEvent('q'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)

        document.body.removeChild(input)
    })
})

describe('useHotkey — event type option', () => {
    afterEach(() => vi.restoreAllMocks())

    it('listens to keyup instead of keydown when event=keyup', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey('w', cb, { event: 'keyup' })

        window.dispatchEvent(makeKeyEvent('w', {}, 'keydown'))
        expect(cb).not.toHaveBeenCalled()

        window.dispatchEvent(makeKeyEvent('w', {}, 'keyup'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(1)
    })
})

describe('useHotkey — reactive key ref', () => {
    afterEach(() => vi.restoreAllMocks())

    it('switches the registered key when the ref changes', async () => {
        const cb = vi.fn()
        const keyRef = ref<string | undefined>('e')

        const Host = defineComponent({
            setup () {
                useHotkey(keyRef, cb)
                return () => h('div')
            }
        })
        const wrapper = mount(Host)

        window.dispatchEvent(makeKeyEvent('e'))
        expect(cb).toHaveBeenCalledTimes(1)

        keyRef.value = 'r'
        await nextTick()

        window.dispatchEvent(makeKeyEvent('e'))
        expect(cb).toHaveBeenCalledTimes(1) // no new call for old key

        window.dispatchEvent(makeKeyEvent('r'))
        wrapper.unmount()
        expect(cb).toHaveBeenCalledTimes(2) // new key fires
    })

    it('deregisters listener when key ref is set to undefined', async () => {
        const cb = vi.fn()
        const keyRef = ref<string | undefined>('t')

        const Host = defineComponent({
            setup () {
                useHotkey(keyRef, cb)
                return () => h('div')
            }
        })
        const wrapper = mount(Host)

        keyRef.value = undefined
        await nextTick()

        window.dispatchEvent(makeKeyEvent('t'))
        wrapper.unmount()
        expect(cb).not.toHaveBeenCalled()
    })
})

describe('useHotkey — cleanup via returned stop function', () => {
    afterEach(() => vi.restoreAllMocks())

    it('stop() removes the listener', () => {
        const cb = vi.fn()
        const { wrapper, cleanup } = mountWithHotkey('y', cb)
        cleanup()()
        window.dispatchEvent(makeKeyEvent('y'))
        wrapper.unmount()
        expect(cb).not.toHaveBeenCalled()
    })
})

describe('useHotkey — undefined key (no-op)', () => {
    afterEach(() => vi.restoreAllMocks())

    it('does not fire when key is undefined', () => {
        const cb = vi.fn()
        const { wrapper } = mountWithHotkey(undefined, cb)
        window.dispatchEvent(makeKeyEvent('a'))
        wrapper.unmount()
        expect(cb).not.toHaveBeenCalled()
    })
})
