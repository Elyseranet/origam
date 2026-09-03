import { nextTick, onScopeDispose, shallowRef } from 'vue'

import {
    SNACKBAR_COUNTDOWN_FALLBACK_INTERVAL_MS,
    SNACKBAR_COUNTDOWN_FALLBACK_TRANSITION_S,
    SNACKBAR_COUNTDOWN_MS_PER_SECOND
} from '../../consts/Snackbar/snackbar.const'

/*********************************************************
 * useCountdown
 ********************************************************/
export function useCountdown (milliseconds: number) {
    const time = shallowRef(milliseconds)
    let timer = -1

    const clear = () => {
        clearInterval(timer)
    }

    const reset = () => {
        clear()

        nextTick(() => time.value = milliseconds)
    }

    const start = (el?: HTMLElement) => {
        const style = el ? getComputedStyle(el) : {transitionDuration: SNACKBAR_COUNTDOWN_FALLBACK_TRANSITION_S}
        const interval = parseFloat(style.transitionDuration) * SNACKBAR_COUNTDOWN_MS_PER_SECOND
            || SNACKBAR_COUNTDOWN_FALLBACK_INTERVAL_MS

        clear()

        if (time.value <= 0) return

        const startTime = performance.now()
        timer = window.setInterval(() => {
            const elapsed = performance.now() - startTime + interval
            time.value = Math.max(milliseconds - elapsed, 0)

            if (time.value <= 0) clear()
        }, interval)
    }

    onScopeDispose(clear)

    return {clear, time, start, reset}
}
