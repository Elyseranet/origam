/**
 * Outer-spacing surface.
 *
 * Precedence — SPECIFIC beats GLOBAL, same grammar as `IPaddingProps` /
 * `IBorderProps` / `IRoundedProps`:
 *
 *   1. `margin`                       — global shorthand
 *   2. `marginBlock` / `marginInline` — logical axis
 *   3. `marginInlineStart` / `marginInlineEnd` /
 *      `marginBlockStart` / `marginBlockEnd`  — logical side
 *   4. `marginTop` / `marginRight` / `marginBottom` / `marginLeft`
 *      — physical side
 *
 * Each rung only overrides the edge(s) it targets. See
 * `resolveSpacingValue` for the accepted value forms (the directionals
 * also take the `auto` keyword), and
 * `packages/docs/guide/spacing-and-corners.md` for the full reference.
 *
 * ⚠️ The 4-value `margin` shorthand distributes as
 * **Haut/Gauche/Bas/Droite**, NOT the CSS clockwise order (issue #216).
 * The per-side props exist so you never have to know that.
 *
 * ⚠️ Rungs 3 and 4 are EQUALLY specific — see the same note on
 * `IPaddingProps`. The physical spelling wins for a given edge.
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
    /*********************************************************
     * Logical per-side margin — rung 3 (issue #1013)
     *
     * @description
     * One WRITING-MODE-RELATIVE edge each, emitted as the native logical
     * longhands (`margin-inline-start`, …) so the browser flips them under
     * RTL and in vertical writing modes.
     *
     * @description
     * `marginInlineStart` — left in LTR, **right in RTL**.
     * `marginInlineEnd` — right in LTR, **left in RTL**.
     * `marginBlockStart` — top in horizontal-tb.
     * `marginBlockEnd` — bottom in horizontal-tb.
     *
     * @description
     * Same vocabulary as `margin`, the `auto` keyword included — and that
     * is their best argument: `marginInlineStart="auto"` pushes an element
     * to the far end of its line in BOTH reading directions, where
     * `marginLeft="auto"` pushes it the wrong way under RTL.
     *
     * @description
     * Each overrides `margin` and its axis prop for the one edge it
     * targets, and is beaten by the matching PHYSICAL prop.
     ********************************************************/
    marginInlineStart?: boolean | number | string
    marginInlineEnd?: boolean | number | string
    marginBlockStart?: boolean | number | string
    marginBlockEnd?: boolean | number | string
}
