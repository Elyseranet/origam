import { TColor } from '../../types/Commons/color.type'
import { TDirectionBoth } from '../../types/Commons/anchor.type'

export interface IBorderProps {
    border?: boolean | number | string | TDirectionBoth | Array<TDirectionBoth>
    borderTop?: boolean | number | string
    borderLeft?: boolean | number | string
    borderBottom?: boolean | number | string
    borderRight?: boolean | number | string
    /**
     * Logical-axis shorthand for the block-start + block-end edges (top +
     * bottom in the default horizontal-tb writing mode). Resolves to the
     * native CSS `border-block-{width,style,color}` properties — same
     * value grammar as `borderTop` / `borderRight` / `borderBottom` /
     * `borderLeft` (boolean opt-in, bare width number, or a free-form
     * `"width style color"` string). Precedence: beats the global `border`
     * shorthand for the edges it targets, but a physical `borderTop` /
     * `borderBottom` still wins over it for that specific edge — see
     * `useBorder` JSDoc for the full precedence table.
     */
    borderBlock?: boolean | number | string
    /**
     * Logical-axis shorthand for the inline-start + inline-end edges (left
     * + right in LTR). Same grammar and precedence rules as `borderBlock`,
     * mapped onto `border-inline-{width,style,color}`.
     */
    borderInline?: boolean | number | string
    borderColor?: string
    borderStyle?: string
    /**
     * Per-side color override (issue #215). Additive: absent by default,
     * no behaviour change for existing consumers.
     *
     * Precedence (specific > global): `borderTopColor` wins over any
     * color implied by `borderTop` (e.g. `borderTop="2px dashed red"`),
     * which itself wins over the global `borderColor` / `border` shorthand
     * for the top side. See `useBorder` JSDoc for the full precedence
     * table.
     *
     * Accepts a {@link TColor} (semantic intent, raw CSS color, or falsy
     * to opt out) — same input family as `color` / `bgColor`. Gradients
     * are NOT supported on border colors (CSS `border-color` has no
     * gradient form) and are silently ignored.
     */
    borderTopColor?: TColor
    borderRightColor?: TColor
    borderBottomColor?: TColor
    borderLeftColor?: TColor
}
