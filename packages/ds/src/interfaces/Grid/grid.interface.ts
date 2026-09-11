import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type {
    TGridAutoFlow,
    TGridGapSize,
    TGridPlaceContent,
    TGridPlaceItems
} from '../../types'

/**
 * Tracks definition accepted by `columns` / `rows` / `autoColumns` /
 * `autoRows`. The three accepted shapes are intentionally permissive
 * because CSS `grid-template-*` is itself extremely permissive:
 *
 * - `number`   → `repeat(N, 1fr)` — the 90 % case ("just give me 12 columns").
 * - `string`   → passed verbatim — escape hatch for `repeat(auto-fill, minmax(200px, 1fr))`,
 *               named lines, custom track lists, …
 * - `string[]` → joined with a single space — useful when the consumer
 *               wants per-track sizing without nested-string awkwardness
 *               (`['200px', '1fr', '200px']`).
 */
export type TGridTracks = number | string | ReadonlyArray<string>

/**
 * Props for `<OrigamGrid>` — a declarative CSS Grid container.
 *
 * The component is intentionally thin: it forwards every CSS Grid
 * property through inline custom properties on the root element.
 * No track measurement, no JS resize observation — modern browsers
 * have shipped Grid since 2017 and we lean on that.
 */
export interface IGridProps extends ICommonsComponentProps, ITagProps, IDimensionProps, IMarginProps, IPaddingProps, IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps {
    /**
     * Track template for the inline axis (`grid-template-columns`).
     *
     * - `number` (e.g. `12`) — sugar for `repeat(N, 1fr)`.
     * - `string` (e.g. `'1fr 2fr 1fr'` or `'repeat(auto-fill, minmax(200px, 1fr))'`)
     *   — passed verbatim.
     * - `string[]` (e.g. `['200px', '1fr', '200px']`) — joined with single space.
     *
     * @default 'auto'
     */
    columns?: TGridTracks
    /**
     * Track template for the block axis (`grid-template-rows`).
     * Same accepted shapes as `columns`.
     *
     * @default 'auto'
     */
    rows?: TGridTracks
    /**
     * Both-axis gap. Accepts:
     *
     * - one of the size tokens `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
     *   (resolved via `tokens/component/grid.json`).
     * - any CSS length string (`'24px'`, `'1rem'`, `'1rem 2rem'`).
     * - a plain `number` interpreted as pixels.
     *
     * `columnGap` / `rowGap` take precedence on their respective axis.
     *
     * @default 'md'
     */
    gap?: TGridGapSize | string | number
    /**
     * Inline-axis-only gap override. Same accepted shapes as `gap`.
     */
    columnGap?: TGridGapSize | string | number
    /**
     * Block-axis-only gap override. Same accepted shapes as `gap`.
     */
    rowGap?: TGridGapSize | string | number
    /**
     * `grid-template-areas`. Two accepted shapes:
     *
     * - `string[]` — every entry is one row of the template
     *   (`['header header', 'sidebar main']`). Each entry is wrapped in
     *   quotes by the component, so the consumer doesn't have to.
     * - `string` — raw CSS, passed verbatim. Use it when you want to
     *   inline `". header ."` style escape hatches with multiple double-
     *   quoted rows yourself.
     */
    areas?: string | ReadonlyArray<string>
    /**
     * `grid-auto-flow`. Controls how implicit tracks are filled when
     * items don't declare an explicit area.
     *
     * @default 'row'
     */
    autoFlow?: TGridAutoFlow
    /**
     * `grid-auto-columns` — sizes for implicit columns. Free-form CSS.
     */
    autoColumns?: string
    /**
     * `grid-auto-rows` — sizes for implicit rows. Free-form CSS.
     */
    autoRows?: string
    /**
     * `align-items` — block-axis alignment of grid items inside their cells.
     *
     * @default 'stretch'
     */
    alignItems?: TGridPlaceItems
    /**
     * `justify-items` — inline-axis alignment of grid items inside their cells.
     *
     * @default 'stretch'
     */
    justifyItems?: TGridPlaceItems
    /**
     * `align-content` — block-axis alignment of the whole grid inside
     * its container (only relevant when the grid is smaller than its
     * container on that axis).
     */
    alignContent?: TGridPlaceContent
    /**
     * `justify-content` — inline-axis alignment of the whole grid
     * inside its container.
     */
    justifyContent?: TGridPlaceContent
    /**
     * Toggles `display: inline-grid` instead of `display: grid`. Useful
     * for inline-flow layouts (e.g. a label + tag pill where you want
     * the grid to size to its content).
     *
     * @default false
     */
    inline?: boolean
}
