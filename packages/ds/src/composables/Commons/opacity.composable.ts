import { computed, isRef, Ref } from 'vue'

import {
    OPACITY_FRACTION_CEILING,
    OPACITY_PERCENT_SCALE,
    OPACITY_RUNG_VARS,
    OPACITY_UTILITY_CLASS_PREFIX
} from '../../consts/Commons/opacity.const'
import type { IOpacityProps } from '../../interfaces/Commons/opacity.interface'
import { TOpacity } from '../../types/Commons/opacity.type'

/*********************************************************
 * TResolvedOpacity
 *
 * @description
 * Intermediate shape shared by the two computeds below: the rung name
 * when the value landed on the token ladder (`null` otherwise), and the
 * CSS text to put on the right of `opacity:` either way.
 ********************************************************/
type TResolvedOpacity = { rung: string | null, css: string }

/*********************************************************
 * resolveNumericOpacity
 *
 * @description
 * Applies the magnitude split documented on {@link TOpacity}: at or below
 * `OPACITY_FRACTION_CEILING` the number is a CSS fraction and is emitted
 * as-is; above it, the number is a 0..100 percentage.
 *
 * @description
 * A percentage that names a declared rung resolves to that rung's
 * `var()`. One that does not (`42`) is divided down to the fraction it
 * denotes rather than emitted raw — raw `opacity: 42` is not an error,
 * it CLAMPS to 1, so the element would render fully opaque and nothing
 * would report why.
 ********************************************************/
function resolveNumericOpacity (value: number): TResolvedOpacity {
    if (value <= OPACITY_FRACTION_CEILING) return {rung: null, css: String(value)}

    const rung = String(value)
    const rungVar = OPACITY_RUNG_VARS[rung]

    if (rungVar) return {rung, css: rungVar}

    return {rung: null, css: String(value / OPACITY_PERCENT_SCALE)}
}

/*********************************************************
 * resolveOpacity
 *
 * @description
 * Normalises every accepted `TOpacity` shape onto {@link TResolvedOpacity},
 * or `null` when the prop carries no value at all.
 *
 * @description
 * A numeric STRING is treated exactly like the number it spells, so
 * `opacity="70"` from a template attribute behaves as `:opacity="70"`.
 * Anything `Number()` cannot read (`'50%'`, `'var(...)'`, `'calc(...)'`)
 * passes through verbatim.
 ********************************************************/
function resolveOpacity (value: TOpacity | null | undefined): TResolvedOpacity | null {
    if (value == null || value === '') return null

    const numeric = typeof value === 'number' ? value : Number(String(value).trim())

    if (Number.isFinite(numeric)) return resolveNumericOpacity(numeric)

    return {rung: null, css: String(value).trim()}
}

/*********************************************************
 * useOpacity
 *
 * @description
 * Translates the `opacity` prop into `opacityClasses` (the global utility
 * class, when the value lands on a token rung) AND `opacityStyles`
 * (always an `opacity:` declaration). Both channels are emitted in
 * PARALLEL, never one instead of the other — strategy A, the same
 * contract `useElevation` and `useRounded` honour.
 *
 * @description
 * ⛔ THE STYLE IS NOT REDUNDANT WITH THE CLASS, and dropping it would
 * break the prop on most components. A utility class is `(0,1,0)`; a Vue
 * scoped component rule is `.class[data-v-hash]` = `(0,2,0)` and wins
 * regardless of load order. `OrigamBtn` already declares `opacity` in its
 * own scoped SCSS (`--variant-plain`, `--disabled`), so on Btn the class
 * alone would paint nothing. This is the measured lesson of #514 on the
 * foreground channel, applied here before it can be re-learned.
 *
 * @description
 * REUSES the primitive ladder that already existed
 * (`--origam-opacity---{0,12,26,32,50,60,70,87,100}`, `primitive.css`);
 * this composable declares no token of its own. See
 * {@link IOpacityProps} for why ADR-005's "add a token group" was already
 * half-done.
 ********************************************************/
export function useOpacity (props: IOpacityProps | Ref<TOpacity | undefined>) {
    const resolved = computed<TResolvedOpacity | null>(() => {
        return resolveOpacity(isRef(props) ? props.value : props.opacity)
    })

    const opacityClasses = computed<Array<string>>(() => {
        const rung = resolved.value?.rung

        return rung ? [`${OPACITY_UTILITY_CLASS_PREFIX}${rung}`] : []
    })

    const opacityStyles = computed<Array<string>>(() => {
        const current = resolved.value

        return current ? [`opacity: ${current.css}`] : []
    })

    return {opacityClasses, opacityStyles}
}
