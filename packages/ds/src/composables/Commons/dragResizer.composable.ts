import { computed, onUnmounted, Ref, ref } from 'vue'
import { useEventListener } from './eventListener.composable'

import { AXIS, CLIENT_POSITION } from '../../enums'

import type { TAxis } from '../../types/Commons/axis.type'

import { addWindowListener, clamp, getPosition } from '../../utils/Commons/commons.util'

/*********************************************************
 * useDragResizer
 *
 * @description
 * Attache un drag mousedown/touchstart sur `el` qui fait varier `value`
 * (un `Ref<number>`, borne a `[min, max]` via `clamp`) le long de `axis` —
 * utilise pour les poignees de redimensionnement (panneau, colonne…).
 * `resizing` reste `true` tant que le geste (souris ou tactile) n'est pas
 * termine.
 *
 * @description
 * ⛔ Seul l'axe `X` (`AXIS.X`) est reellement gere : `isVertical` est
 * commente en mort dans le code et un `// TODO - Rework for both axis`
 * l'annonce explicitement. Passer `AXIS.Y` fait juste tomber dans la
 * branche verticale de `getPosition` sans etre teste par ce composable.
 ********************************************************/
export function useDragResizer (el: HTMLElement | undefined, value: Ref<number>, min: number, max: number, axis: TAxis) {
    const resizing = ref(false)

    const removeListeners: Array<() => void> = []
    const onUnmountedCleanupFns: Array<() => void> = []

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

    /*********************************************************
     * mousedown / touchstart wiring
     *
     * @description
     * Cast to the generic `Event` handler shape `useEventListener` expects
     * — same pattern already used above for `addWindowListener`. Vue always
     * delivers a `MouseEvent` / `TouchEvent` for these events, the handler
     * signatures are just narrower than the generic listener type the
     * composable declares.
     ********************************************************/
    if (el) {
        useEventListener(el, 'mousedown', onMouseDown as (e: Event) => void)
        useEventListener(el, 'touchstart', onTouchStart as (e: Event) => void)
    }
}
