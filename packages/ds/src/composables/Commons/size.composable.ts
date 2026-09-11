import { SIZES_ARRAY } from '../../consts'
import type { ISizeProps } from "../../interfaces"

import type { TSize } from '../../types'

import { convertToUnit, getCurrentInstanceName } from '../../utils'
import { computed, isRef } from 'vue'

/**
 * Mapping from the legacy `SIZES` enum (`x-small | small | default |
 * large | x-large`) onto the modern utility taxonomy
 * (`xs | sm | md | lg | xl`) emitted by the Phase 1 manifest.
 *
 * NOTE — `useSize` historically drives `width` / `height`, NOT
 * `font-size`. The Phase 1 utility classes drive `font-size`. The
 * companion class is therefore **only useful for components whose
 * `size` prop also implies a typographic scale** (e.g. Btn, Chip).
 * Components that interpret `size` purely as a box dimension should
 * NOT consume `sizeClasses` from this composable in their
 * `:class` binding — the inline `width`/`height` styles from
 * `sizeStyles` remain authoritative.
 */
const LEGACY_SIZE_TO_UTILITY: Readonly<Record<string, string>> = {
    'x-small': 'xs',
    'small': 'sm',
    'default': 'md',
    'large': 'lg',
    'x-large': 'xl'
}

/*********************************************************
 * useSize
 ********************************************************/
export function useSize (props: ISizeProps, name = getCurrentInstanceName()) {
    const sizeClasses = computed(() => {
        const size = isRef(props) ? props.value : props.size
        const classes: string[] = []

        if (size && SIZES_ARRAY.includes(size as TSize)) {
            classes.push(`${name}--size-${size}`)

            // Classes-first companion: bridge the legacy enum onto the
            // typographic utility for components that opt in.
            const utilityRung = LEGACY_SIZE_TO_UTILITY[size as string]
            if (utilityRung) {
                classes.push(`origam--text-${utilityRung}`)
            }
        }

        return classes
    })

    const sizeStyles = computed(() => {
        const styles = []

        if (props.size && !SIZES_ARRAY.includes(props.size as TSize)) {
            // Note: previous version emitted `width': …` (stray apostrophe)
            // which Vue silently dropped — leading to 0×0 components when a
            // numeric/custom size was passed.
            styles.push(`width: ${convertToUnit(props.size)}`)
            styles.push(`height: ${convertToUnit(props.size)}`)
        }

        return styles
    })

    return {sizeStyles, sizeClasses}
}
