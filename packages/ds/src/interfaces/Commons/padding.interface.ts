/**
 * Inner-spacing surface.
 *
 * Precedence — SPECIFIC beats GLOBAL, same grammar as `IMarginProps` /
 * `IBorderProps` / `IRoundedProps`:
 *
 *   1. `padding`                        — global shorthand
 *   2. `paddingBlock` / `paddingInline` — logical axis
 *   3. `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft`
 *
 * Each rung only overrides the edge(s) it targets. See
 * `resolveSpacingValue` for the accepted value forms, and
 * `packages/docs/guide/spacing-and-corners.md` for the full reference.
 *
 * ⚠️ The 4-value `padding` shorthand distributes as
 * **Haut/Gauche/Bas/Droite**, NOT the CSS clockwise order (issue #216).
 * The per-side props exist so you never have to know that.
 */
export interface IPaddingProps {
    /**
     * Global shorthand. `16` → `16px`; `"4"` → the `--origam-space---4`
     * design rung; `"8px 16px"` → block / inline; `true` → the legacy
     * `--padded` class.
     */
    padding?: boolean | number | string
    /** Overrides `padding` and `paddingBlock` for the top edge. */
    paddingTop?: boolean | number | string
    /** Overrides `padding` and `paddingInline` for the left edge. */
    paddingLeft?: boolean | number | string
    /** Overrides `padding` and `paddingBlock` for the bottom edge. */
    paddingBottom?: boolean | number | string
    /** Overrides `padding` and `paddingInline` for the right edge. */
    paddingRight?: boolean | number | string
    /** Top + bottom. Overrides `padding`; beaten by `paddingTop` / `paddingBottom`. */
    paddingBlock?: boolean | number | string
    /** Left + right. Overrides `padding`; beaten by `paddingLeft` / `paddingRight`. */
    paddingInline?: boolean | number | string
}
