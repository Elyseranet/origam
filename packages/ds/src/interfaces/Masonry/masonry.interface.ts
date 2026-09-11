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
    TGridGapSize,
    TMasonryAlign
} from '../../types'

/**
 * Map of `min-width` (px) → number of columns to apply when the
 * container is at least that wide. Container-query based (NOT viewport),
 * so a masonry placed in a 600 px sidebar will pick the breakpoint that
 * matches 600 px, regardless of viewport width.
 *
 * Example:
 *   { 600: 2, 900: 3, 1200: 4 }
 *
 * → < 600 px : `columns` prop value (default 3).
 * → ≥ 600 px : 2.
 * → ≥ 900 px : 3.
 * → ≥ 1200 px: 4.
 *
 * Keys must be positive integers (pixel widths). Values must be positive
 * integers (column counts). Order is irrelevant — the composable sorts
 * the entries by key ascending and picks the largest key ≤ container
 * width.
 */
export type TMasonryColumnBreakpoints = Record<number, number>

/**
 * Props for `<OrigamMasonry>` — Pinterest-style masonry layout.
 *
 * `<OrigamMasonry>` ships a CSS-first implementation gated on
 * `grid-template-rows: masonry` (detected via `useCssSupport`). When
 * the browser supports it the layout is pure CSS; when it doesn't, a
 * `useMasonry` JS fallback runs (`ResizeObserver` + bucket-fill
 * algorithm). The runtime decision is transparent to the consumer.
 */
export interface IMasonryProps extends ICommonsComponentProps, ITagProps, IDimensionProps, IMarginProps, IPaddingProps, IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps {
    /**
     * Number of columns to use when no breakpoint matches the container
     * width. Must be a positive integer ≥ 1.
     *
     * @default 3
     */
    columns?: number
    /**
     * Container-query column breakpoints. See `TMasonryColumnBreakpoints`.
     * When provided, the masonry observes its own size via
     * `ResizeObserver` and picks the matching column count automatically.
     *
     * Pass `undefined` (or an empty object) to disable container-query
     * resolution and use the `columns` prop verbatim.
     */
    columnBreakpoints?: TMasonryColumnBreakpoints
    /**
     * Gap between items, both vertically and horizontally. Accepts:
     *
     * - one of the grid size tokens `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
     *   (resolved via `tokens/component/grid.json`, same matrix as
     *   `<OrigamGrid>` for visual consistency).
     * - any CSS length string (`'24px'`, `'1rem'`).
     * - a plain `number` interpreted as pixels.
     *
     * @default 'md'
     */
    gap?: TGridGapSize | string | number
    /**
     * Animate `transform` when an item moves to a different position on
     * column-count change. CSS-only — the transition is applied to the
     * item children, so the consumer's content doesn't need to know.
     *
     * @default true
     */
    animated?: boolean
    /**
     * Vertical alignment of items inside a column. `'top'` is the
     * standard Pinterest layout; `'center'` centres each column's
     * cumulative content inside the container height.
     *
     * Only the JS fallback honours `'center'` — the CSS-native path
     * always packs to the top. See `TMasonryAlign`.
     *
     * @default 'top'
     */
    align?: TMasonryAlign
}
