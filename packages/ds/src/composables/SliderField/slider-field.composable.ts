import type { ISliderFieldProps } from '../../interfaces'

import { clamp, getDecimals } from '../../utils'

import { computed } from 'vue'

/*********************************************************
 * useSteps
 *
 * @description
 * Pure-function stepping math used by `<OrigamSliderField>`.
 * Returns reactive min / max / step / decimals refs and a
 * `roundValue` helper that snaps any raw number to the
 * nearest valid step (clamped to [min, max]).
 *
 * The browser owns drag now — `useSlider` (the legacy JS
 * drag pipeline) was deleted with the native `<input
 * type="range">` migration. This file used to be 280 LOC.
 ********************************************************/
export function useSteps (props: ISliderFieldProps) {
    const min = computed(() => {
        return parseFloat((props.min as string | number | null | undefined) ?? 0 as unknown as string)
    })
    const max = computed(() => {
        return parseFloat((props.max as string | number | null | undefined) ?? 100 as unknown as string)
    })
    const step = computed(() => {
        const step = (props.step as string | number | null | undefined) ?? 0

        return +step > 0 ? parseFloat(step as unknown as string) : 0
    })
    const decimals = computed(() => {
        return Math.max(getDecimals(step.value), getDecimals(min.value))
    })

    const roundValue = (value: string | number) => {
        value = parseFloat(value as unknown as string)

        if (step.value <= 0) return value

        const clamped = clamp(value, min.value, max.value)
        const offset = min.value % step.value
        const newValue = Math.round((clamped - offset) / step.value) * step.value + offset

        return parseFloat(Math.min(newValue, max.value).toFixed(decimals.value))
    }

    return {min, max, step, decimals, roundValue}
}
