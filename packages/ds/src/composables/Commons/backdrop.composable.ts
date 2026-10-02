import { computed, isRef, Ref } from 'vue'

import {
    BACKDROP_BLUR_DEFAULT_RUNG,
    BACKDROP_BLUR_RUNG_VARS,
    BACKDROP_UTILITY_CLASS_PREFIX
} from '../../consts/Commons/backdrop.const'
import type { IBackdropProps } from '../../interfaces/Commons/backdrop.interface'
import { TBackdropBlur } from '../../types/Commons/backdrop.type'

/*********************************************************
 * TResolvedBackdrop
 *
 * @description
 * Intermediate shape shared by the two computeds below: the rung name
 * when the value landed on the blur ladder (`null` otherwise), and the
 * CSS length to put inside `blur(...)` either way.
 ********************************************************/
type TResolvedBackdrop = { rung: string | null, length: string }

/*********************************************************
 * resolveBackdropBlur
 *
 * @description
 * Normalises every accepted `TBackdropBlur` shape onto
 * {@link TResolvedBackdrop}, or `null` when no backdrop is requested.
 *
 * @description
 * ⛔ `false` / `null` / `undefined` return `null` so NOTHING is emitted —
 * deliberately not `backdrop-filter: none`. An emitted `none` is a valid
 * declaration, so it would win the cascade over a component's own
 * `--variant-ghost` rule and ERASE a blur the component painted for
 * itself. That is the exact failure mode #813 measured on `box-shadow`,
 * where a losing-at-computed-value-time declaration destroyed the shadow
 * the component already had.
 ********************************************************/
function resolveBackdropBlur (value: TBackdropBlur | null | undefined): TResolvedBackdrop | null {
    if (value == null || value === false || value === '') return null

    if (value === true) {
        return {rung: BACKDROP_BLUR_DEFAULT_RUNG, length: BACKDROP_BLUR_RUNG_VARS[BACKDROP_BLUR_DEFAULT_RUNG]}
    }

    if (typeof value === 'number') return {rung: null, length: `${value}px`}

    const key = String(value).trim()
    const rungVar = BACKDROP_BLUR_RUNG_VARS[key]

    if (rungVar) return {rung: key, length: rungVar}

    return {rung: null, length: key}
}

/*********************************************************
 * useBackdrop
 *
 * @description
 * Translates the `backdropBlur` prop into `backdropClasses` (the global
 * utility class, when the value lands on a token rung) AND
 * `backdropStyles` (always a `backdrop-filter` pair). Both channels are
 * emitted in PARALLEL — strategy A, same contract as `useElevation`.
 *
 * @description
 * The `-webkit-` prefixed twin is emitted alongside the standard property
 * on every path: Safari still ships `backdrop-filter` prefixed only, and
 * every one of the 12 components already painting glass in this DS writes
 * the pair. Dropping it would make the prop a no-op on Safari while
 * looking correct everywhere the author tests.
 *
 * @description
 * No `@supports` gate, and that is not an oversight. An unsupported
 * browser drops an unknown declaration by itself, so the gate would buy
 * nothing here — and an inline style cannot carry one anyway. The
 * `@supports not (backdrop-filter: ...)` blocks that exist in the DS
 * today thicken the BACKGROUND COLOUR when blur is unavailable, which is
 * a `bgColor` decision belonging to whoever writes the preset, not to
 * this composable.
 ********************************************************/
export function useBackdrop (props: IBackdropProps | Ref<TBackdropBlur | undefined>) {
    /*********************************************************
     * customFilter
     *
     * @description
     * La valeur brute de `backdropFilter`, quand le consommateur (ou un
     * preset de variant) en a pose une. Rendue VERBATIM et BATTANT
     * `backdropBlur` : une valeur complete est plus specifique qu'un
     * echelon de rayon. Voir `IBackdropProps.backdropFilter` pour la
     * raison (le canal de token multi-fonction du theme `glass`).
     *
     * @description
     * Lue dans un `computed`, jamais dans le corps de `setup()` : le
     * resolveur de props d'ADR-005 ecrit dans `instance.props` au
     * `beforeCreate`, APRES `setup()`, donc une lecture eager ne verrait
     * ni le theme ni le preset.
     ********************************************************/
    const customFilter = computed<string | null>(() => {
        if (isRef(props)) return null

        const value = props.backdropFilter

        if (value == null || String(value).trim() === '') return null

        return String(value).trim()
    })

    const resolved = computed<TResolvedBackdrop | null>(() => {
        return resolveBackdropBlur(isRef(props) ? props.value : props.backdropBlur)
    })

    const backdropClasses = computed<Array<string>>(() => {
        /*********************************************************
         * pas de classe utilitaire sur le canal custom
         *
         * @description
         * Strategie A, meme contrat que `useColor` : une valeur TOKENISEE
         * prend le canal classe, une valeur CUSTOM prend le canal inline.
         * Une chaine libre ne correspond a aucun echelon, donc a aucune
         * `.origam--backdrop-blur-*` — et si un `backdropFilter` custom
         * laissait passer la classe d'un `backdropBlur` concurrent, les
         * deux declarations se battraient sur la meme propriete.
         ********************************************************/
        if (customFilter.value) return []

        const rung = resolved.value?.rung

        return rung ? [`${BACKDROP_UTILITY_CLASS_PREFIX}${rung}`] : []
    })

    const backdropStyles = computed<Array<string>>(() => {
        const custom = customFilter.value

        if (custom) return [`backdrop-filter: ${custom}`, `-webkit-backdrop-filter: ${custom}`]

        const current = resolved.value

        if (!current) return []

        const filter = `blur(${current.length})`

        return [`backdrop-filter: ${filter}`, `-webkit-backdrop-filter: ${filter}`]
    })

    return {backdropClasses, backdropStyles}
}
