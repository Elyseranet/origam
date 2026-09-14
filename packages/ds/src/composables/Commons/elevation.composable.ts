import { computed, isRef, ref, Ref } from 'vue'

import {
    ELEVATED_CLASS_SUFFIX,
    ELEVATION_BG_COLOR_DEPRECATION_WARNING,
    ELEVATION_LEGACY_BG_COLOR,
    MATERIAL_ELEVATION_LADDER,
    MATERIAL_ELEVATION_TOP_RUNG,
    ORIGAM_SHADOW_RUNGS,
    SHADOW_TOKEN_PREFIX,
    SHADOW_UTILITY_CLASS_PREFIX,
    UTILITY_SHADOW_RUNGS
} from '../../consts/Commons/elevation.const'
import type { IElevationProps } from '../../interfaces/Commons/elevation.interface'
import { TColor } from '../../types/Commons/color.type'
import { TElevation } from '../../types/Commons/elevation.type'
import { isCustomBoxShadow } from '../../utils/Commons/elevation.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/**
 * Map a numeric Material-style elevation (0..24) to a token rung in the
 * generated shadow ladder (`--origam-shadow-{none|xs|sm|md|lg|xl}`).
 *
 * The buckets live in `MATERIAL_ELEVATION_LADDER`
 * (`src/consts/Commons/elevation.const.ts`). `NaN` matches no bucket and
 * falls through to `MATERIAL_ELEVATION_TOP_RUNG`, same as before.
 */
function elevationToToken (level: number): string {
    return MATERIAL_ELEVATION_LADDER.find(({maxLevel}) => level <= maxLevel)?.rung
        ?? MATERIAL_ELEVATION_TOP_RUNG
}

// `ORIGAM_SHADOW_RUNGS` + `UTILITY_SHADOW_RUNGS` live in
// `src/consts/Commons/elevation.const.ts`.

// Plain `boolean` return (not a `value is string` type predicate) on
// purpose: `elevation` is typed `TElevation = number | string`, and a
// positive type-predicate here would make TS negatively narrow `elevation`
// to `number` in the `else` branch below — which then makes the later
// `typeof elevation === 'string'` custom-box-shadow check unreachable
// (`elevation.trim()` on a narrowed `never`).
function isOrigamRung (value: unknown): boolean {
    return typeof value === 'string' && ORIGAM_SHADOW_RUNGS.has(value)
}

function isUtilityRung (value: unknown): boolean {
    return typeof value === 'string' && UTILITY_SHADOW_RUNGS.has(value)
}

const _bgWarned = new WeakSet<object>()
function warnBgColorUsage (bgColor: TColor) {
    if (typeof console === 'undefined' || !bgColor) return
    // Use a sentinel object to avoid spamming the warning per render.
    const sentinel = { _: 'origam-elevation-bg-warn' } as const
    if (_bgWarned.has(sentinel)) return
    _bgWarned.add(sentinel)
    console.warn(ELEVATION_BG_COLOR_DEPRECATION_WARNING)
}

/*********************************************************
 * useElevation
 *
 * @description
 * Traduit `elevation` (`TElevation` : soit un echelon origam natif
 * `'none'|'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'`, soit un nombre Material
 * `0..24`, soit un `box-shadow` custom en clair) en `elevationClasses`
 * (utilitaire quand l'echelon est couvert par la Phase 1 des utilitaires)
 * ET `elevationStyles` (toujours une declaration `box-shadow: var(--origam-shadow-*)`
 * ou la valeur custom telle quelle) — les deux canaux emis en parallele,
 * jamais l'un a la place de l'autre (strategie A, cf. CLAUDE.md racine).
 *
 * @description
 * `bgColor` est accepte pour compatibilite mais IGNORE (n'affecte plus
 * ni `elevationClasses` ni `elevationStyles`) — passer une valeur autre
 * que `ELEVATION_LEGACY_BG_COLOR` declenche un `console.warn` de
 * depreciation une seule fois via `warnBgColorUsage`. La detection du
 * `box-shadow` custom passe AVANT le `parseInt` de secours : sans cet
 * ordre, `parseInt('0 4px 12px rgba(0,0,0,.24)', 10)` lirait `0` (chiffre
 * de tete) et resoudrait silencieusement vers l'echelon `none`, perdant
 * l'ombre custom.
 ********************************************************/
export function useElevation (
    props: IElevationProps | Ref<TElevation | undefined>,
    flat: Ref<boolean> = ref(false),
    bgColor: Ref<TColor> = ref(ELEVATION_LEGACY_BG_COLOR),
    name = getCurrentInstanceName()
) {
    // Soft-warn the first time a non-default bgColor is provided.
    if (bgColor && bgColor.value && bgColor.value !== ELEVATION_LEGACY_BG_COLOR) {
        warnBgColorUsage(bgColor.value)
    }

    const elevationClasses = computed(() => {
        const elevation = isRef(props) ? props.value : props.elevation
        const classes: Array<string> = []

        if (elevation == null || flat.value) return classes

        classes.push(`${name}${ELEVATED_CLASS_SUFFIX}`)

        // Classes-first companion: when `elevation` resolves to a
        // utility-backed rung (Phase 1 manifest), emit the matching
        // global utility class so consumers can opt into the global
        // shadow layer. `2xl` / `3xl` and Material 0..24 numbers fall
        // through to the inline-style path below.
        if (isUtilityRung(elevation)) {
            classes.push(`${SHADOW_UTILITY_CLASS_PREFIX}${elevation}`)
        } else if (!isOrigamRung(elevation) && !(typeof elevation === 'string' && isCustomBoxShadow(elevation))) {
            // Material 0..24 number (string or number) — bridge to the
            // utility ladder via the same token mapping as the inline
            // style path. We deliberately skip this branch for origam
            // rungs not in the utility set (`2xl`, `3xl`) so authors who
            // pass `elevation="2xl"` get the inline-style path instead
            // of a wrong utility class via `parseInt('2xl') === 2`. We
            // also skip it for a free-form custom `box-shadow` string —
            // `parseInt('0 4px 12px rgba(0,0,0,.24)', 10)` silently reads
            // as `0` (leading digit) and would otherwise wrongly resolve
            // to the `none` rung, dropping the custom shadow entirely.
            const numeric = typeof elevation === 'string' ? parseInt(elevation, 10) : elevation
            if (typeof numeric === 'number' && !Number.isNaN(numeric)) {
                const tokenName = elevationToToken(numeric)
                if (UTILITY_SHADOW_RUNGS.has(tokenName)) {
                    classes.push(`${SHADOW_UTILITY_CLASS_PREFIX}${tokenName}`)
                }
            }
        }

        return classes
    })

    const elevationStyles = computed(() => {
        const elevation = isRef(props) ? props.value : props.elevation
        const styles: Array<string> = []

        if (elevation == null || flat.value) return styles

        // Origam-native rung shortcut — e.g. `elevation="md"` lands
        // straight on `var(--origam-shadow---md)` without going through
        // the Material 0..24 → token mapping. Authors get an explicit
        // intent ("medium shadow") rather than an opaque number.
        if (isOrigamRung(elevation)) {
            styles.push(`box-shadow: var(${SHADOW_TOKEN_PREFIX}${elevation})`)
            return styles
        }

        // Free-form custom `box-shadow` — e.g. `'0 4px 12px rgba(0,0,0,.24)'`,
        // `'var(--origam-shadow---card)'`, `'inset 0 0 0 2px #fff'`, multiple
        // comma-separated layers. Checked BEFORE the `parseInt` fallback
        // below: `parseInt` reads the leading digits of a shadow string
        // (`parseInt('0 4px 12px rgba(...)', 10) === 0`) and would silently
        // resolve to the `none` rung — no shadow, no warning. Emitted
        // verbatim, same passthrough contract as `useRounded`'s
        // `isCustomBorderRadius` escape hatch.
        if (typeof elevation === 'string' && isCustomBoxShadow(elevation)) {
            styles.push(`box-shadow: ${elevation.trim()}`)
            return styles
        }

        const numeric = typeof elevation === 'string' ? parseInt(elevation, 10) : elevation
        if (Number.isNaN(numeric)) return styles

        const tokenName = elevationToToken(numeric)
        styles.push(`box-shadow: var(${SHADOW_TOKEN_PREFIX}${tokenName})`)

        return styles
    })

    return {elevationClasses, elevationStyles}
}
