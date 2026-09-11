import { computed } from 'vue'

import { IN_BROWSER } from '../../consts'

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
 ********************************************************/
export function useAspectRatio (props: { aspectRatio?: string | number }) {
    const aspectStyles = computed(() => {
        const aspectRatio: Array<string> = []
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
            return aspectRatio
        }

        if (ratio) {
            aspectRatio.push(`padding-block-end: ${String(1 / ratio * 100)}%`)
        }

        return aspectRatio
    })

    return {aspectStyles}
}
