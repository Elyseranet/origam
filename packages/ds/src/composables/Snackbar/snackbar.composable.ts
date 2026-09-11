import { nextTick, onScopeDispose, shallowRef } from 'vue'

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
        const style = el ? getComputedStyle(el) : {transitionDuration: 0.2}
        const interval = parseFloat(style.transitionDuration) * 1000 || 200

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
