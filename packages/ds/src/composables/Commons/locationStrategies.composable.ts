import { onScopeDispose, ref, watch } from 'vue'
import { useToggleScope } from '../../composables'
import { IN_BROWSER, LOCATION_STRATEGIES } from '../../consts'
import type { ILocationStrategyData, ILocationStrategyProps } from '../../interfaces'

/*********************************************************
 * useLocationStrategies
 *
 * @description
 * Runs a floating component's configured location strategy
 * (connected, static, custom function…), re-armed on window resize
 * and on strategy change, inside a disposable toggle scope.
 * Independent from `useLocation` — no shared state or call
 * dependency.
 ********************************************************/
export function useLocationStrategies (
    props: ILocationStrategyProps,
    data: ILocationStrategyData
) {
    const contentStyles = ref({})
    const updateLocation = ref<(e: Event) => void>()

    const handleResize = (e: Event) => {
        updateLocation.value?.(e)
    }

    if (IN_BROWSER) {
        useToggleScope(() => !!(data.isActive.value && props.locationStrategy), reset => {
            watch(() => props.locationStrategy, reset)
            onScopeDispose(() => {
                window.removeEventListener('resize', handleResize)
                updateLocation.value = undefined
            })

            window.addEventListener('resize', handleResize, {passive: true})

            if (props.locationStrategy) {
                if (typeof props.locationStrategy === 'function') {
                    updateLocation.value = props.locationStrategy(data, props, contentStyles)?.updateLocation
                } else {
                    updateLocation.value = LOCATION_STRATEGIES[props.locationStrategy](data, props, contentStyles)?.updateLocation
                }
            }
        })
    }

    return {
        contentStyles,
        updateLocation
    }
}
