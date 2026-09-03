import type { Ref } from 'vue'
import { watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { noop, tryOnScopeDispose } from '../../utils/Commons/commons.util'
import { resolveUnref, unrefElement } from '../../utils/Commons/eventListener.util'

import type { TEventListenerTarget } from '../../types/Commons/event.type'

type TEventListenerEvents = string | Array<string>
type TEventListenerListeners = EventListenerOrEventListenerObject | Array<EventListenerOrEventListenerObject>
type TEventListenerOptions = MaybeRefOrGetter<AddEventListenerOptions | undefined>

/*********************************************************
 * useEventListener
 ********************************************************/
export function useEventListener (
    events: TEventListenerEvents,
    listeners: TEventListenerListeners,
    options?: TEventListenerOptions
): () => void
export function useEventListener (
    target: TEventListenerTarget,
    events: TEventListenerEvents,
    listeners: TEventListenerListeners,
    options?: TEventListenerOptions
): () => void
export function useEventListener (...args: Array<unknown>): () => void {
    let target: TEventListenerTarget
    let events: TEventListenerEvents
    let listeners: TEventListenerListeners
    let options: TEventListenerOptions

    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
        [events, listeners, options] = args as [TEventListenerEvents, TEventListenerListeners, TEventListenerOptions]

        target = typeof window !== 'undefined' ? window : void 0
    } else {
        [target, events, listeners, options] = args as [TEventListenerTarget, TEventListenerEvents, TEventListenerListeners, TEventListenerOptions]
    }

    if (!target) {
        return noop
    }

    if (!Array.isArray(events)) {
        events = [events]
    }

    if (!Array.isArray(listeners)) {
        listeners = [listeners]
    }

    const cleanups: Array<() => void> = []

    const cleanup = () => {
        cleanups.forEach((fn) => fn())
        cleanups.length = 0
    }
    const register = (el: HTMLElement, event: string, listener: EventListenerOrEventListenerObject, opt: AddEventListenerOptions) => {
        el.addEventListener(event, listener, opt)

        return () => el.removeEventListener(event, listener, opt)
    }

    /*********************************************************
     * target / options resolution
     *
     * @description
     * `unrefElement` / `resolveUnref` (utils/Commons/eventListener.util.ts)
     * predate `TEventListenerTarget` and only accept a bare `Ref`. They are
     * not part of this pass's 18 composables, and both already gracefully
     * no-op on a non-Ref value (`unref()` returns its argument unchanged
     * when it isn't a Ref) — the cast below is a narrow, internal bridge to
     * that pre-existing loose utility, not part of this composable's own
     * public signature.
     ********************************************************/
    const stopWatch = watch(() => [unrefElement(target as unknown as Ref), resolveUnref(options as unknown as Ref | (() => unknown))], ([el, options2]) => {
        cleanup()

        if (!el) return

        cleanups.push(...events.flatMap((event) => {
            return listeners.map((listener) => register(el, event, listener, options2))
        }))
    }, {immediate: true, flush: 'post'})

    const stop = () => {
        stopWatch()
        cleanup()
    }

    tryOnScopeDispose(stop)

    return stop
}
