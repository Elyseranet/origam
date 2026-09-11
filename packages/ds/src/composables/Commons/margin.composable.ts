import { computed } from 'vue'
import { MARGIN_REGEX } from '../../consts'

import type { IMarginProps } from '../../interfaces'

import { convertToUnit, formatMarginStylesVar, getCurrentInstanceName } from '../../utils'

/**
 * Margin scale steps mirrored by global utility classes
 * (`.origam--m-0` … `.origam--m-12`) emitted from the Phase 1 manifest.
 *
 * IMPORTANT — opt-in via STRING form to avoid breaking the legacy
 * `margin={number}` contract (where numbers were interpreted as raw
 * pixels via `convertToUnit`). Authors that want the design-system
 * spacing scale must pass the value as a string (`margin="4"`), which
 * resolves to `var(--origam-space---4)` (= 16px in the primitive ladder).
 *
 * Axis-specific utilities (`mx`, `my`, `mt`, `mb`, …) are NOT yet
 * emitted by the manifest. `marginTop`, `marginInline`, etc. continue
 * to fall through to the inline style path until Phase 1.5 lands.
 */
const UTILITY_MARGIN_SCALE: ReadonlySet<string> = new Set([
    '0', '1', '2', '3', '4', '5', '6', '8', '10', '12'
])

function isUtilityMarginScale (value: unknown): value is string {
    return typeof value === 'string' && UTILITY_MARGIN_SCALE.has(value)
}

/*********************************************************
 * useMargin
 ********************************************************/
export function useMargin (props: IMarginProps, name = getCurrentInstanceName()) {

    const marginClasses = computed(() => {
        const margin = props.margin
        const classes: Array<string> = []

        if (margin === true || margin === '') {
            classes.push(`${name}--marged`)
        }

        // Classes-first companion: when `margin` is a number that maps
        // to the spacing scale exposed by the Phase 1 manifest, emit
        // the matching `.origam--m-{n}` utility. Custom px values fall
        // through to the inline-style path.
        if (isUtilityMarginScale(margin)) {
            classes.push(`origam--m-${margin}`)
        }

        return classes
    })

    const marginStyles = computed(() => {
        const margin = props.margin
        const styles: Array<string> = []

        // Scale form (string `'4'`) handled by the utility class — no
        // inline style needed.
        if (isUtilityMarginScale(margin)) return styles

        if (typeof margin === 'string' && margin !== '') {
            const match = MARGIN_REGEX.exec(margin)?.groups
            if (match) {
                Object.keys(match).forEach((key) => {
                    const values = String(match[key]).split(' ')

                    styles.push(...formatMarginStylesVar(values))
                })
            }
        } else if (typeof margin === 'number') {
            styles.push(`margin: ${convertToUnit(margin)}`)
        }

        return styles
    })

    return {
        marginClasses,
        marginStyles
    }
}
