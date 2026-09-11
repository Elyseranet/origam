import { watch } from 'vue'
import { noop, resolveUnref, tryOnScopeDispose, unrefElement } from '../../utils'

/*********************************************************
 * useEventListener
 ********************************************************/
export function useEventListener (...args: Array<any>) {
    let target
    let events
    let listeners
    let options

    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
        [events, listeners, options] = args

        target = typeof window !== 'undefined' ? window : void 0
    } else {
        [target, events, listeners, options] = args
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

    const cleanups: Array<any> = []

    const cleanup = () => {
        cleanups.forEach((fn) => fn())
        cleanups.length = 0
    }
    const register = (el: HTMLElement, event: string, listener: EventListenerOrEventListenerObject, opt: AddEventListenerOptions) => {
        el.addEventListener(event, listener, opt)

        return () => el.removeEventListener(event, listener, opt)
    }

    const stopWatch = watch(() => [unrefElement(target), resolveUnref(options)], ([el, options2]) => {
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
