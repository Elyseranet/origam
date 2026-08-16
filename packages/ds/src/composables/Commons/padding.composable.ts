import { computed } from 'vue'
import { PADDING_LOGICAL_AXIS_MAP, PADDING_POSITION_MAP, PADDING_REGEX, SPACING_SCALE_STEPS } from '../../consts'

import type { IPaddingProps } from '../../interfaces'

import { convertToUnit, formatPaddingStylesVar, getCurrentInstanceName, resolveSpacingValue } from '../../utils'

function isUtilityPaddingScale (value: unknown): value is string {
    return typeof value === 'string' && SPACING_SCALE_STEPS.includes(value)
}

/*********************************************************
 * usePadding
 *
 * @description
 * Precedence rule — SPECIFIC beats GLOBAL, always in this order, enforced
 * purely by PUSH ORDER onto the `styles` array (later declarations win
 * within the same inline `style` attribute — this holds even across
 * logical vs physical property syntax for the same box edge). Mirrors
 * `useBorder`'s table exactly, so the three spacing-ish surfaces
 * (border / padding / margin) share ONE grammar:
 *
 *   1. global `padding` shorthand (1/2/4-value, logical properties)
 *   2. logical-axis `paddingBlock` / `paddingInline`
 *   3. physical per-side `paddingTop` / `paddingRight` / `paddingBottom` /
 *      `paddingLeft`
 *
 * So `paddingBlock` beats `padding` for the top+bottom edges, and
 * `paddingTop` beats both `padding` and `paddingBlock` for the top edge
 * specifically — each rung only overrides the edge(s) it actually
 * targets, everything else keeps cascading from the rung below.
 *
 * ⚠️ The 4-value `padding` shorthand distributes in the DS's
 * **Haut/Gauche/Bas/Droite** order, NOT the CSS clockwise order — an
 * intentional convention arbitrated in issue #216 (see
 * `formatPaddingStylesVar`). The per-side props exist precisely so a
 * consumer never has to know that: `paddingLeft="8px"` is unambiguous.
 *
 * Accepted per-side value forms are documented on `resolveSpacingValue`.
 ********************************************************/
export function usePadding (props: IPaddingProps, name = getCurrentInstanceName()) {

    const paddingClasses = computed(() => {
        const padding = props.padding
        const classes: Array<string> = []

        if (padding === true || padding === '') {
            classes.push(`${name}--padded`)
        }

        // Classes-first companion: opt-in scale step via string form.
        // Directional props have NO utility-class family in the Phase 1
        // manifest (no `.origam--pt-4`), so they are inline-style only —
        // see `paddingStyles` below.
        if (isUtilityPaddingScale(padding)) {
            classes.push(`origam--p-${padding}`)
        }

        return classes
    })

    const paddingStyles = computed(() => {
        const padding = props.padding
        const styles: Array<string> = []

        // ── Rung 1: global `padding` shorthand ───────────────────────
        // Scale form handled by the utility class — no inline style. The
        // directional rungs below still run: they are additive overrides
        // on top of whatever the class paints.
        if (!isUtilityPaddingScale(padding)) {
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
        }

        // ── Rung 2: logical-axis `paddingBlock` / `paddingInline` ────
        // Declared on `IPaddingProps` but never read until now — the same
        // "half-implemented surface" bug `useBorder` carried for its own
        // logical-axis props. Pushed AFTER the global shorthand and
        // BEFORE the physical per-side loop, so `paddingTop` still wins
        // over `paddingBlock` for the top edge.
        PADDING_LOGICAL_AXIS_MAP.forEach(({axis, prop}) => {
            const resolved = resolveSpacingValue(props[prop])

            if (resolved) styles.push(`padding-${axis}: ${resolved}`)
        })

        // ── Rung 3: physical per-side ────────────────────────────────
        PADDING_POSITION_MAP.forEach(({side, prop}) => {
            const resolved = resolveSpacingValue(props[prop])

            if (resolved) styles.push(`padding-${side}: ${resolved}`)
        })

        return styles
    })

    return {
        paddingClasses,
        paddingStyles
    }
}
