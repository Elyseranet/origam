import type { EffectScope } from 'vue'
import { effectScope, nextTick, onScopeDispose, watchEffect } from 'vue'
import { IN_BROWSER } from '../../consts/Commons/commons.const'
import { SCROLL_STRATEGIES } from '../../consts/Commons/scroll.const'
import type { IScrollStrategyData, IScrollStrategyProps } from '../../interfaces/Commons/scroll.interface'

/*********************************************************
 * useScrollStrategies
 *
 * @description
 * Runs a floating component's configured scroll strategy (close,
 * reposition, block, …) in its own disposable effect scope, re-armed
 * whenever the component becomes active.
 * Independent from `useScroll` / `useScrolling` — no shared state or
 * call dependency.
 ********************************************************/
export function useScrollStrategies (
    props: IScrollStrategyProps,
    data: IScrollStrategyData
) {
    if (!IN_BROWSER) return

    let scope: EffectScope | undefined
    watchEffect(async () => {
        if (scope) {
            scope.stop()
        }

        if (!(data.isActive.value && props.scrollStrategy)) return

        scope = effectScope()
        await nextTick()

        if (!scope.active) return

        if (typeof props.scrollStrategy === 'function') {
            props.scrollStrategy(data, props, scope)
        } else {
            SCROLL_STRATEGIES[props.scrollStrategy]?.(data, props, scope)
        }
    })

    onScopeDispose(() => {
        scope?.stop()
    })
}
