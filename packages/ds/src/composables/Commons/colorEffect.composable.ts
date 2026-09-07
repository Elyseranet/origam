import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import type { IBgColorProps, IColorProps } from '../../interfaces/Commons/color.interface'
import {
    resolveBgRole,
    resolveColorAxisClasses,
    resolveColorAxisStyles,
} from '../../utils/Commons/color-axis.util'

/*********************************************************
 * useColorEffect
 *
 * @description
 * Hover/active/disabled-aware bg+fg colour resolver — refactored for
 * design-tokens / intent support (Lot 1).
 * Deliberately independent from `useColor`: the role/state derivation
 * (default / hover / active slots) is a different algorithm from the
 * legacy static resolver, not a variant of it — kept in its own file
 * rather than forced to share a base.
 *
 * Returns the same shape as before — `{ colorStyles, color, bgColor }` —
 * so existing callers (`OrigamAudio`, `OrigamVideo`) keep working
 * without changes.
 *
 * `colorStyles` is an array of CSS declarations like
 * `'background-color: …'`, either pointing to a token
 * (`var(--origam-color__action--primary---bg)`) when `props.color` is
 * an intent, or to a raw value when it's a hex/rgb (legacy).
 *
 * State resolution: `isHover.value` / `isActive.value` bump an intent
 * `bgColor` to its `bgHover` / `bgActive` token rung (color-mix
 * fallback when the token is missing). The flat `hoverColor` /
 * `activeColor` / `hoverBgColor` / `activeBgColor` per-state override
 * props were removed (folded into the `hover` / `active` object props
 * on components that support them — see `color.interface.ts`); neither
 * real caller of this composable (`OrigamAudio`, `OrigamVideo`) ever
 * declared them, so the foreground/background scalars are now just
 * `props.color` / `props.bgColor` — only the darken-derivation role
 * (`bgRole`) still reacts to `isHover` / `isActive`.
 ********************************************************/
export function useColorEffect (
    props: IColorProps & IBgColorProps,
    isHover: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isActive: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = ref(false)
) {
    const color = computed(() => props.color)
    const bgColor = computed(() => props.bgColor)

    // Axe couleur : implementation unique dans
    // `utils/Commons/color-axis.util.ts`, partagee avec `useStateEffect`.
    // Ce composable n'apporte que son cablage propre — les scalaires
    // viennent directement des props, et le role de surface suit les
    // drapeaux d'etat sans arbitrage : il n'y a pas de surcharge par etat
    // ici (les props plates `hoverColor` / `activeColor` / `hoverBgColor` /
    // `activeBgColor` ont ete repliees dans les props objet `hover` /
    // `active`, que seul `useStateEffect` lit).
    //
    // `gradients: true` : ce composable a toujours reconnu les degrades sur
    // les deux canaux. Cf. `IColorAxisOptions` pour la mesure de l'ecart
    // avec `useStateEffect`, qui ne les a jamais reconnus.
    const colorClasses = computed<string[]>(() => resolveColorAxisClasses(
        color.value,
        bgColor.value,
        isHover.value || isActive.value || isDisabled.value,
    ))

    const colorStyles = computed<string[]>(() => resolveColorAxisStyles(
        color.value,
        bgColor.value,
        resolveBgRole(isHover.value, isActive.value),
        { gradients: true },
    ))

    return {colorClasses, colorStyles, color, bgColor}
}
