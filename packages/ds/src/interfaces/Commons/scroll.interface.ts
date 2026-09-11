import type { TScrollBehavior, TScrollStrategy, TScrollStrategyFn } from '../../types'
import type { Ref } from 'vue'

export interface IScrollProps {
    /**
     * Space-separated list of scroll behaviours, e.g. `"hide inverted"` or
     * `"elevate active"`. `inverted` is a MODIFIER that flips the trigger of
     * `hide` / `collapse` / `elevate` and does nothing on its own. The
     * `(string & {})` member keeps single-token autocomplete while allowing
     * multi-token combinations.
     */
    scrollBehavior?: TScrollBehavior | (string & {})
    scrollTarget?: string
    scrollThreshold?: string | number
}

export interface IScrollArguments {
    canScroll?: Readonly<Ref<boolean>>
}

export interface IScrollStrategyProps {
    scrollStrategy?: TScrollStrategy | TScrollStrategyFn
    contained?: boolean
}

export interface IScrollStrategyData {
    root: Ref<HTMLElement | undefined>
    contentEl: Ref<HTMLElement | undefined>
    targetEl: Ref<HTMLElement | undefined>
    isActive: Ref<boolean>
    updateLocation: Ref<((e: Event) => void) | undefined>
}
