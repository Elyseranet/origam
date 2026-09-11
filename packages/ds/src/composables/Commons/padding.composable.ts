import { computed } from 'vue'
import { PADDING_REGEX } from '../../consts'

import type { IPaddingProps } from '../../interfaces'

import { convertToUnit, formatPaddingStylesVar, getCurrentInstanceName } from '../../utils'

/**
 * Padding scale steps mirrored by global utility classes
 * (`.origam--p-0` … `.origam--p-12`) emitted from the Phase 1 manifest.
 *
 * IMPORTANT — opt-in via STRING form (e.g. `padding="4"`). Numeric
 * values keep the legacy "pixel" semantics. See margin.composable.ts
 * for the full rationale; the same caveat applies to axis-specific
 * utilities (`px`, `py`, `pt`, `pb`, …) which do not yet exist in
 * the Phase 1 manifest.
 */
const UTILITY_PADDING_SCALE: ReadonlySet<string> = new Set([
    '0', '1', '2', '3', '4', '5', '6', '8', '10', '12'
])

function isUtilityPaddingScale (value: unknown): value is string {
    return typeof value === 'string' && UTILITY_PADDING_SCALE.has(value)
}

/*********************************************************
 * usePadding
 ********************************************************/
export function usePadding (props: IPaddingProps, name = getCurrentInstanceName()) {

    const paddingClasses = computed(() => {
        const padding = props.padding
        const classes: Array<string> = []

        if (padding === true || padding === '') {
            classes.push(`${name}--padded`)
        }

        // Classes-first companion: opt-in scale step via string form.
        if (isUtilityPaddingScale(padding)) {
            classes.push(`origam--p-${padding}`)
        }

        return classes
    })

    const paddingStyles = computed(() => {
        const padding = props.padding
        const styles: Array<string> = []

        // Scale form handled by the utility class — no inline style.
        if (isUtilityPaddingScale(padding)) return styles

        if (typeof padding === 'string' && padding !== '') {
            const match = PADDING_REGEX.exec(padding)?.groups
            if (match) {
                Object.keys(match).forEach((key) => {
                    const values = String(match[key]).split(' ')

                    styles.push(...formatPaddingStylesVar(values))
                })
            }
        } else if (typeof padding === 'number') {
            styles.push(`padding: ${convertToUnit(padding)}`)
        }

        return styles
    })

    return {
        paddingClasses,
        paddingStyles
    }
}
