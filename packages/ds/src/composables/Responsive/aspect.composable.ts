import { computed } from 'vue'

import { IN_BROWSER } from '../../consts/Commons/commons.const'

const isUsableRatio = (value: number) => Number.isFinite(value) && value > 0

/*********************************************************
 * useAspectRatio
 *
 * Emits the native CSS `aspect-ratio` declaration for the root box.
 *
 * #709 — this used to be the classic padding-percentage hack: an empty
 * `__sizer` child carried `padding-block-end: ${1 / ratio * 100}%` and
 * `__content` was pulled back over it with the exact opposite
 * `margin-block-start: -${…}%` (#454). Because `.origam-responsive` is
 * `display: flex; flex-direction: column`, those two values cancelled
 * ARITHMETICALLY: the root height resolved to
 * `sizer(p) + margin(-p) + content` = the content's own height. Measured on
 * `develop`, Chromium: `<OrigamResponsive aspect-ratio="16/9" max-width=480>`
 * rendered 480 x 23 instead of 480 x 270, and 16/9 vs 4/3 rendered the SAME
 * height — the ratio was decorative.
 *
 * The cancellation only fired when the DEFAULT slot was filled, since
 * `__content` is `v-if="slots.default"`. That is why `OrigamImg` looked
 * healthy throughout: it renders into `#additional`, never `#default`, so no
 * pull-back margin was ever emitted and the sizer's height survived.
 *
 * `aspect-ratio` has no counterpart to cancel — the root sizes itself, the
 * sizer and the pull-back are gone, and the two bugs above cannot recur.
 * CLAUDE.md's CSS-first table lists `aspect-ratio: 16 / 9` as the first
 * choice and the padding-bottom hack as the fallback; this is that migration.
 *
 * Browser support is not gated. `aspect-ratio` is Baseline Widely Available
 * (Chrome 88 / Edge 88 / Firefox 89 / Safari 15, all shipped 2021), which is
 * comfortably below this DS's floor, so there is no branch to take and
 * nothing to declare in `FEATURE_QUERIES`.
 *
 * SSR safety
 * ──────────
 * During SSR (`!IN_BROWSER`) we cannot read `window.innerWidth/Height`. When
 * the consumer passes an explicit `aspectRatio` the ratio is derived from it
 * with no DOM access. Otherwise we return an empty styles array — the layout
 * collapses to its natural box on the server and the first browser-side
 * computed access fills the declaration in. The value is a literal inline
 * style, not a custom property: it is derived purely from `aspectRatio` at
 * runtime, never a design-time default a theme would override, so there is
 * nothing for the token pipeline to carry.
 *
 * Guarding the value
 * ──────────────────
 * The returned ratio rejects NaN, 0, negatives and Infinity. Any of them
 * would emit an invalid declaration, which CSS drops silently — the property
 * would appear to be set while doing nothing at all.
 *
 * Fraction strings stay fractions
 * ───────────────────────────────
 * `'16/9'` is emitted as `aspect-ratio: 16 / 9`, not as the float
 * `1.7777777777777777`. CSS divides at full precision, the computed value
 * stays readable, and it matches what consumers actually write —
 * `OrigamVideo` feeds the literal string `'16/9'` by default. Only the two
 * NUMBERS parsed out of the input are re-emitted, never the raw text, so a
 * malformed prop cannot inject anything into the declaration. A numeric prop
 * has no fraction to preserve and is emitted as the number it is.
 ********************************************************/
export function useAspectRatio (props: { aspectRatio?: string | number }) {
    const ratio = computed<string | undefined>(() => {
        if (props.aspectRatio) {
            const raw = String(props.aspectRatio).trim()
            const slash = raw.indexOf('/')

            if (slash !== -1) {
                const w = Number(raw.slice(0, slash))
                const h = Number(raw.slice(slash + 1))

                if (!isUsableRatio(w) || !isUsableRatio(h)) return undefined

                return `${w} / ${h}`
            }

            const value = Number(raw)

            return isUsableRatio(value) ? String(value) : undefined
        }

        if (!IN_BROWSER) return undefined

        const viewport = window.innerWidth / window.innerHeight

        return isUsableRatio(viewport) ? String(viewport) : undefined
    })

    const aspectStyles = computed(() => {
        return ratio.value !== undefined ? [`aspect-ratio: ${ratio.value}`] : []
    })

    return {aspectStyles}
}
