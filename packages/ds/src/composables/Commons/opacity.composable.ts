import { computed, isRef, Ref } from 'vue'

import { CUSTOM_OPACITY_REGEX, UTILITY_OPACITY_RUNGS } from '../../consts/Commons/opacity.const'
import type { IOpacityProps } from '../../interfaces'
import type { TOpacity } from '../../types'

function isUtilityRung (value: unknown): boolean {
    return typeof value === 'string' && UTILITY_OPACITY_RUNGS.has(value)
}

/**
 * Whether an `opacity` value is a bare CSS number meant to be used as-is —
 * a plain `number` (`.7` → `opacity: .7`), or a numeric-only string
 * (`'0.7'`, `'70'`). Excludes anything `CUSTOM_OPACITY_REGEX` already
 * claims, checked first by the caller.
 */
function isBareNumber (value: TOpacity): boolean {
    if (typeof value === 'number') return true
    const trimmed = value.trim()
    return trimmed !== '' && !Number.isNaN(Number(trimmed))
}

/**
 * `useOpacity` — resolves the `opacity` prop (`IOpacityProps`) into either
 * a utility class (tokenised rung) or an inline style (custom / bare
 * number), per `CLAUDE.md` § *Classes-first conventions*. Added ADR-005 D6:
 * `OrigamBtn`'s `plain` variant (`opacity: .7`, `:hover{opacity:1}`) had no
 * prop surface pre-migration — this closes that gap so the preset table
 * can express it instead of shipping bespoke SCSS.
 *
 * Accepts three shapes for `opacity` (see `TOpacity`):
 *   - an origam-native rung name (`'0'|'12'|'26'|'32'|'50'|'60'|'70'|'87'|'100'`),
 *   - a bare CSS opacity number (`.7`, `'0.7'`) — emitted verbatim,
 *   - a free-form custom value (`'var(--my-opacity)'`) — emitted verbatim,
 *     detected by `CUSTOM_OPACITY_REGEX`.
 */

/*********************************************************
 * useOpacity
 ********************************************************/
export function useOpacity (
    props: IOpacityProps | Ref<TOpacity | undefined>
) {
    const opacityClasses = computed(() => {
        const opacity = isRef(props) ? props.value : props.opacity
        const classes: Array<string> = []

        if (opacity == null || opacity === '') return classes

        if (isUtilityRung(opacity)) {
            classes.push(`origam--opacity-${opacity}`)
        }

        return classes
    })

    const opacityStyles = computed(() => {
        const opacity = isRef(props) ? props.value : props.opacity
        const styles: Array<string> = []

        if (opacity == null || opacity === '') return styles

        if (isUtilityRung(opacity)) {
            styles.push(`opacity: var(--origam-opacity---${opacity})`)
            return styles
        }

        if (typeof opacity === 'string' && CUSTOM_OPACITY_REGEX.test(opacity.trim())) {
            styles.push(`opacity: ${opacity.trim()}`)
            return styles
        }

        if (isBareNumber(opacity)) {
            styles.push(`opacity: ${typeof opacity === 'number' ? opacity : opacity.trim()}`)
        }

        return styles
    })

    return { opacityClasses, opacityStyles }
}
