import { computed } from "vue"
import type { ComputedRef } from "vue"

import { useVModel } from './vModel.composable'
import type { IHoverProps } from '../../interfaces/Commons/hover.interface'
import type { IHoverState } from '../../interfaces/Commons/state-effect.interface'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/**
 * Track whether the host element is being hovered AND expose any
 * style override the consumer attached to the `hover` prop.
 *
 * `props.hover` accepts three shapes (mirrors `IHoverProps`):
 *
 *   • `undefined` / `false` →
 *       isHover    : reflects mouseenter/leave (default behaviour)
 *       hoverState : undefined (no style override — `useStateEffect`
 *                    falls back to resting tokens / auto-darkening)
 *
 *   • `true` →
 *       isHover    : FORCED to `true` regardless of pointer events
 *                    (stories, tests, parent-controlled state)
 *       hoverState : undefined
 *
 *   • `IHoverState` object (e.g. `{ bgColor: 'success', border: 'thick' }`) →
 *       isHover    : reactive to mouseenter/leave (UNLESS `enabled: true`
 *                    is set inside the object, which forces it on like
 *                    the bare `true` case)
 *       hoverState : the object itself — consumed by `useStateEffect`
 *                    to swap effective values per axis.
 *
 * `hoverClasses` stays in sync with `isHover` (`${name}--hovered`).
 *
 * Historical note: an earlier version required `props.hover === true`
 * as an opt-in gate before mouseenter/mouseleave would have any
 * effect. That meant every consumer of `hoverColor` / `hoverBgColor`
 * had to also pass `hover` — which nobody did, so the props were
 * silently dead. The current contract treats `props.hover` strictly
 * as a forcing / config override.
 */

/*********************************************************
 * useHover
 ********************************************************/
export function useHover (props: IHoverProps, prop = 'hover', name = getCurrentInstanceName()) {
    // v-model bridge — kept so callers passing plain booleans
    // (`<BottomNav v-model="open">`) keep their two-way binding.
    // When the prop holds an `IActiveState` object the vmodel still
    // points at that object, but we don't surface it as `isActive` —
    // `isActive` is derived below from `forced` + a local toggle.
    const vmodel = useVModel(props, prop as keyof typeof props)

    /** Configuration object (when the consumer passed one) or undefined. */
    const hoverState: ComputedRef<IHoverState | undefined> = computed(() => {
        const h = (props as any)[prop]
        if (h && typeof h === 'object') return h
        return undefined
    })

    /**
     * `true` when the state should be locked on regardless of pointer
     * events. Two paths set this:
     *   • bare `hover === true`
     *   • `hover === { enabled: true, … }`
     */
    const forced = computed<boolean>(() => {
        const v = (props as any)[prop]

        if (v === true) return true
        if (v && typeof v === 'object') return v.enabled === true

        return false
    })

    const isHover = computed<boolean>(() => {
        if (forced.value) return true

        const v = vmodel.value

        if (typeof v === 'boolean') return v

        return false
    })

    const hoverClasses = computed(() => {
        const classes: Array<string> = []

        if (isHover.value) {
            classes.push(`${name}--hovered`)

            if ((props as any).hoverClass) {
                classes.push((props as any).hoverClass)
            }
        }

        return classes
    })

    const onMouseenter = () => {
        vmodel.value = true
    }
    const onMouseleave = () => {
        vmodel.value = false
    }

    return {
        isHover,
        hoverState,
        hoverClasses,
        onMouseenter,
        onMouseleave
    }
}
