import { computed, isRef, Ref } from 'vue'
import { BORDER_POSITION_MAP, BORDER_REGEX, DIRECTION_ARRAY } from '../../consts'

import type { IBorderProps } from '../../interfaces'
import { TDirectionBoth } from "../../types"

import {
    convertToUnit,
    formatBorderPositionStylesVar,
    formatBorderStylesVar,
    getCurrentInstanceName,
    isEmpty,
    parseBorderPositionValue,
    resolveBorderSideColor
} from '../../utils'

/**
 * Set of border values for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest):
 * `.origam--border-none`, `.origam--border-thin`, `.origam--border-thick`.
 */
const UTILITY_BORDER: ReadonlySet<string> = new Set([
    'none', 'thin', 'thick'
])

function isUtilityBorder (value: unknown): value is string {
    return typeof value === 'string' && UTILITY_BORDER.has(value)
}

/*********************************************************
 * useBorder
 *
 * @description
 * Precedence rule (issue #215) — SPECIFIC beats GLOBAL, always in this
 * order, enforced purely by PUSH ORDER onto the `styles` array (later
 * declarations win within the same inline `style` attribute — this holds
 * even across logical vs physical property syntax for the same box edge):
 *
 *   1. global `border` shorthand (1/2/4-value, logical properties)
 *   2. global standalone `borderColor` / `borderStyle`
 *   3. per-side `borderTop` / `borderRight` / `borderBottom` / `borderLeft`
 *      (physical properties — width, and style/color when a full string
 *      like `"2px dashed red"` is given)
 *   4. per-side `borderTopColor` / `borderRightColor` /
 *      `borderBottomColor` / `borderLeftColor`
 *
 * So `borderTop` beats `border` for the top side, and `borderTopColor`
 * beats both the color embedded in `borderTop` and the global
 * `borderColor` — each rung only overrides the physical side(s) it
 * actually targets, everything else keeps cascading from the rung below.
 ********************************************************/
export function useBorder (props: IBorderProps | Ref<boolean | number | string | TDirectionBoth | Array<TDirectionBoth> | null | undefined>, name = getCurrentInstanceName()) {
    const borderClasses = computed(() => {
        const border = isRef(props) ? props.value : props.border
        const classes: Array<string> = []

        if (border && typeof border !== 'undefined') {
            classes.push(`${name}--border`)

            if (DIRECTION_ARRAY.includes(border as TDirectionBoth) || (Array.isArray(border) && border.some((bord) => DIRECTION_ARRAY.includes(bord)))) {
                classes.push(`${name}--border-${border}`)
            }

            // Classes-first companion: when `border` is a width keyword
            // ('none' | 'thin' | 'thick'), emit the matching utility
            // class. Direction keywords (top/bottom/...) and free-form
            // strings stay on the inline-style path.
            if (isUtilityBorder(border)) {
                classes.push(`origam--border-${border}`)
            } else if (border === true) {
                // Legacy boolean opt-in is treated as the default
                // 'thin' utility — keeps single-state `<x border>` in
                // sync with the global token.
                classes.push('origam--border-thin')
            }
        }

        return classes
    })

    const borderStyles = computed(() => {
        const border = isRef(props) ? props.value : props.border
        const styles: Array<string> = []

        if (typeof border === 'string' && border !== '') {
            const match = BORDER_REGEX.exec(border)?.groups
            if (match) {
                Object.keys(match).forEach((key) => {
                    let values = String(match[key]).split(' ')

                    if (key === 'style' && isEmpty(match[key])) values = ['solid']

                    if (key === 'color' && isEmpty(match[key])) values = ['currentColor']

                    styles.push(...formatBorderStylesVar(values, key))
                })
            }
        } else if (typeof border === 'number') {
            // A bare numeric width paints nothing: `border-style` defaults to
            // `none`, so `border-width: 4px` alone is invisible. Mirror the
            // string path's defaults (solid / currentColor) so a numeric border
            // actually renders. The standalone `borderStyle` / `borderColor`
            // props below still override these (pushed after).
            styles.push(`border-width: ${convertToUnit(border)}`)
            styles.push('border-style: solid')
            styles.push('border-color: currentColor')
        }

        // Additive surface for the standalone `borderColor` / `borderStyle`
        // props declared on `IBorderProps`. The Ref overload only carries
        // the `border` shorthand value, so these are only consulted when
        // `props` is the props object (not a Ref). Each is emitted only
        // when the consumer supplied a non-empty value, so components that
        // never pass them keep their existing output untouched.
        if (!isRef(props)) {
            const {borderColor, borderStyle} = props

            if (!isEmpty(borderColor)) styles.push(`border-color: ${borderColor}`)
            if (!isEmpty(borderStyle)) styles.push(`border-style: ${borderStyle}`)

            // Per-side width/style/color (issue #215) — `borderTop` /
            // `borderRight` / `borderBottom` / `borderLeft` were declared
            // on `IBorderProps` but never read here. Pushed AFTER the
            // global `border` / `borderColor` / `borderStyle` declarations
            // above so a side-specific value always wins for that physical
            // side (see the precedence note in the JSDoc above `useBorder`).
            BORDER_POSITION_MAP.forEach(({side, widthProp, colorProp}) => {
                const sideValue = props[widthProp]
                const sideColor = props[colorProp]

                if (typeof sideValue === 'number') {
                    // Mirrors the global numeric-border defaulting above: a
                    // bare width alone paints nothing (`border-style`
                    // defaults to `none`), so default to solid/currentColor.
                    styles.push(`border-${side}-width: ${convertToUnit(sideValue)}`)
                    styles.push(`border-${side}-style: solid`)
                    styles.push(`border-${side}-color: currentColor`)
                } else if (sideValue === true) {
                    // Legacy boolean opt-in — no per-side utility class
                    // family exists (only the global `.origam--border-*`
                    // trio), so fall back to the same design-token width
                    // the 'thin' utility resolves to.
                    styles.push(`border-${side}-width: var(--origam-border__width---thin)`)
                    styles.push(`border-${side}-style: solid`)
                    styles.push(`border-${side}-color: currentColor`)
                } else if (typeof sideValue === 'string' && sideValue !== '') {
                    const parsed = parseBorderPositionValue(sideValue)
                    if (parsed) styles.push(...formatBorderPositionStylesVar(side, parsed))
                }

                // `borderTopColor` etc. — additive, TColor-typed. Wins over
                // any color already pushed above for this side (embedded in
                // `borderTop`, or inherited from the global `borderColor` /
                // `border`), same "push last" precedence rule. Gradients
                // are unsupported on `border-color` and resolve to `null`
                // (silently skipped — documented on `IBorderProps`).
                const resolvedSideColor = resolveBorderSideColor(sideColor)
                if (resolvedSideColor) styles.push(`border-${side}-color: ${resolvedSideColor}`)
            })
        }

        return styles
    })

    return {borderClasses, borderStyles}
}
