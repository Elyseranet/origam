import type {
    IChartAnnotation,
    IChartBaseEmits,
    IChartBaseProps,
    IChartBaseSlots,
    IChartDrilldownLink,
    IChartDrilldownProps,
    IChartPlotBand,
    IChartPlotLine,
    IChartPoint,
    IChartRangeSelector,
    IChartSecondaryYAxis
} from '../../interfaces'

import type {
    TChartCartesianKind,
    TChartSmoothing,
    TChartStacking
} from '../../types'

/**
 * Props for `<OrigamChartCartesian>` — the cartesian family
 * component. Owns the X+Y plotting area (axes, grid, tick labels)
 * AND the line / area / bar / column / scatter / spline /
 * stepped-line topologies.
 *
 * Distinct from the legacy `<OrigamChart>` shell because it
 * deliberately rejects polar / radar / gauge values — the `type`
 * field is narrowed to `TChartCartesianKind`. Use the shell when
 * you need runtime type switching across families; use this
 * component when you want a tightly-typed cartesian surface.
 */
export interface IChartCartesianProps extends IChartBaseProps {
    /** Cartesian visualisation primitive. Default `'line'`. */
    type?: TChartCartesianKind
    /**
     * Stack series on top of each other. Applies to `bar`,
     * `column`, and (when combined) `area`. Default `false`.
     */
    stacked?: boolean
    /**
     * Stacking mode when `stacked=true`.
     *
     * - `'normal'`  — raw absolute values (default).
     * - `'percent'` — every stack normalised to 100 %; Y-axis fixed
     *                 `0 → 100`, tick labels use `${v}%`.
     */
    stacking?: TChartStacking
    /**
     * Smoothing strategy for `line` / `area` / `spline`.
     * Default `'none'` for `line` / `area`, `'monotone'` for
     * `spline` (overridable).
     */
    smoothing?: TChartSmoothing
    /** Override the auto-computed Y min. */
    yMin?: number
    /** Override the auto-computed Y max. */
    yMax?: number
    /** Render grid lines behind the plot. Default `true`. */
    showGrid?: boolean
    /** Render X / Y axes + tick labels. Default `true`. */
    showAxis?: boolean
    /** Toggle the hover tooltip. Default `true`. */
    showTooltip?: boolean
    /** Formatter applied to X-axis tick labels. */
    xAxisFormat?: (value: string | number) => string
    /** Formatter applied to Y-axis tick labels. */
    yAxisFormat?: (value: number) => string
    /**
     * Configuration for the secondary (right-hand) Y axis. When
     * provided, series with `yAxis: 1` are projected against this
     * scale. The axis is only rendered when at least one visible
     * series uses `yAxis: 1` OR when this prop is explicitly set.
     */
    secondaryYAxis?: IChartSecondaryYAxis
    /**
     * Coloured rectangular zones drawn behind (or above) the chart
     * data. Cartesian-only. Bands with `layer='below'` (default)
     * are drawn before the series paths; `layer='above'` after.
     */
    plotBands?: Array<IChartPlotBand>
    /**
     * Threshold lines drawn at a fixed axis value. Cartesian-only.
     * Lines default to `layer='above'` so they remain visible over
     * data; set `layer='below'` to draw them behind.
     */
    plotLines?: Array<IChartPlotLine>
    /**
     * Drilldown configuration. When provided, data points that carry
     * an `IChartDrilldownLink` in their object-form entry trigger a
     * chart-level navigation instead of (or alongside) `point-click`.
     * A breadcrumb `<nav>` appears above the chart when depth > 1.
     */
    drilldown?: IChartDrilldownProps
    /**
     * Enable zoom / pan interactions on the plot area.
     *
     * - Mouse-down + drag → draws a selection rectangle; release zooms
     *   to that X range.
     * - Shift + scroll-wheel → zooms in / out around the cursor X.
     * - Ctrl + drag → pans left / right.
     * - A "Reset zoom" button appears in the top-right when zoomed.
     *
     * Default `false`.
     */
    zoomable?: boolean
    /**
     * Optional band-style range-selector toolbar rendered above the chart.
     * Provides preset zoom buttons (`1w`, `1m`, `3m`, `6m`, `1y`, `all`).
     * Requires `zoomable` to be `true` for full effect but can be used
     * independently to set an initial window via `selected`.
     */
    rangeSelector?: IChartRangeSelector
    /**
     * Overlay annotations drawn on top of the series layer. Annotations
     * are positioned in data coordinates and projected to SVG pixel space
     * at render time. Cartesian-only — non-cartesian chart families ignore
     * this prop.
     *
     * Four kinds: `'arrow'`, `'label'`, `'circle'`, `'bracket'`.
     */
    annotations?: Array<IChartAnnotation>
}

/** Emits surfaced by `<OrigamChartCartesian>`. Extends the family base with drilldown and zoom events. */
export interface IChartCartesianEmits extends IChartBaseEmits {
    /** Fired when the user drills into a sub-dataset. */
    (e: 'drill', link: IChartDrilldownLink, point: IChartPoint): void
    /** Fired when the user navigates back one drilldown level. */
    (e: 'drill-up'): void
    /**
     * Fired on every committed zoom (drag-release, wheel stop, or range-selector
     * button click). `start` and `end` are category indices (inclusive).
     */
    (e: 'zoom', range: { start: number, end: number }): void
    /** Fired when the user resets the zoom to the full data range. */
    (e: 'reset-zoom'): void
}

/** Slot signatures exposed by `<OrigamChartCartesian>`. */
export type IChartCartesianSlots = IChartBaseSlots
