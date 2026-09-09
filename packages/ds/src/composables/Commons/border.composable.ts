import { computed, isRef, Ref } from 'vue'
import { DIRECTION_ARRAY } from '../../consts/Commons/anchor.const'
import { BORDER_KEYWORD_WIDTH, BORDER_LOGICAL_AXIS_MAP, BORDER_POSITION_MAP, BORDER_REGEX } from '../../consts/Commons/border.const'

import type { IBorderProps } from '../../interfaces/Commons/border.interface'
import type { TBorderWidthKeyword } from '../../types/Commons/border.type'
import { TDirectionBoth } from '../../types/Commons/anchor.type'

import { formatBorderPositionStylesVar, formatBorderStylesVar, parseBorderPositionValue, resolveBorderSideColor } from '../../utils/Commons/border.util'
import { convertToUnit, isEmpty } from '../../utils/Commons/commons.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/**
 * Set of border values for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest):
 * `.origam--border-none`, `.origam--border-thin`, `.origam--border-thick`.
 */
const UTILITY_BORDER: ReadonlySet<TBorderWidthKeyword> = new Set<TBorderWidthKeyword>([
    'none', 'thin', 'thick'
])

/*********************************************************
 * isUtilityBorder / isDirectionBorder
 *
 * @description
 * Membership guards for the two CLASS-channel families `border` accepts.
 *
 * @description
 * ⛔ Both return a NARROW literal union, never `value is string` (#391).
 * A guard typed `value is string` looks harmless but makes TypeScript
 * subtract EVERY string from the `else` branch, so the direction branch
 * and the free-form-string branch both became unreachable in the
 * compiler's model — while still running at runtime. That mismatch is
 * what produced `TS2352` / `TS2367` and tempted a cast; the cast would
 * have silenced the compiler on a union (`number | boolean |
 * TDirectionBoth[] | null | undefined`) that genuinely holds the other
 * shapes `border` accepts. Narrow the guard, don't force the type.
 *
 * @description
 * `DIRECTION_ARRAY` is UPCAST to `ReadonlyArray<string>` before the
 * membership test — a widening conversion, always sound — rather than
 * DOWNCASTING the candidate value to `TDirectionBoth`, which is the
 * unsound direction the compiler was rejecting.
 ********************************************************/
function isUtilityBorder (value: unknown): value is TBorderWidthKeyword {
    return typeof value === 'string' && UTILITY_BORDER.has(value as TBorderWidthKeyword)
}

function isDirectionBorder (value: unknown): value is TDirectionBoth {
    return typeof value === 'string' && (DIRECTION_ARRAY as ReadonlyArray<string>).includes(value)
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
 * WIDTH KEYWORDS AND DIRECTIONS ARE EMITTED INLINE (#391). 'none' | 'thin'
 * | 'thick' and 'top' | 'right' | 'bottom' | 'left' resolve to a WIDTH, so
 * they take the same inline path the numeric `:border="4"` form already
 * took — which is precisely why the numeric case always worked while the
 * keywords did not. The global `.origam--border-{kw}` utility is still
 * emitted and still paints wherever nothing competes, but it CANNOT be the
 * mechanism on its own: a utility is specificity (0,1,0) while a Vue scoped
 * rule is `.class[data-v-hash]` = (0,2,0), so a component painting from
 * `border-width: var(--origam-{cmp}---border-width, …)` outranks it
 * whatever the sheet order. Measured: 10 of the 43 `useBorder` consumers
 * carry such a rule (Btn, List, Kbd, Code, Card*, Audio, Calendar, …) and
 * on every one of them `thick` painted `thin` and `none` painted `thin`.
 * Widths come from `BORDER_KEYWORD_WIDTH`, the same tokens the utility
 * declares, so the two channels cannot drift.
 *
 * @description
 * A DIRECTION ISOLATES ITS EDGE. `border="top"` emits all four physical
 * widths — `thin` on the named side, `0` on the other three — because the
 * components that paint from a single `border-width` shorthand have no
 * per-side custom property a class could target. Emitting the four
 * declarations is what makes a direction mean the same thing everywhere
 * instead of only on the two components that happen to declare per-side
 * variables.
 *
 * @description
 * WHEN #514 IS SETTLED, THIS INLINE PATH IS THE THING TO REMOVE. If the DS
 * adopts `@layer` (measured in `packages/tests/e2e/btn-cascade-layer-probe.spec.ts`),
 * the utility wins on its own and these `styles.push` calls become dead.
 * Until then the inline copy is the only channel that can actually paint.
 ********************************************************/
export function useBorder (props: IBorderProps | Ref<boolean | number | string | TDirectionBoth | Array<TDirectionBoth> | null | undefined>, name = getCurrentInstanceName()) {
    const borderClasses = computed(() => {
        const border = isRef(props) ? props.value : props.border
        const classes: Array<string> = []

        if (border && typeof border !== 'undefined') {
            classes.push(`${name}--border`)

            if (isDirectionBorder(border) || (Array.isArray(border) && border.some((bord) => DIRECTION_ARRAY.includes(bord)))) {
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

        if (isUtilityBorder(border)) {
            styles.push(`border-width: ${BORDER_KEYWORD_WIDTH[border]}`)
            styles.push('border-style: solid')
            styles.push('border-color: currentColor')
        } else if (isDirectionBorder(border)) {
            DIRECTION_ARRAY.forEach((side) => {
                styles.push(`border-${side}-width: ${side === border ? BORDER_KEYWORD_WIDTH.thin : BORDER_KEYWORD_WIDTH.none}`)
            })
            styles.push('border-style: solid')
            styles.push('border-color: currentColor')
        } else if (typeof border === 'string' && border !== '') {
            const match = BORDER_REGEX.exec(border)?.groups
            if (match) {
                Object.keys(match).forEach((key) => {
                    let values = String(match[key]).split(' ')

                    if (key === 'width' && isEmpty(match[key])) return

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
