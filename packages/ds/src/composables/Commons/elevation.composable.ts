import { computed, isRef, ref, Ref } from 'vue'

import { ORIGAM_SHADOW_RUNGS, UTILITY_SHADOW_RUNGS } from '../../consts/Commons/elevation.const'
import type { IElevationProps } from '../../interfaces'
import { TColor, TElevation } from "../../types"
import { getCurrentInstanceName, isCustomBoxShadow } from "../../utils"

/**
 * Map a numeric Material-style elevation (0..24) to a token rung in the
 * generated shadow ladder (`--origam-shadow-{none|xs|sm|md|lg|xl}`).
 *
 * Buckets are intentionally chunky — the Material 25-step ladder collapses
 * into a 6-token visual ladder. The mapping was tuned against the existing
 * usage in OrigamCard / OrigamBadge / OrigamChip.
 */
function elevationToToken (level: number): string {
    if (level <= 0) return 'none'
    if (level <= 1) return 'xs'
    if (level <= 3) return 'sm'
    if (level <= 8) return 'md'
    if (level <= 16) return 'lg'
    return 'xl'
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
    console.warn(
        '[origam] useElevation: the `bgColor` parameter is deprecated and ignored. ' +
        'Shadows now resolve from the design tokens (`--origam-shadow-*`) and switch with the active theme. ' +
        'The parameter will be removed in v3.0.0.'
    )
}

/**
 * `useElevation` — refactored to consume design tokens (Lot 1).
 *
 * Accepts three shapes for `elevation` (see `TElevation`):
 *   - an origam-native rung name (`'none'|'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'`),
 *   - a Material-style number `0..24` (as a `number` or numeric `string`),
 *   - a free-form custom `box-shadow` value (`'0 4px 12px rgba(0,0,0,.24)'`,
 *     `'var(--origam-shadow---card)'`, `'inset 0 0 0 2px #fff'`, …) —
 *     emitted verbatim via `elevationStyles`. Detected by `isCustomBoxShadow`
 *     (permissive signal-based check, same approach as `useRounded`'s
 *     `isCustomBorderRadius`), so genuinely invalid input keeps the
 *     pre-existing silent-drop behaviour (no regression).
 *
 * Backward-compat:
 *   - The signature is preserved (`bgColor` accepted but ignored).
 *   - Returns the same shape: `{ elevationClasses, elevationStyles }`.
 *   - `elevationStyles` is still a string array — emits a single `box-shadow:`
 *     declaration that references the appropriate `--origam-shadow-*` token,
 *     or the custom value verbatim.
 */

/*********************************************************
 * useElevation
 ********************************************************/
export function useElevation (
    props: IElevationProps | Ref<TElevation | undefined>,
    flat: Ref<boolean> = ref(false),
    bgColor: Ref<TColor> = ref('rgb(0,0,0)'),
    name = getCurrentInstanceName()
) {
    // Soft-warn the first time a non-default bgColor is provided.
    if (bgColor && bgColor.value && bgColor.value !== 'rgb(0,0,0)') {
        warnBgColorUsage(bgColor.value)
    }

    const elevationClasses = computed(() => {
        const elevation = isRef(props) ? props.value : props.elevation
        const classes: Array<string> = []

        if (elevation == null || flat.value) return classes

        classes.push(`${name}--elevated`)

        // Classes-first companion: when `elevation` resolves to a
        // utility-backed rung (Phase 1 manifest), emit the matching
        // global utility class so consumers can opt into the global
        // shadow layer. `2xl` / `3xl` and Material 0..24 numbers fall
        // through to the inline-style path below.
        if (isUtilityRung(elevation)) {
            classes.push(`origam--shadow-${elevation}`)
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
                    classes.push(`origam--shadow-${tokenName}`)
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
            styles.push(`box-shadow: var(--origam-shadow---${elevation})`)
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
        styles.push(`box-shadow: var(--origam-shadow---${tokenName})`)

        return styles
    })

    return {elevationClasses, elevationStyles}
}
