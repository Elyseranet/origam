import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots } from '../../interfaces'

import type { TChartPyramidKind } from '../../types'

/**
 * Props for `<OrigamChartPyramid>` — the pyramid / funnel family.
 *
 * A single series of N data points is rendered as N horizontal
 * trapezoids stacked vertically, each proportional to its value
 * relative to the maximum in the series.
 *
 * `type="funnel"` places the widest slice at the top (classic
 * conversion funnel: many → few). `type="pyramid"` inverts this
 * (narrow at top, wide at bottom — classic pyramid chart).
 */
export interface IChartPyramidProps extends IChartBaseProps {
    /**
     * Rendering mode. `'funnel'` = widest at top; `'pyramid'` =
     * widest at bottom. Default `'funnel'`.
     */
    type?: TChartPyramidKind
    /**
     * Gap between consecutive trapezoid slices, in SVG pixels.
     * Default `4`.
     */
    sliceGap?: number
    /**
     * Whether to render the category name + value inside each slice
     * when the slice is large enough, or beside it when it is not.
     * `'inside'` — label always inside the trapezoid.
     * `'outside'` — label always beside the trapezoid.
     * `'auto'`  — inside when the slice height ≥ 28px, outside
     *              otherwise. Default `'auto'`.
     */
    labelPlacement?: 'inside' | 'outside' | 'auto'
    /**
     * X-axis / value formatter applied to the per-slice value label.
     * When omitted the raw number is displayed.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Y-axis formatter — alias kept for API symmetry with other
     * families. Same as `xAxisFormat` for this geometry.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartPyramid>`. Mirrors the base family. */
export type IChartPyramidEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartPyramid>`. */
export interface IChartPyramidSlots extends IChartBaseSlots {
    /**
     * Replace the label rendered on / beside each slice.
     * Receives the category name, raw value, formatted value, and
     * the resolved slice colour.
     */
    'slice-label'?: (bindings: {
        category: string
        value: number
        formatted: string
        color: string
        index: number
        visible: boolean
    }) => any
}

/**
 * Single slice descriptor produced by the pyramid geometry engine.
 * Exposes the pre-computed SVG `<path d="…">` for the trapezoid,
 * the label anchor position, and all data needed to render
 * accessibility text + tooltip content.
 */
export interface IChartPyramidSlice {
    /** Slice index in the original data array. */
    index: number
    /** SVG `<path d="…">` for the trapezoid. */
    d: string
    /** Resolved CSS colour string. */
    color: string
    /** Category label (from `categories[index]` or fallback). */
    category: string
    /** Raw numeric value from `series.data[index]`. */
    value: number
    /** Pre-formatted value string. */
    formatted: string
    /** Whether this slice is currently visible (legend toggle). */
    visible: boolean
    /**
     * Label anchor — centre of the trapezoid face for `inside`
     * placement; right-edge midpoint + offset for `outside`.
     */
    labelX: number
    labelY: number
    /** SVG `text-anchor` attribute matching `labelX` placement. */
    labelAnchor: 'middle' | 'start'
    /** Y of the leader-line target (band right edge midpoint). */
    leaderX: number
    /** `true` when the band is wide enough to host the label inside. */
    labelFitsInside: boolean
}
