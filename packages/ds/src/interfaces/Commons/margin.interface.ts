/**
 * Outer-spacing surface.
 *
 * Precedence — SPECIFIC beats GLOBAL, same grammar as `IPaddingProps` /
 * `IBorderProps` / `IRoundedProps`:
 *
 *   1. `margin`                       — global shorthand
 *   2. `marginBlock` / `marginInline` — logical axis
 *   3. `marginTop` / `marginRight` / `marginBottom` / `marginLeft`
 *
 * Each rung only overrides the edge(s) it targets. See
 * `resolveSpacingValue` for the accepted value forms (the directionals
 * also take the `auto` keyword), and
 * `packages/docs/guide/spacing-and-corners.md` for the full reference.
 *
 * ⚠️ The 4-value `margin` shorthand distributes as
 * **Haut/Gauche/Bas/Droite**, NOT the CSS clockwise order (issue #216).
 * The per-side props exist so you never have to know that.
 */
export interface IMarginProps {
    /**
     * Global shorthand. `16` → `16px`; `"4"` → the `--origam-space---4`
     * design rung; `"8px 16px"` → block / inline; `true` → the legacy
     * `--marged` class.
     */
    margin?: boolean | number | string
    /** Overrides `margin` and `marginBlock` for the top edge. */
    marginTop?: boolean | number | string
    /** Overrides `margin` and `marginInline` for the left edge. */
    marginLeft?: boolean | number | string
    /** Overrides `margin` and `marginBlock` for the bottom edge. */
    marginBottom?: boolean | number | string
    /** Overrides `margin` and `marginInline` for the right edge. */
    marginRight?: boolean | number | string
    /** Top + bottom. Overrides `margin`; beaten by `marginTop` / `marginBottom`. */
    marginBlock?: boolean | number | string
    /** Left + right. Overrides `margin`; beaten by `marginLeft` / `marginRight`. */
    marginInline?: boolean | number | string
}
