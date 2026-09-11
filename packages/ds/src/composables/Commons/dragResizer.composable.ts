import { computed, onUnmounted, Ref, ref } from 'vue'
import { useEventListener } from '../../composables'

import { AXIS, CLIENT_POSITION } from '../../enums'

import type { TAxis } from '../../types'

import { addWindowListener, clamp, getPosition } from '../../utils'

/*********************************************************
 * useDragResizer
 ********************************************************/
export function useDragResizer (el: HTMLElement | undefined, value: Ref<number>, min: number, max: number, axis: TAxis) {
    const resizing = ref(false)

    const removeListeners: Array<any> = []
    const onUnmountedCleanupFns: Array<any> = []

    onUnmounted(() => {
        onUnmountedCleanupFns.forEach((fn) => fn())
    })

    const isHorizontal = computed(() => {
        return axis === AXIS.X
    })
    // const isVertical = computed(() => {
    //   return axis === AXIS.Y
    // })

    // TODO - Rework for both axis

    const onDragEnd = () => {
        removeListeners.forEach((fn) => fn())
        resizing.value = false
    }

    const onMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const start = getPosition(e, isHorizontal.value ? CLIENT_POSITION.X : CLIENT_POSITION.Y)
        const initialStart = value.value

        resizing.value = true

        const onMouseMove = (e: MouseEvent) => {
            const clickOffset = getPosition(e, isHorizontal.value ? CLIENT_POSITION.X : CLIENT_POSITION.Y)
            const delta = clickOffset - start

            value.value = clamp(initialStart + delta, min, max)
        }
        const onMouseUp = onDragEnd

        removeListeners.push(...[
            addWindowListener('mousemove', onMouseMove as (e: Event) => void, onUnmountedCleanupFns),
            addWindowListener('mouseup', onMouseUp, onUnmountedCleanupFns)
        ])
    }
    const onTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const start = getPosition(e, isHorizontal.value ? CLIENT_POSITION.X : CLIENT_POSITION.Y)
        const initialStart = value.value

        resizing.value = true

        const onTouchMove = (e: TouchEvent) => {
            const clickOffset = getPosition(e, isHorizontal.value ? CLIENT_POSITION.X : CLIENT_POSITION.Y)
            const delta = clickOffset - start

            value.value = Math.max(min, Math.min(max, initialStart + delta))
        }
        const onTouchEnd = onDragEnd

        removeListeners.push(...[
            addWindowListener('touchmove', onTouchMove as (e: Event) => void, onUnmountedCleanupFns),
            addWindowListener('touchend', onTouchEnd, onUnmountedCleanupFns),
            addWindowListener('touchcancel', onTouchEnd, onUnmountedCleanupFns)
        ])
    }

    if (el) {
        useEventListener(el, 'mousedown', onMouseDown)
        useEventListener(el, 'touchstart', onTouchStart)
    }
}
