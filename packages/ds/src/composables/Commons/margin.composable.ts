import { computed } from 'vue'
import { MARGIN_REGEX } from '../../consts/Commons/margin.const'
import { MARGIN_LOGICAL_AXIS_MAP, MARGIN_POSITION_MAP, SPACING_SCALE_STEPS } from '../../consts/Commons/spacing.const'

import type { IMarginProps } from '../../interfaces/Commons/margin.interface'

import { convertToUnit } from '../../utils/Commons/commons.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'
import { formatMarginStylesVar } from '../../utils/Commons/margin.util'
import { resolveSpacingValue } from '../../utils/Commons/spacing.util'

function isUtilityMarginScale (value: unknown): value is string {
    return typeof value === 'string' && SPACING_SCALE_STEPS.includes(value)
}

/*********************************************************
 * useMargin
 *
 * @description
 * Precedence rule — SPECIFIC beats GLOBAL, always in this order, enforced
 * purely by PUSH ORDER onto the `styles` array (later declarations win
 * within the same inline `style` attribute — this holds even across
 * logical vs physical property syntax for the same box edge). Mirrors
 * `useBorder` / `usePadding` exactly:
 *
 *   1. global `margin` shorthand (1/2/4-value, logical properties)
 *   2. logical-axis `marginBlock` / `marginInline`
 *   3. physical per-side `marginTop` / `marginRight` / `marginBottom` /
 *      `marginLeft`
 *
 * So `marginBlock` beats `margin` for the top+bottom edges, and
 * `marginTop` beats both `margin` and `marginBlock` for the top edge
 * specifically.
 *
 * ⚠️ The 4-value `margin` shorthand distributes in the DS's
 * **Haut/Gauche/Bas/Droite** order, NOT the CSS clockwise order — an
 * intentional convention arbitrated in issue #216 (see
 * `formatMarginStylesVar`). The per-side props exist precisely so a
 * consumer never has to know that.
 *
 * NOTE ON THE UTILITY CLASSES — the scale steps
 * (`SPACING_SCALE_STEPS`) are mirrored by global utility classes
 * (`.origam--m-0` … `.origam--m-12`) that a STRING value opts into
 * (`margin="4"` → `var(--origam-space---4)`); the NUMBER form keeps its
 * legacy raw-pixel meaning (`margin={4}` → `4px`). Axis-specific
 * utilities (`mx`, `my`, `mt`, …) do NOT exist in the manifest, so the
 * directional props resolve through the INLINE-STYLE path below.
 *
 * (An earlier version of this comment claimed `marginTop` / `marginInline`
 * "continue to fall through to the inline style path until Phase 1.5
 * lands". That was false in a way worth naming: no such path existed —
 * the props were parsed by nothing at all and emitted nothing. They now
 * genuinely do fall through to the inline path, which is what rungs 2
 * and 3 below implement.)
 ********************************************************/
export function useMargin (props: IMarginProps, name = getCurrentInstanceName()) {

    const marginClasses = computed(() => {
        const margin = props.margin
        const classes: Array<string> = []

        if (margin === true || margin === '') {
            classes.push(`${name}--marged`)
        }

        if (isUtilityMarginScale(margin)) {
            classes.push(`origam--m-${margin}`)
        }

        return classes
    })

    const marginStyles = computed(() => {
        const margin = props.margin
        const styles: Array<string> = []

        // ── Rung 1: global `margin` shorthand ────────────────────────
        // Scale form handled by the utility class — no inline style. The
        // directional rungs below still run: they are additive overrides
        // on top of whatever the class paints.
        if (!isUtilityMarginScale(margin)) {
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
        }

        // ── Rung 2: logical-axis `marginBlock` / `marginInline` ──────
        MARGIN_LOGICAL_AXIS_MAP.forEach(({axis, prop}) => {
            const resolved = resolveSpacingValue(props[prop])

            if (resolved) styles.push(`margin-${axis}: ${resolved}`)
        })

        // ── Rung 3: physical per-side ────────────────────────────────
        MARGIN_POSITION_MAP.forEach(({side, prop}) => {
            const resolved = resolveSpacingValue(props[prop])

            if (resolved) styles.push(`margin-${side}: ${resolved}`)
        })

        return styles
    })

    return {
        marginClasses,
        marginStyles
    }
}
