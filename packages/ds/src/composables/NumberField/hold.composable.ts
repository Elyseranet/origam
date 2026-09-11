import { onScopeDispose } from "vue"

/*********************************************************
 * useHold
 ********************************************************/
export function useHold ({toggleUpDown}: {
    toggleUpDown: (increment: boolean) => void
}, holdRepeat: number = 50, holdDelay: number = 500) {
    let timeout = -1
    let interval = -1

    onScopeDispose(holdStop)

    function holdStart (value: 'up' | 'down') {
        holdStop()
        tick(value)
        timeout = window.setTimeout(() => {
            interval = window.setInterval(() => tick(value), holdRepeat)
        }, holdDelay)
    }

    function holdStop () {
        window.clearTimeout(timeout)
        window.clearInterval(interval)
    }

    function tick (value: 'up' | 'down') {
        toggleUpDown(value === 'up')
    }

    return {holdStart, holdStop}
}
