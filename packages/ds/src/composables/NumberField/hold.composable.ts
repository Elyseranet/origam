import { type MaybeRefOrGetter, onScopeDispose, toValue } from "vue"

import { NUMBER_FIELD_DEFAULT_HOLD_DELAY, NUMBER_FIELD_DEFAULT_HOLD_REPEAT } from '../../consts/NumberField/number-field.const'

/*********************************************************
 * useHold
 *
 * @description
 * `holdRepeat` / `holdDelay` accept `MaybeRefOrGetter<number>` (a plain
 * number still works) and are read via `toValue()` inside `holdStart` —
 * at the moment a NEW hold sequence begins — rather than once when
 * `useHold()` itself is called. The caller (`OrigamNumberField.vue`)
 * passes `() => props.holdRepeat` / `() => props.holdDelay`, so a prop
 * change reaching the component after mount is honoured by the next
 * press-and-hold, instead of being silently frozen for the component's
 * whole lifetime (#487).
 ********************************************************/
export function useHold ({toggleUpDown}: {
    toggleUpDown: (increment: boolean) => void
}, holdRepeat: MaybeRefOrGetter<number> = NUMBER_FIELD_DEFAULT_HOLD_REPEAT, holdDelay: MaybeRefOrGetter<number> = NUMBER_FIELD_DEFAULT_HOLD_DELAY) {
    let timeout = -1
    let interval = -1

    onScopeDispose(holdStop)

    function holdStart (value: 'up' | 'down') {
        holdStop()
        tick(value)
        timeout = window.setTimeout(() => {
            interval = window.setInterval(() => tick(value), toValue(holdRepeat))
        }, toValue(holdDelay))
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
