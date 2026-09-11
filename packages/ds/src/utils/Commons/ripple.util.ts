import { DELAY_RIPPLE, ORIGAM_RIPPLE_STOP_KEY, RIPPLES } from '../../consts'

import type { IRippleDirectiveBinding, IRippleHtmlElement, IRippleOptions } from '../../interfaces'

import type { TRippleEvent } from '../../types'

import { isObject } from '../../utils'

/**
 * Update ripple.
 *
 * @param el         …
 * @param binding    …
 * @param wasEnabled …
 */
export function updateRipple (el: IRippleHtmlElement, binding: IRippleDirectiveBinding, wasEnabled: boolean) {
    const {value, modifiers} = binding
    const enabled = isRippleEnabled(value)

    if (!enabled) {
        RIPPLES.hide(el)
    }

    el._ripple = el._ripple ?? {}
    el._ripple.enabled = enabled
    el._ripple.centered = modifiers.center
    el._ripple.circle = modifiers.circle
    if (isObject(value) && value.class) {
        el._ripple.class = value.class
    }

    if (enabled && !wasEnabled) {
        if (modifiers.stop) {
            el.addEventListener('touchstart', rippleStop, {passive: true})
            el.addEventListener('mousedown', rippleStop)
            return
        }

        el.addEventListener('touchstart', rippleShow, {passive: true})
        el.addEventListener('touchend', rippleHide, {passive: true})
        el.addEventListener('touchmove', rippleCancelShow, {passive: true})
        el.addEventListener('touchcancel', rippleHide)

        el.addEventListener('mousedown', rippleShow)
        el.addEventListener('mouseup', rippleHide)
        el.addEventListener('mouseleave', rippleHide)

        el.addEventListener('keydown', keyboardRippleShow)
        el.addEventListener('keyup', keyboardRippleHide)

        el.addEventListener('blur', focusRippleHide)

        // Anchor tags can be dragged, causes other hides to fail - #1537
        el.addEventListener('dragstart', rippleHide, {passive: true})
    } else if (!enabled && wasEnabled) {
        rippleRemoveListeners(el)
    }
}

/**
 * Is ripple enabled.
 *
 * @param value …
 * @returns …
 */
export function isRippleEnabled (value: any): value is true {
    return typeof value === 'undefined' || !!value
}

/**
 * Is touch event.
 *
 * @param e …
 * @returns …
 */
export function isTouchEvent (e: TRippleEvent): e is TouchEvent {
    return e.constructor.name === 'TouchEvent'
}

/**
 * Is keyboard event.
 *
 * @param e …
 * @returns …
 */
export function isKeyboardEvent (e: TRippleEvent): e is KeyboardEvent {
    return e.constructor.name === 'KeyboardEvent'
}

/**
 * Calculate.
 *
 * @param e     …
 * @param el    …
 * @param value …
 */
export function calculate (
    e: TRippleEvent,
    el: IRippleHtmlElement,
    value: IRippleOptions = {}
) {
    let localX = 0
    let localY = 0

    if (!isKeyboardEvent(e)) {
        const offset = el.getBoundingClientRect()
        const target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e

        localX = target.clientX - offset.left
        localY = target.clientY - offset.top
    }

    let radius = Math.sqrt(el.clientWidth ** 2 + el.clientHeight ** 2) / 2
    let scale = 0.3

    if (el._ripple?.circle) {
        scale = 0.15
        radius = el.clientWidth / 2
        radius = value.center ? radius : radius + Math.sqrt((localX - radius) ** 2 + (localY - radius) ** 2) / 4
    }

    const centerX = `${(el.clientWidth - (radius * 2)) / 2}px`
    const centerY = `${(el.clientHeight - (radius * 2)) / 2}px`

    const x = value.center ? centerX : `${localX - radius}px`
    const y = value.center ? centerY : `${localY - radius}px`

    return {radius, scale, x, y, centerX, centerY}
}

/**
 * Ripple show.
 *
 * @param e …
 */
export function rippleShow (e: TRippleEvent) {
    const value: IRippleOptions = {}
    const element = e.currentTarget as IRippleHtmlElement | undefined

    if (!element?._ripple || element._ripple.touched || e[ORIGAM_RIPPLE_STOP_KEY]) return

    // Don't allow the event to trigger ripples on any other elements
    e[ORIGAM_RIPPLE_STOP_KEY] = true

    if (isTouchEvent(e)) {
        element._ripple.touched = true
        element._ripple.isTouch = true
    } else {
        // It's possible for touch events to fire
        // as mouse events on Android/iOS, this
        // will skip the event call if it has
        // already been registered as touch
        if (element._ripple.isTouch) return
    }

    value.center = element._ripple.centered || isKeyboardEvent(e)
    if (element._ripple.class) {
        value.class = element._ripple.class
    }

    if (isTouchEvent(e)) {
        // already queued that shows or hides the ripple
        if (element._ripple.showTimerCommit) return

        element._ripple.showTimerCommit = () => {
            RIPPLES.show(e, element, value)
        }

        element._ripple.showTimer = window.setTimeout(() => {
            if (element?._ripple?.showTimerCommit) {
                element._ripple.showTimerCommit()
                element._ripple.showTimerCommit = null
            }
        }, DELAY_RIPPLE)
    } else {
        RIPPLES.show(e, element, value)
    }
}

/**
 * Ripple stop.
 *
 * @param e …
 */
export function rippleStop (e: TRippleEvent) {
    e[ORIGAM_RIPPLE_STOP_KEY] = true
}

/**
 * Ripple hide.
 *
 * @param e …
 */
export function rippleHide (e: Event) {
    const element = e.currentTarget as IRippleHtmlElement | null
    if (!element?._ripple) return

    window.clearTimeout(element._ripple.showTimer)

    // The touch interaction occurs before the show timer is triggered.
    // We still want to show ripple effect.
    if (e.type === 'touchend' && element._ripple.showTimerCommit) {
        element._ripple.showTimerCommit()
        element._ripple.showTimerCommit = null

        // re-queue ripple hiding
        element._ripple.showTimer = window.setTimeout(() => {
            rippleHide(e)
        })
        return
    }

    window.setTimeout(() => {
        if (element._ripple) {
            element._ripple.touched = false
        }
    })
    RIPPLES.hide(element)
}

/**
 * Ripple cancel show.
 *
 * @param e …
 */
export function rippleCancelShow (e: MouseEvent | TouchEvent) {
    const element = e.currentTarget as IRippleHtmlElement | undefined

    if (!element?._ripple) return

    if (element._ripple.showTimerCommit) {
        element._ripple.showTimerCommit = null
    }

    window.clearTimeout(element._ripple.showTimer)
}

/**
 * Ripple remove listeners.
 *
 * @param el …
 */
export function rippleRemoveListeners (el: IRippleHtmlElement) {
    el.removeEventListener('mousedown', rippleShow)
    el.removeEventListener('touchstart', rippleShow)
    el.removeEventListener('touchend', rippleHide)
    el.removeEventListener('touchmove', rippleCancelShow)
    el.removeEventListener('touchcancel', rippleHide)
    el.removeEventListener('mouseup', rippleHide)
    el.removeEventListener('mouseleave', rippleHide)
    el.removeEventListener('keydown', keyboardRippleShow)
    el.removeEventListener('keyup', keyboardRippleHide)
    el.removeEventListener('dragstart', rippleHide)
    el.removeEventListener('blur', focusRippleHide)
}

/**
 * Ripple transform.
 *
 * @param el    …
 * @param value …
 */
export function rippleTransform (el: IRippleHtmlElement, value: string) {
    el.style.transform = value
}

let keyboardRipple = false

/**
 * Keyboard ripple show.
 *
 * @param e …
 */
export function keyboardRippleShow (e: KeyboardEvent) {
    if (!keyboardRipple && (e.key === 'Enter' || e.key === ' ')) {
        keyboardRipple = true
        rippleShow(e)
    }
}

/**
 * Keyboard ripple hide.
 *
 * @param e …
 */
export function keyboardRippleHide (e: KeyboardEvent) {
    keyboardRipple = false
    rippleHide(e)
}

/**
 * Focus ripple hide.
 *
 * @param e …
 */
export function focusRippleHide (e: FocusEvent) {
    if (keyboardRipple) {
        keyboardRipple = false
        rippleHide(e)
    }
}
