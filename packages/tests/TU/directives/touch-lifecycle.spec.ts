// v-touch (#484) — two independent lifecycle defects:
//
// 1. `unmounted` calls `removeEventListener(type, handler)` without the
//    `options` used at `addEventListener` time. `removeEventListener` only
//    matches on the (type, callback, capture) triplet, so a listener
//    registered with `capture: true` is never actually removed.
// 2. There is no `updated` hook: `createHandlers(binding.value)` runs once
//    in `mounted` and the resulting closures are registered as-is. A
//    consumer that swaps its handler prop keeps triggering the OLD handler.
//
// Both are measured directly: register, (optionally) update or unmount,
// dispatch the real DOM event, and assert which handler actually ran.
// Note: the DOM swallows exceptions thrown inside a listener, so these
// specs assert on `vi.fn()` call counts, never on a `throw`.

import { describe, expect, it, vi } from 'vitest'

import Touch from '@origam/directives/Touch/touch.directive'

function makeTouchEvent (type: string, clientX = 0, clientY = 0): TouchEvent {
    const touch = { clientX, clientY, identifier: 0 } as Touch
    const evt = new Event(type, { bubbles: true, cancelable: true }) as unknown as TouchEvent
    Object.defineProperty(evt, 'changedTouches', { value: [touch] })
    return evt
}

describe('v-touch — unmounted must remove what mounted attached (#484, defect 1)', () => {
    it('a listener registered with capture:true is never invoked after unmount', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)

        const start = vi.fn()
        const binding = {
            value: { start, options: { capture: true, passive: true } },
            instance: { $: { uid: 1 } }
        } as any

        Touch.mounted(el, binding)
        Touch.unmounted(el, binding)

        el.dispatchEvent(makeTouchEvent('touchstart'))

        // RED before the fix: removeEventListener without {capture: true}
        // does not match the original listener, so `start` still fires.
        expect(start).not.toHaveBeenCalled()
    })

    it('control — a listener registered without capture is correctly removed (was already true)', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)

        const start = vi.fn()
        const binding = {
            value: { start },
            instance: { $: { uid: 2 } }
        } as any

        Touch.mounted(el, binding)
        Touch.unmounted(el, binding)

        el.dispatchEvent(makeTouchEvent('touchstart'))

        expect(start).not.toHaveBeenCalled()
    })

    it('leaves no dangling `_touchHandlers` entry for the uid after unmount', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)

        const binding = {
            value: { start: vi.fn(), options: { capture: true } },
            instance: { $: { uid: 3 } }
        } as any

        Touch.mounted(el, binding)
        Touch.unmounted(el, binding)

        expect(el._touchHandlers?.[3]).toBeUndefined()
    })
})

describe('v-touch — handlers must not freeze at mount (#484, defect 2)', () => {
    it('exposes an `updated` hook', () => {
        expect(typeof (Touch as any).updated).toBe('function')
    })

    it('re-reads the bound handler on `updated` instead of running the one captured at mount', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)

        const handlerA = vi.fn()
        const handlerB = vi.fn()

        const bindingMounted = { value: { start: handlerA }, instance: { $: { uid: 4 } } } as any
        Touch.mounted(el, bindingMounted)

        const bindingUpdated = {
            value: { start: handlerB },
            oldValue: bindingMounted.value,
            instance: { $: { uid: 4 } }
        } as any

        ;(Touch as any).updated(el, bindingUpdated)

        el.dispatchEvent(makeTouchEvent('touchstart'))

        expect(handlerA).not.toHaveBeenCalled()
        expect(handlerB).toHaveBeenCalledTimes(1)
    })
})
