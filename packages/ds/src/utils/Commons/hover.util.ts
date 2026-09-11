import { HOVER, ORIGAM_HOVER_STOP_KEY } from '../../consts'

import type { IHoverDirectiveBinding, IHoverHtmlElement, IHoverOptions } from '../../interfaces'

import type { THoverEvent } from '../../types'

import { isObject, isTouchEvent } from '../../utils'

/**
 * Update hover.
 *
 * @param el         …
 * @param binding    …
 * @param wasEnabled …
 * @param name       …
 */
export function updateHover (el: IHoverHtmlElement, binding: IHoverDirectiveBinding, wasEnabled: boolean, name: string) {
    const {value, modifiers} = binding
    const enabled = isHoverEnabled(value)
    const options: IHoverOptions = {class: `${name}--hover`}

    if (isObject(value) && typeof value.class === 'string') {
        options.class = value.class
    }

    el._hover = el._hover ?? {}
    el._hover.enabled = enabled
    el._hover.class = options.class
    el._hover.mouseenter = isObject(value) ? value.mouseenter : undefined
    el._hover.mouseleave = isObject(value) ? value.mouseleave : undefined

    if (!enabled) {
        HOVER.hide(el, options)
    }

    if (enabled && !wasEnabled) {
        if (modifiers.stop) {
            el.addEventListener('touchstart', hoverStop, {passive: true})
            el.addEventListener('mouseenter', hoverStop)
            return
        }

        el.addEventListener('touchstart', hoverShow, {passive: true})
        el.addEventListener('touchend', hoverHide, {passive: true})
        el.addEventListener('touchcancel', hoverHide)

        el.addEventListener('mouseenter', hoverShow)
        el.addEventListener('mouseleave', hoverHide)
    } else if (!enabled && wasEnabled) {
        hoverRemoveListeners(el)
    }
}

/**
 * Is hover enabled.
 *
 * @param value …
 * @returns …
 */
export function isHoverEnabled (value: any): value is true {
    return typeof value === 'undefined' || !!value
}

/**
 * Hover show.
 *
 * @param e …
 */
export function hoverShow (e: THoverEvent) {
    const value: IHoverOptions = {class: ''}
    const element = e.currentTarget as IHoverHtmlElement | undefined

    if (!element?._hover || element._hover.touched || e[ORIGAM_HOVER_STOP_KEY]) return

    // Don't allow the event to trigger ripples on any other elements
    e[ORIGAM_HOVER_STOP_KEY] = true

    if (isTouchEvent(e)) {
        element._hover.touched = true
        element._hover.isTouch = true
    } else {
        // It's possible for touch events to fire
        // as mouse events on Android/iOS, this
        // will skip the event call if it has
        // already been registered as touch
        if (element._hover.isTouch) return
    }

    if (element._hover.class) {
        value.class = element._hover.class
    }

    HOVER.show(e, element, value)

    element._hover.mouseenter?.(element, e)
}

/**
 * Hover stop.
 *
 * @param e …
 */
export function hoverStop (e: THoverEvent) {
    e[ORIGAM_HOVER_STOP_KEY] = true
}

/**
 * Hover hide.
 *
 * @param e …
 */
export function hoverHide (e: Event) {
    const value: IHoverOptions = {class: ''}
    const element = e.currentTarget as IHoverHtmlElement | null

    if (!element?._hover) return

    if (element._hover.class) {
        value.class = element._hover.class
    }

    HOVER.hide(element, value)

    element._hover.mouseleave?.(element, e)
}

/**
 * Hover remove listeners.
 *
 * @param el …
 */
export function hoverRemoveListeners (el: IHoverHtmlElement) {
    el.removeEventListener('mouseenter', hoverShow)
    el.removeEventListener('mouseleave', hoverHide)
    el.removeEventListener('touchstart', hoverShow)
    el.removeEventListener('touchend', hoverHide)
    el.removeEventListener('touchcancel', hoverHide)
}
