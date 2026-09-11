import type { ITouchHandlers, ITouchStoredHandlers } from '../../interfaces'

import type { TTouchWrapper } from '../../types'

/**
 * Handle gesture.
 *
 * @param wrapper …
 */
export function handleGesture (wrapper: TTouchWrapper) {
    const {touchstartX, touchendX, touchstartY, touchendY} = wrapper
    const dirRatio = 0.5
    const minDistance = 16

    wrapper.offsetX = touchendX - touchstartX
    wrapper.offsetY = touchendY - touchstartY

    if (Math.abs(wrapper.offsetY) < dirRatio * Math.abs(wrapper.offsetX)) {
        if (wrapper.left && touchendX < touchstartX - minDistance) {
            wrapper.left(wrapper)
        }
        if (wrapper.right && touchendX > touchstartX + minDistance) {
            wrapper.right(wrapper)
        }
    }

    if (Math.abs(wrapper.offsetX) < dirRatio * Math.abs(wrapper.offsetY)) {
        if (wrapper.up && touchendY < touchstartY - minDistance) {
            wrapper.up(wrapper)
        }
        if (wrapper.down && touchendY > touchstartY + minDistance) {
            wrapper.down(wrapper)
        }
    }
}

/**
 * Touchstart.
 *
 * @param event   …
 * @param wrapper …
 */
export function touchstart (event: TouchEvent, wrapper: TTouchWrapper) {
    const touch = event.changedTouches[0]
    wrapper.touchstartX = touch.clientX
    wrapper.touchstartY = touch.clientY

    wrapper.start?.({originalEvent: event, ...wrapper})
}

/**
 * Touchend.
 *
 * @param event   …
 * @param wrapper …
 */
export function touchend (event: TouchEvent, wrapper: TTouchWrapper) {
    const touch = event.changedTouches[0]
    wrapper.touchendX = touch.clientX
    wrapper.touchendY = touch.clientY

    wrapper.end?.({originalEvent: event, ...wrapper})

    handleGesture(wrapper)
}

/**
 * Touchmove.
 *
 * @param event   …
 * @param wrapper …
 */
export function touchmove (event: TouchEvent, wrapper: TTouchWrapper) {
    const touch = event.changedTouches[0]
    wrapper.touchmoveX = touch.clientX
    wrapper.touchmoveY = touch.clientY

    wrapper.move?.({originalEvent: event, ...wrapper})
}

/**
 * Create handlers.
 *
 * @param value …
 * @returns …
 */
export function createHandlers (value: ITouchHandlers = {}): ITouchStoredHandlers {
    const wrapper = {
        touchstartX: 0,
        touchstartY: 0,
        touchendX: 0,
        touchendY: 0,
        touchmoveX: 0,
        touchmoveY: 0,
        offsetX: 0,
        offsetY: 0,
        left: value.left,
        right: value.right,
        up: value.up,
        down: value.down,
        start: value.start,
        move: value.move,
        end: value.end
    }

    return {
        touchstart: (e: TouchEvent) => touchstart(e, wrapper),
        touchend: (e: TouchEvent) => touchend(e, wrapper),
        touchmove: (e: TouchEvent) => touchmove(e, wrapper)
    }
}
