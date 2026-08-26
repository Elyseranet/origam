import { computed } from 'vue'

import { IN_BROWSER } from '../../consts/Commons/commons.const'

/*********************************************************
 * useAspectRatio
 *
 * SSR safety
 * ──────────
 * During SSR (`!IN_BROWSER`) we cannot read `window.innerWidth/Height`.
 * When the consumer passes an explicit `aspectRatio` prop the ratio is
 * derived from it (no DOM needed). Otherwise we return an empty styles
 * array — the layout collapses to its natural box on the server, then
 * the first browser-side computed access fills in the padding-bottom
 * value. The component's intrinsic height takes over after hydration,
 * so the difference is invisible to the user.
 *
 * #454 — `__content` must be pulled back UP over `__sizer` by the exact
 * same percentage `__sizer`'s `padding-block-end` grows by, with the
 * opposite sign. Vertical percentage paddings/margins both resolve
 * against the containing block's INLINE size (width) — never against
 * `__sizer`'s own computed height — so the pull-back cannot be a fixed
 * `-100%` (that only cancels a 1:1 sizer; any other ratio either leaves
 * a gap — content stacks below — or overshoots — content ends up above
 * the sizer). Both values are literal inline styles (like the pre-fix
 * `padding-block-end`, not a CSS custom property): they are derived
 * purely from `aspectRatio` at runtime, never a design-time default a
 * theme would override, so there is nothing for the token pipeline to
 * carry.
 ********************************************************/
export function useAspectRatio (props: { aspectRatio?: string | number }) {
    const percent = computed(() => {
        let ratio: number

        if (props.aspectRatio) {
            const raw = String(props.aspectRatio).trim()
            const slash = raw.indexOf('/')

            if (slash !== -1) {
                const w = Number(raw.slice(0, slash))
                const h = Number(raw.slice(slash + 1))

                ratio = h ? w / h : NaN
            } else {
                ratio = Number(raw)
            }
        } else if (IN_BROWSER) {
            ratio = window.innerWidth / window.innerHeight
        } else {
            return undefined
        }

        return ratio ? 1 / ratio * 100 : undefined
    })

    const aspectStyles = computed(() => {
        return percent.value !== undefined ? [`padding-block-end: ${percent.value}%`] : []
    })

    const contentStyles = computed(() => {
        return percent.value !== undefined ? [`margin-block-start: ${-percent.value}%`] : []
    })

    return {aspectStyles, contentStyles}
}
