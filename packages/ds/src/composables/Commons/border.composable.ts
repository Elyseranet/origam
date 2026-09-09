import { computed, isRef, Ref } from 'vue'
import { DIRECTION_ARRAY } from '../../consts/Commons/anchor.const'
import { BORDER_LOGICAL_AXIS_MAP, BORDER_POSITION_MAP, BORDER_REGEX } from '../../consts/Commons/border.const'

import type { IBorderProps } from '../../interfaces/Commons/border.interface'
import { TDirectionBoth } from '../../types/Commons/anchor.type'

import { formatBorderPositionStylesVar, formatBorderStylesVar, parseBorderPositionValue, resolveBorderSideColor } from '../../utils/Commons/border.util'
import { convertToUnit, isEmpty } from '../../utils/Commons/commons.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

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
 *   3. logical-axis `borderBlock` / `borderInline` (width, and
 *      style/color when a full string like `"2px dashed red"` is given)
 *   4. per-side `borderTop` / `borderRight` / `borderBottom` / `borderLeft`
 *      (physical properties — more specific than the axis rung above:
 *      `borderTop` overrides whatever `borderBlock` set for the top edge)
 *   5. per-side `borderTopColor` / `borderRightColor` /
 *      `borderBottomColor` / `borderLeftColor`
 *
 * So `borderBlock` beats `border` for the top+bottom edges, `borderTop`
 * beats both `border` and `borderBlock` for the top side specifically,
 * and `borderTopColor` beats the color embedded in `borderTop`, the
 * axis-level color, and the global `borderColor` — each rung only
 * overrides the side(s)/axis it actually targets, everything else keeps
 * cascading from the rung below.
 *
 * @description
 * WIDTH KEYWORDS EMIT TWO CLASSES (#391). For 'none' | 'thin' | 'thick'
 * the global `.origam--border-{kw}` utility is emitted, but it CANNOT
 * paint on its own: a utility is specificity (0,1,0) while a Vue scoped
 * rule is `.class[data-v-hash]` = (0,2,0), so the component's own
 * `border-*-width` declaration outranks it whatever the sheet order —
 * that is specificity, not order. Measured on Btn before the fix:
 * `border="thick"` painted 1px, `border="none"` painted 1px instead of
 * cancelling. A component-scoped `${name}--border-{kw}` modifier is
 * therefore emitted alongside, mirroring what the direction sub-values
 * (`${name}--border-{side}`) already do; the component consumes it by
 * writing the custom property its base rule already reads. Only Btn
 * carries those rules today — the class is inert on the other 42
 * `useBorder` consumers until each grows them, or until the DS-wide
 * cascade decision (#391 / #514) is taken.
 *
 * @description
 * KEYWORDS ARE NOT COLOURS. `BORDER_REGEX`'s <color> alternative ends in
 * a bare `[A-Za-z]+`, so it matched the class-channel keywords as if they
 * were colours: `border="top"` parsed to `{width:'', style:'', color:
 * 'top'}` and the style loop emitted `border-color: top` plus an EMPTY
 * `border-width: `. Neither painted anything, but both landed in the live
 * `style` attribute. Those two facets now fall back to the same defaults
 * the empty case uses (`currentColor`, and no width declaration at all).
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
                classes.push(`${name}--border-${border}`)
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

                    const isChannelKeyword = isUtilityBorder(border) || DIRECTION_ARRAY.includes(border as TDirectionBoth)

                    if (key === 'width' && (isEmpty(match[key]) || isChannelKeyword)) return

                    if (key === 'style' && isEmpty(match[key])) values = ['solid']

                    if (key === 'color' && (isEmpty(match[key]) || isChannelKeyword)) values = ['currentColor']

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

            // Logical-axis width/style (bug: `borderBlock` / `borderInline`
            // were declared on `IBorderProps` but never read here — a
            // "half-implemented surface", same shape as the pre-#215 gap
            // on the physical per-side props). Pushed AFTER the global
            // `border` / `borderColor` / `borderStyle` declarations above,
            // and BEFORE the physical per-side loop below, so a physical
            // `borderTop` still wins over `borderBlock` for the top edge
            // (specific beats general — see the precedence table above).
            BORDER_LOGICAL_AXIS_MAP.forEach(({axis, widthProp}) => {
                const axisValue = props[widthProp]

                if (typeof axisValue === 'number') {
                    // Mirrors the global/per-side numeric defaulting: a bare
                    // width alone paints nothing (`border-style` defaults to
                    // `none`), so default to solid/currentColor.
                    styles.push(`border-${axis}-width: ${convertToUnit(axisValue)}`)
                    styles.push(`border-${axis}-style: solid`)
                    styles.push(`border-${axis}-color: currentColor`)
                } else if (axisValue === true) {
                    // Legacy boolean opt-in — same 'thin' design-token width
                    // as the physical per-side boolean form.
                    styles.push(`border-${axis}-width: var(--origam-border__width---thin)`)
                    styles.push(`border-${axis}-style: solid`)
                    styles.push(`border-${axis}-color: currentColor`)
                } else if (typeof axisValue === 'string' && axisValue !== '') {
                    const parsed = parseBorderPositionValue(axisValue)
                    if (parsed) styles.push(...formatBorderPositionStylesVar(axis, parsed))
                }
            })

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
