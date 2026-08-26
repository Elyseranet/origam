import type { ITouchDirectiveBinding, ITouchValue } from '../../interfaces/Commons/touch.interface'
import type { TTouchEvent } from '../../types/Commons/touch.type'

import { createHandlers } from '../../utils/Commons/touch.util'

/*********************************************************
 * resolveTarget
 *
 * @description
 * Resolve the element the listeners are actually attached to. With
 * `parent: true` it's `el.parentElement` — a node that survives the
 * directive's own host unmounting, so cleanup MUST target the same
 * resolution the binding used at registration time, not always `el`.
 ********************************************************/
function resolveTarget (el: HTMLElement, useParent: boolean | undefined): HTMLElement | null {
    return useParent ? el.parentElement : el
}

/*********************************************************
 * removeHandlers
 *
 * @description
 * Remove every listener this `uid` registered on `target`, passing back
 * the EXACT `options` used at `addEventListener` time. `removeEventListener`
 * only matches on the (type, callback, capture) triplet — omitting options
 * is equivalent to `capture: false` and silently fails to remove a listener
 * added with `capture: true`.
 ********************************************************/
function removeHandlers (target: HTMLElement, uid: number): void {
    const stored = target._touchHandlers?.[uid]
    if (!stored) return

    const { handlers, options } = stored

    Object.keys(handlers).forEach((eventName) => {
        target.removeEventListener(eventName as TTouchEvent, handlers[eventName as TTouchEvent], options)
    })

    delete target._touchHandlers![uid]
}

/*********************************************************
 * addHandlers
 *
 * @description
 * Build fresh handlers from the CURRENT `value` and register them on
 * `target`. Called from both `mounted` and `updated` so a handler swapped
 * after mount is picked up instead of the stale closure captured once.
 ********************************************************/
function addHandlers (target: HTMLElement, uid: number, value: ITouchValue | undefined): void {
    const options = value?.options ?? {passive: true}
    const handlers = createHandlers(value)

    target._touchHandlers = target._touchHandlers ?? Object.create(null)
    target._touchHandlers![uid] = {handlers, options}

    Object.keys(handlers).forEach((eventName) => {
        target.addEventListener(eventName as TTouchEvent, handlers[eventName as TTouchEvent], options)
    })
}

export const Touch = {
    mounted: (el: HTMLElement, binding: ITouchDirectiveBinding) => {
        const target = resolveTarget(el, binding.value?.parent)
        const uid = binding.instance?.$.uid

        if (!target || uid === undefined) return

        addHandlers(target, uid, binding.value)
    },
    updated: (el: HTMLElement, binding: ITouchDirectiveBinding) => {
        if (binding.value === binding.oldValue) return

        const uid = binding.instance?.$.uid
        if (uid === undefined) return

        /*********************************************************
         * `parent` could in principle flip between renders
         *
         * @description
         * Clean up wherever the previous registration actually lives
         * before re-attaching against the current binding.
         ********************************************************/
        const oldTarget = resolveTarget(el, (binding.oldValue as ITouchValue | undefined)?.parent)
        if (oldTarget) removeHandlers(oldTarget, uid)

        const target = resolveTarget(el, binding.value?.parent)
        if (!target) return

        addHandlers(target, uid, binding.value)
    },
    unmounted: (el: HTMLElement, binding: ITouchDirectiveBinding) => {
        const target = resolveTarget(el, binding.value?.parent)
        const uid = binding.instance?.$.uid

        if (!target || uid === undefined) return

        removeHandlers(target, uid)
    }
}

export default Touch
