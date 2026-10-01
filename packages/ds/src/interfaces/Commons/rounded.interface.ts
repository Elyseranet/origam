import type { TRounded } from '../../types/Commons/rounded.type'

/**
 * Corner-radius surface.
 *
 * Precedence — SPECIFIC beats GLOBAL, same grammar as `IPaddingProps` /
 * `IMarginProps` / `IBorderProps`, with three rungs instead of four (there
 * is no logical-AXIS form for corners — a corner belongs to both axes at
 * once):
 *
 *   1. `rounded`                   — global shorthand
 *   2. `roundedStartStart` / `roundedStartEnd` /
 *      `roundedEndStart` / `roundedEndEnd`      — logical corner
 *   3. `roundedTopLeft` / `roundedTopRight` /
 *      `roundedBottomLeft` / `roundedBottomRight`  — physical corner
 *
 * A corner prop only overrides the corner it targets — `rounded="lg"` plus
 * `roundedTopLeft="0px"` flattens one corner and leaves the other three at
 * `lg`. See `resolveRoundedCornerValue` for the accepted value forms and
 * `packages/docs/guide/spacing-and-corners.md` for the full reference.
 *
 * ⚠️ Rungs 2 and 3 are EQUALLY specific — `roundedStartStart` and
 * `roundedTopLeft` are the same corner in LTR horizontal-tb, so the
 * tiebreak is a choice, not a derivation. The physical one wins, the same
 * direction `ROUNDED_CORNER_MAP` already documents against the shorthand's
 * logical output. Pick one grid per component.
 */
export interface IRoundedProps {
    /**
     * Corner-radius selector. Three modes:
     *  - **named variant** (`'small' | 'default' | 'large' | …`,
     *    cf. `ROUNDED` enum) → emits `--rounded-{name}` class so the
     *    component's SCSS can pick the right token rung.
     *  - **boolean `true`** (or empty string `''`) → emits the legacy
     *    `--rounded` class for components that only have a single rounded
     *    state (e.g. `OrigamBtn` defaulting to `radius.2xl`).
     *  - **CSS value** (`'4px'`, `'4px 0 4px 0'`, `100`) → emits inline
     *    `border-radius` declarations via `useRounded.roundedStyles`.
     */
    rounded?: boolean | number | string | TRounded | null | undefined
    /**
     * Top-right corner only. Takes the same vocabulary as `rounded`
     * (`8`, `'8px'`, `'md'`, `'large'`, `'var(…)'`), minus `shaped` /
     * `shaped-invert` which are asymmetric by definition.
     */
    roundedTopRight?: boolean | number | string
    /** Top-left corner only. Same vocabulary as `roundedTopRight`. */
    roundedTopLeft?: boolean | number | string
    /** Bottom-left corner only. Same vocabulary as `roundedTopRight`. */
    roundedBottomLeft?: boolean | number | string
    /** Bottom-right corner only. Same vocabulary as `roundedTopRight`. */
    roundedBottomRight?: boolean | number | string
    /**
     * The block-start inline-start corner only — top-left in LTR
     * horizontal-tb, **top-right in RTL**. Emits the native logical
     * longhand `border-start-start-radius`, which the browser flips for
     * you.
     *
     * Same vocabulary as `roundedTopRight` (`8`, `'8px'`, `'md'`,
     * `'large'`, `'var(…)'`), minus `shaped` / `shaped-invert`. Overrides
     * `rounded` for that corner; beaten by `roundedTopLeft`.
     *
     * ⚠️ The name reads `{block}-{inline}`, per CSS — the FIRST half is the
     * block end, the second the inline end. `roundedStartEnd` is therefore
     * block-start inline-end (top-RIGHT in LTR), not a mirror of this one
     * along the other axis. Swapping the halves silently rounds the
     * opposite corner.
     */
    roundedStartStart?: boolean | number | string
    /**
     * The block-start inline-end corner — top-right in LTR. Emits
     * `border-start-end-radius`. Same vocabulary and rank as
     * `roundedStartStart`; beaten by `roundedTopRight`.
     */
    roundedStartEnd?: boolean | number | string
    /**
     * The block-end inline-start corner — bottom-left in LTR. Emits
     * `border-end-start-radius`. Same vocabulary and rank as
     * `roundedStartStart`; beaten by `roundedBottomLeft`.
     */
    roundedEndStart?: boolean | number | string
    /**
     * The block-end inline-end corner — bottom-right in LTR. Emits
     * `border-end-end-radius`. Same vocabulary and rank as
     * `roundedStartStart`; beaten by `roundedBottomRight`.
     */
    roundedEndEnd?: boolean | number | string
}
