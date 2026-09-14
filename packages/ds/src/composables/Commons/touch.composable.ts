import { useVelocity } from './velocity.composable'
import {
    TOUCH_DRAG_THRESHOLD_PX,
    TOUCH_EDGE_ZONE_PX,
    TOUCH_FLING_VELOCITY_X,
    TOUCH_FLING_VELOCITY_Y,
    TOUCH_OPEN_DIRECTION_BY_POSITION,
    TOUCH_SETTLE_PROGRESS
} from '../../consts/Commons/touch.const'

import { oops } from '../../utils/Commons/commons.util'

import { computed, onBeforeUnmount, onMounted, Ref, shallowRef } from 'vue'


/*********************************************************
 * useTouch
 *
 * @description
 * Geste tactile swipe-to-open/close pour un panneau ancre a un `position`
 * (`left|right|top|bottom`, ex. Navigation Drawer) : ecoute
 * `touchstart`/`touchmove`/`touchend` sur `window`, ne se declenche que si
 * le doigt part depuis la zone de bord (`TOUCH_EDGE_ZONE_PX`) ou depuis
 * le panneau deja ouvert, decide de la direction de drag (horizontal vs
 * vertical) au premier depassement de `TOUCH_DRAG_THRESHOLD_PX`, et bascule
 * `isActive` a la fin du geste selon la VELOCITE (fling, via
 * `useVelocity`) ou a defaut selon `dragProgress > TOUCH_SETTLE_PROGRESS`.
 *
 * @description
 * `dragStyles` emet une `transform: translate(...)` directement liee a
 * `dragProgress` PENDANT le drag (`transition: none` pour suivre le doigt
 * sans latence) — c'est au composant appelant de reprendre la transition
 * normale une fois `isDragging` retombe a `false`. `touchless.value` a
 * `true` desactive l'ouverture par swipe des `touchstart`, sans retirer
 * les listeners.
 ********************************************************/
export function useTouch ({isActive, isTemporary, width, touchless, position}: {
    isActive: Ref<boolean>
    isTemporary: Ref<boolean>
    width: Ref<number>
    touchless: Ref<boolean>
    position: Ref<'left' | 'right' | 'top' | 'bottom'>
}) {
    onMounted(() => {
        window.addEventListener('touchstart', handleTouchstart, {passive: true})
        window.addEventListener('touchmove', handleTouchmove, {passive: false})
        window.addEventListener('touchend', handleTouchend, {passive: true})
    })

    onBeforeUnmount(() => {
        window.removeEventListener('touchstart', handleTouchstart)
        window.removeEventListener('touchmove', handleTouchmove)
        window.removeEventListener('touchend', handleTouchend)
    })

    const isHorizontal = computed(() => ['left', 'right'].includes(position.value))

    const {addMovement, endTouch, getVelocity} = useVelocity()
    let maybeDragging = false
    const isDragging = shallowRef(false)
    const dragProgress = shallowRef(0)
    const offset = shallowRef(0)
    let start: [number, number] | undefined

    const getOffset = (pos: number, active: boolean): number => {
        return (
            position.value === 'left' ? pos
                : position.value === 'right' ? document.documentElement.clientWidth - pos
                    : position.value === 'top' ? pos
                        : position.value === 'bottom' ? document.documentElement.clientHeight - pos
                            : oops()
        ) - (active ? width.value : 0)
    }
    const getProgress = (pos: number, limit = true): number => {
        const progress = (
            position.value === 'left' ? (pos - offset.value) / width.value
                : position.value === 'right' ? (document.documentElement.clientWidth - pos - offset.value) / width.value
                    : position.value === 'top' ? (pos - offset.value) / width.value
                        : position.value === 'bottom' ? (document.documentElement.clientHeight - pos - offset.value) / width.value
                            : oops()
        )
        return limit ? Math.max(0, Math.min(1, progress)) : progress
    }

    const handleTouchstart = (e: TouchEvent) => {
        if (touchless.value) return

        const touchX = e.changedTouches[0].clientX
        const touchY = e.changedTouches[0].clientY

        const inTouchZone: boolean =
            position.value === 'left' ? touchX < TOUCH_EDGE_ZONE_PX
                : position.value === 'right' ? touchX > document.documentElement.clientWidth - TOUCH_EDGE_ZONE_PX
                    : position.value === 'top' ? touchY < TOUCH_EDGE_ZONE_PX
                        : position.value === 'bottom' ? touchY > document.documentElement.clientHeight - TOUCH_EDGE_ZONE_PX
                            : oops()

        const inElement: boolean = isActive.value && (
            position.value === 'left' ? touchX < width.value
                : position.value === 'right' ? touchX > document.documentElement.clientWidth - width.value
                    : position.value === 'top' ? touchY < width.value
                        : position.value === 'bottom' ? touchY > document.documentElement.clientHeight - width.value
                            : oops()
        )

        if (
            inTouchZone ||
            inElement ||
            (isActive.value && isTemporary.value)
        ) {
            maybeDragging = true
            start = [touchX, touchY]

            offset.value = getOffset(isHorizontal.value ? touchX : touchY, isActive.value)
            dragProgress.value = getProgress(isHorizontal.value ? touchX : touchY)

            endTouch(e)
            addMovement(e)
        }
    }
    const handleTouchmove = (e: TouchEvent) => {
        const touchX = e.changedTouches[0].clientX
        const touchY = e.changedTouches[0].clientY

        if (maybeDragging) {
            if (!e.cancelable) {
                maybeDragging = false
                return
            }

            const dx = Math.abs(touchX - start![0])
            const dy = Math.abs(touchY - start![1])

            const thresholdMet = isHorizontal.value
                ? dx > dy && dx > TOUCH_DRAG_THRESHOLD_PX
                : dy > dx && dy > TOUCH_DRAG_THRESHOLD_PX

            if (thresholdMet) {
                isDragging.value = true
                maybeDragging = false
            } else if ((isHorizontal.value ? dy : dx) > TOUCH_DRAG_THRESHOLD_PX) {
                maybeDragging = false
            }
        }

        if (!isDragging.value) return

        e.preventDefault()
        addMovement(e)

        const progress = getProgress(isHorizontal.value ? touchX : touchY, false)
        dragProgress.value = Math.max(0, Math.min(1, progress))

        if (progress > 1) {
            offset.value = getOffset(isHorizontal.value ? touchX : touchY, true)
        } else if (progress < 0) {
            offset.value = getOffset(isHorizontal.value ? touchX : touchY, false)
        }
    }
    const handleTouchend = (e: TouchEvent) => {
        maybeDragging = false

        if (!isDragging.value) return

        addMovement(e)

        isDragging.value = false

        const velocity = getVelocity(e.changedTouches[0].identifier)
        const vx = Math.abs(velocity.x)
        const vy = Math.abs(velocity.y)
        const thresholdMet = isHorizontal.value
            ? vx > vy && vx > TOUCH_FLING_VELOCITY_X
            : vy > vx && vy > TOUCH_FLING_VELOCITY_Y

        if (thresholdMet) {
            isActive.value = velocity.direction === (TOUCH_OPEN_DIRECTION_BY_POSITION[position.value] || oops())
        } else {
            isActive.value = dragProgress.value > TOUCH_SETTLE_PROGRESS
        }
    }

    const dragStyles = computed(() => {
        return isDragging.value ? {
            transform:
                position.value === 'left' ? `translateX(calc(-100% + ${dragProgress.value * width.value}px))`
                    : position.value === 'right' ? `translateX(calc(100% - ${dragProgress.value * width.value}px))`
                        : position.value === 'top' ? `translateY(calc(-100% + ${dragProgress.value * width.value}px))`
                            : position.value === 'bottom' ? `translateY(calc(100% - ${dragProgress.value * width.value}px))`
                                : oops(),
            transition: 'none'
        } : undefined
    })

    return {
        isDragging,
        dragProgress,
        dragStyles
    }
}
