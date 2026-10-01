/**
 * Inner-spacing surface.
 *
 * Precedence — SPECIFIC beats GLOBAL, same grammar as `IMarginProps` /
 * `IBorderProps` / `IRoundedProps`:
 *
 *   1. `padding`                        — global shorthand
 *   2. `paddingBlock` / `paddingInline` — logical axis
 *   3. `paddingInlineStart` / `paddingInlineEnd` /
 *      `paddingBlockStart` / `paddingBlockEnd`  — logical side
 *   4. `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft`
 *      — physical side
 *
 * Each rung only overrides the edge(s) it targets. See
 * `resolveSpacingValue` for the accepted value forms, and
 * `packages/docs/guide/spacing-and-corners.md` for the full reference.
 *
 * ⚠️ The 4-value `padding` shorthand distributes as
 * **Haut/Gauche/Bas/Droite**, NOT the CSS clockwise order (issue #216).
 * The per-side props exist so you never have to know that.
 *
 * ⚠️ Rungs 3 and 4 are EQUALLY specific — `paddingInlineStart` and
 * `paddingLeft` are two spellings of the same edge in LTR horizontal-tb, so
 * neither is "more specific" than the other and the tiebreak is a choice,
 * not a derivation. The physical one wins, which keeps the direction the
 * repo's only other physical-vs-logical tiebreak already takes (see
 * `ROUNDED_CORNER_MAP` in `consts/Commons/spacing.const.ts`). Setting both
 * for one edge is a consumer mistake either way; pick one grid.
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
    /*********************************************************
     * Logical per-side padding — rung 3 (issue #1013)
     *
     * @description
     * One WRITING-MODE-RELATIVE edge each. They emit the native logical
     * longhands (`padding-inline-start`, …), so the browser flips them
     * under RTL and in vertical writing modes for you.
     *
     * @description
     * `paddingInlineStart` — left in LTR, **right in RTL**.
     * `paddingInlineEnd` — right in LTR, **left in RTL**.
     * `paddingBlockStart` — top in horizontal-tb.
     * `paddingBlockEnd` — bottom in horizontal-tb.
     *
     * @description
     * Same vocabulary as `padding` (`16`, `"4"`, `"8px"`, `"var(…)"`,
     * `"calc(…)"`). Each overrides `padding` and its axis prop for the one
     * edge it targets, and is in turn beaten by the matching PHYSICAL prop
     * (`paddingLeft` & co) — see the precedence note above.
     *
     * @description
     * Prefer these over the physical four whenever the value is a
     * reading-order offset — an indent, a gutter beside an accent rule —
     * rather than a genuinely physical one.
     ********************************************************/
    paddingInlineStart?: boolean | number | string
    paddingInlineEnd?: boolean | number | string
    paddingBlockStart?: boolean | number | string
    paddingBlockEnd?: boolean | number | string
}
