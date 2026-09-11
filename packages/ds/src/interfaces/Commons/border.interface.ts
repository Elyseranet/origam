import { TColor, TDirectionBoth } from "../../types"

export interface IBorderProps {
    border?: boolean | number | string | TDirectionBoth | Array<TDirectionBoth>
    borderTop?: boolean | number | string
    borderLeft?: boolean | number | string
    borderBottom?: boolean | number | string
    borderRight?: boolean | number | string
    borderBlock?: boolean | number | string
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
