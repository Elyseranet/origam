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
    /**
     * The inline-START edge only — left in LTR, **right in RTL**. The
     * writing-mode-relative way to pad one horizontal edge; emits
     * `padding-inline-start`, which the browser flips for you.
     *
     * Takes the same vocabulary as `padding` (`16`, `"4"`, `"8px"`,
     * `"var(…)"`, `"calc(…)"`). Overrides `padding` and `paddingInline`
     * for that edge; beaten by `paddingLeft` (see the precedence note on
     * the interface).
     *
     * Prefer this over `paddingLeft` whenever the value is a reading-order
     * offset — an indent, a gutter beside an accent rule — rather than a
     * genuinely physical one.
     */
    paddingInlineStart?: boolean | number | string
    /**
     * The inline-END edge only — right in LTR, **left in RTL**. Emits
     * `padding-inline-end`. Same vocabulary and same rank as
     * `paddingInlineStart`; beaten by `paddingRight`.
     */
    paddingInlineEnd?: boolean | number | string
    /**
     * The block-START edge only — top in horizontal-tb. Emits
     * `padding-block-start`. Same vocabulary and rank as
     * `paddingInlineStart`; overrides `padding` and `paddingBlock` for
     * that edge, beaten by `paddingTop`.
     */
    paddingBlockStart?: boolean | number | string
    /**
     * The block-END edge only — bottom in horizontal-tb. Emits
     * `padding-block-end`. Same vocabulary and rank as
     * `paddingInlineStart`; beaten by `paddingBottom`.
     */
    paddingBlockEnd?: boolean | number | string
}
