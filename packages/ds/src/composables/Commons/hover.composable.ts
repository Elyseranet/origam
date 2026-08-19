import { computed, ref, watch } from "vue"
import type { ComputedRef } from "vue"

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
export function useHover (props: IHoverProps, name = getCurrentInstanceName()) {
    const isHovered = ref(false)

    /**
     * `true` when the state should be locked on regardless of pointer
     * events. Two paths set this:
     *   • bare `hover === true`
     *   • `hover === { enabled: true, … }`
     */
    const forced = computed<boolean>(() => {
        const h = props.hover
        if (h === true) return true
        if (h && typeof h === 'object') return h.enabled === true
        return false
    })

    /**
     * The configuration object the consumer attached, or `undefined`.
     * Exposed as a `ComputedRef<IHoverState | undefined>` so
     * `useStateEffect` can read it reactively.
     */
    const hoverState: ComputedRef<IHoverState | undefined> = computed(() => {
        const h = props.hover
        if (h && typeof h === 'object') return h
        return undefined
    })

    const isHover = computed(() => forced.value || isHovered.value)

    const hoverClasses = computed(() => {
        const classes: Array<string> = []

        if (isHover.value) {
            classes.push(`${name}--hovered`)
        }

        return classes
    })

    const onMouseenter = () => {
        isHovered.value = true
    }
    const onMouseleave = () => {
        isHovered.value = false
    }

    // Re-evaluate `forced` if `props.hover` changes shape later (e.g.
    // parent toggles a controlled prop). `forced` is itself a computed
    // so it tracks `props.hover` automatically — this watch only stays
    // for backward compat in case a consumer expected the old eager
    // re-set behaviour; remove later if no test relies on it.
    watch(() => props.hover, () => {
        // no-op — computed already reactive.
    })

    return {
        isHover,
        hoverState,
        hoverClasses,
        onMouseenter,
        onMouseleave
    }
}
