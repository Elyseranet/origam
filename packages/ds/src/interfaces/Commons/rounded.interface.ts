import type { TRounded } from '../../types'

/**
 * Corner-radius surface.
 *
 * Precedence — SPECIFIC beats GLOBAL, same grammar as `IPaddingProps` /
 * `IMarginProps` / `IBorderProps`, with two rungs instead of three (there
 * is no logical-axis form for corners):
 *
 *   1. `rounded`                   — global shorthand
 *   2. `roundedTopLeft` / `roundedTopRight` /
 *      `roundedBottomLeft` / `roundedBottomRight`
 *
 * A corner prop only overrides the corner it targets — `rounded="lg"` plus
 * `roundedTopLeft="0px"` flattens one corner and leaves the other three at
 * `lg`. See `resolveRoundedCornerValue` for the accepted value forms and
 * `packages/docs/guide/spacing-and-corners.md` for the full reference.
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
}
