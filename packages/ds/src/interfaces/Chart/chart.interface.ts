import type {
    IBgColorProps,
    IChartAnnotation,
    IChartDrilldownProps,
    IChartPlotBand,
    IChartPlotLine,
    IChartPoint,
    IChartSecondaryYAxis,
    IChartSeries,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps
} from '../../interfaces'

import type {
    TChartLegendPosition,
    TChartSmoothing,
    TChartStacking,
    TChartType,
    TIntent
} from '../../types'

/**
 * Props accepted by `<OrigamChart>`. Single component for eight
 * visualisation primitives — the `type` prop selects the path
 * generator inside `useChart`. Defaults are inlined in the SFC via
 * `withDefaults(defineProps<IChartProps>(), { … })` per the
 * project's "literals-only" rule.
 */
export interface IChartProps
    extends ICommonsComponentProps,
        IDimensionProps,
        IMarginProps,
        IPaddingProps,
        IRoundedProps,
        IElevationProps,
        IBgColorProps {
    /** Visualisation primitive. Default `'line'`. */
    type?: TChartType
    /** Data series — one or more. Empty array renders the `#empty` slot. */
    series: Array<IChartSeries>
    /**
     * X axis labels (for line/area/bar/column/radar). Length should
     * match the longest series; missing entries fall back to the
     * numeric index.
     */
    categories?: Array<string>
    /** Optional title rendered above the plotting area. */
    title?: string
    /** Optional subtitle rendered below the title. */
    subtitle?: string
    /** Toggle the legend block. Default `true`. */
    showLegend?: boolean
    /** Anchor of the legend block. Default `'bottom'`. */
    legendPosition?: TChartLegendPosition
    /** Toggle the hover tooltip. Default `true`. */
    showTooltip?: boolean
    /**
     * Render grid lines behind the plot. Ignored for pie/donut/radar.
     * Default `true`.
     */
    showGrid?: boolean
    /** Render X / Y axes + tick labels. Ignored for pie/donut. Default `true`. */
    showAxis?: boolean
    /**
     * Animate paths / bars / slices on first paint and on data
     * changes. Respects `prefers-reduced-motion`. Default `true`.
     */
    animated?: boolean
    /** Animation duration in ms. Default `600`. */
    animationDuration?: number
    /** Stack series on `bar` / `column`. Default `false`. */
    stacked?: boolean
    /**
     * Stacking mode applied when `stacked=true`.
     *
     * - `'normal'`  — raw absolute values (default, matches pre-v2
     *                 `stacked=true` behaviour).
     * - `'percent'` — every stack is normalised to 100 %; Y-axis
     *                 fixed at `0 → 100`, tick labels use `${v}%`.
     */
    stacking?: TChartStacking
    /**
     * Inner-radius proportion for `donut`. `0` collapses to a pie,
     * `1` to a ring of zero thickness. Default `0.6` when
     * `type === 'donut'`, ignored otherwise.
     */
    donutHoleSize?: number
    /**
     * Palette used when a series does not pin its own `color`.
     * Pass intent strings (cycled in order) or raw CSS colours.
     * Default cycles through the 8 origam intents.
     */
    colorScheme?: Array<TIntent | string>
    /** Formatter applied to X-axis tick labels. */
    xAxisFormat?: (value: string | number) => string
    /** Formatter applied to Y-axis tick labels. */
    yAxisFormat?: (value: number) => string
    /**
     * CSS `aspect-ratio` shortcut (`'16/9'`, `'4/3'`, `'1/1'`…). When
     * set, overrides `height` and lets the chart breathe with the
     * container width.
     */
    aspectRatio?: string
    /**
     * Smoothing strategy for line/area. Default `'none'` —
     * Cartesian segments between points. `'curve'` uses cubic
     * Bezier with Catmull-Rom tangents.
     */
    smoothing?: TChartSmoothing
    /**
     * Override the auto-computed Y min. Useful when the data
     * starts well above zero and you want the visual baseline.
     */
    yMin?: number
    /** Override the auto-computed Y max. */
    yMax?: number
    /**
     * Lower bound of the gauge range. Ignored unless `type='gauge'`.
     * Default `0`.
     */
    gaugeMin?: number
    /**
     * Upper bound of the gauge range. Ignored unless `type='gauge'`.
     * Default `100`.
     */
    gaugeMax?: number
    /**
     * Optional unit appended to the gauge centre label
     * (e.g. `'%'`, `' km/h'`). Ignored unless `type='gauge'`.
     */
    gaugeUnit?: string
    /**
     * Coloured rectangular zones drawn behind (or above) the chart
     * data. Forwarded to `<OrigamChartCartesian>` only — ignored for
     * polar / radar / gauge families.
     */
    plotBands?: Array<IChartPlotBand>
    /**
     * Threshold lines drawn at a fixed axis value. Forwarded to
     * `<OrigamChartCartesian>` only — ignored for polar / radar / gauge.
     */
    plotLines?: Array<IChartPlotLine>
    /**
     * Overlay annotations drawn on top of the series layer. Forwarded to
     * `<OrigamChartCartesian>` only — ignored for polar / radar / gauge /
     * other non-cartesian families. Annotations are positioned in data
     * coordinates. Four kinds: `'arrow'`, `'label'`, `'circle'`, `'bracket'`.
     */
    annotations?: Array<IChartAnnotation>
    /**
     * Drilldown configuration forwarded to `<OrigamChartCartesian>` and
     * `<OrigamChartPolar>`. Ignored by other families (radar, gauge, …).
     */
    drilldown?: IChartDrilldownProps
    /**
     * Secondary (right-hand) Y axis configuration. Forwarded to
     * `<OrigamChartCartesian>` only — ignored for other families.
     * When absent the engine ignores `series.yAxis === 1` assignments.
     */
    secondaryYAxis?: IChartSecondaryYAxis
}

/**
 * Emits surfaced by `<OrigamChart>`. All payloads are plain
 * serialisable data (no DOM refs), so callers can forward to a
 * store / websocket / analytics layer without unwrapping.
 */
export interface IChartEmits {
    /** Mouse / keyboard activation on a data point. */
    (e: 'point-click', point: IChartPoint, originalEvent: MouseEvent | KeyboardEvent): void
    /** Click on a legend entry — pair with `series-toggle` for state. */
    (e: 'legend-click', series: IChartSeries, index: number): void
    /** Resulting visibility flip after a legend click. */
    (e: 'series-toggle', series: IChartSeries, visible: boolean): void
}

/**
 * Slot signatures. Replace the default tooltip card, legend
 * entry, title block, or empty state without losing the rest of
 * the chart chrome.
 */
export interface IChartSlots {
    /** Replace the default tooltip body. */
    tooltip?: (bindings: { point: IChartPoint, series: IChartSeries, category: string | number }) => any
    /** Replace one legend entry. */
    'legend-item'?: (bindings: { series: IChartSeries, index: number, visible: boolean }) => any
    /** Replace the title block (title + subtitle). */
    title?: () => any
    /** Render when `series` is empty / every series is hidden. */
    empty?: () => any
}

/**
 * Single tick rendered along an axis. `position` is the SVG
 * pixel coordinate, `label` the already-formatted string.
 */
export interface IChartTick {
    position: number
    label: string
    value: number | string
}

/**
 * Pair of pixel-mapping functions. Pure — produced from the data
 * range + viewBox size; safe to call from inside computeds.
 */
export interface IChartScales {
    x: (value: number | string, dataIndex?: number, categoryCount?: number) => number
    y: (value: number) => number
}

/**
 * Output of `useChart` — one path descriptor per series (per
 * data point for bar/column/scatter/pie). The component renders
 * each entry inside a `<g>` according to `kind`.
 */
export interface IChartPath {
    seriesIndex: number
    /**
     * SVG element kind to emit. `path` for line/area/pie/donut/
     * radar, `rect` for bar/column, `circle` for scatter +
     * line/area markers.
     */
    kind: 'path' | 'rect' | 'circle' | 'polygon'
    /** Pre-computed `d` attribute for `kind === 'path' | 'polygon'`. */
    d?: string
    /** Geometry for `kind === 'rect'`. */
    rect?: { x: number, y: number, width: number, height: number }
    /** Geometry for `kind === 'circle'`. */
    circle?: { cx: number, cy: number, r: number }
    /** Resolved CSS colour string. */
    color: string
    /** Original series reference (for tooltip / legend). */
    series: IChartSeries
    /** Optional data index when the path represents a single point. */
    dataIndex?: number
    /** Length of the path (used by stroke-dashoffset animation). */
    pathLength?: number
    /**
     * Sub-kind for `kind === 'path'`. Area charts emit two paths per
     * series — the filled area down to the baseline (`variant: 'fill'`)
     * and the overlaid stroke (`variant: 'stroke'`). The component reads
     * the variant to decide whether to paint `fill` or `stroke`.
     */
    variant?: 'fill' | 'stroke'
}

/**
 * Aggregated legend entry — one per series. Pre-resolved colour
 * so the legend doesn't have to re-look-up the palette.
 */
export interface IChartLegendItem {
    series: IChartSeries
    index: number
    color: string
    visible: boolean
}

/**
 * Strict, defaulted options consumed by `useChart`. The SFC
 * derives this from props via thunks so the composable stays
 * reactive without owning the prop reference.
 */
export interface IUseChartOptions {
    type: () => TChartType
    series: () => Array<IChartSeries>
    categories: () => Array<string>
    stacked: () => boolean
    /**
     * Stacking mode when `stacked()` is `true`. Optional — defaults
     * to `'normal'` so callers that don't expose the prop yet are
     * unaffected.
     */
    stacking?: () => TChartStacking
    donutHoleSize: () => number
    colorScheme: () => Array<TIntent | string>
    smoothing: () => TChartSmoothing
    yMin: () => number | undefined
    yMax: () => number | undefined
    width: () => number
    height: () => number
    padding: () => { top: number, right: number, bottom: number, left: number }
    /**
     * Per-label hidden set. Used by the single-pie / donut path to
     * skip slices whose category label was toggled OFF in the
     * legend. Cartesian / radar / gauge / multi-pie use `series.visible`
     * for the same purpose; this option exists for the pie/donut
     * "category as slice" mode where there's no per-slice series to
     * attach visibility to. Optional — defaults to an empty Set.
     */
    hiddenLabels?: () => Set<string>
    /**
     * Secondary (right-hand) Y axis configuration. Optional — when
     * absent the engine ignores `series.yAxis === 1` assignments and
     * plots everything against the primary left axis.
     */
    secondaryYAxis?: () => IChartSecondaryYAxis | undefined
}
