import type {
    IBgColorProps,
    IChartPoint,
    IChartSeries,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITypographyProps
} from '../../interfaces'

import type {
    TChartLegendPosition,
    TIntent
} from '../../types'

/**
 * Props shared across every chart type. Per-type components
 * (`OrigamChartBar`, `OrigamChartLine`, `OrigamChartPie`, …) extend
 * this surface and layer their type-specific options on top
 * (`stacked` for bar/column, `smoothing` for line/area,
 * `donutHoleSize` for donut, etc.).
 *
 * The legacy `<OrigamChart>` (the universal variant-based component)
 * stays available for advanced consumers — it uses `IChartProps`
 * which is `IChartBaseProps + type + all type-specific options`.
 */
export interface IChartBaseProps
    extends ICommonsComponentProps,
        IDimensionProps,
        IMarginProps,
        IPaddingProps,
        IRoundedProps,
        IElevationProps,
        IBgColorProps,
        Pick<ITypographyProps, 'fontSize' | 'fontWeight'> {
    /** Data series — one or more. Empty array renders the `#empty` slot. */
    series: Array<IChartSeries>
    /**
     * X axis labels (for line/area/bar/column/radar). Length should
     * match the longest series; missing entries fall back to the
     * numeric index. Ignored for pie / donut / scatter.
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
     * Animate paths / bars / slices on first paint and on data
     * changes. Respects `prefers-reduced-motion`. Default `true`.
     */
    animated?: boolean
    /** Animation duration in ms. Default `600`. */
    animationDuration?: number
    /**
     * Palette used when a series does not pin its own `color`.
     * Pass intent strings (cycled in order) or raw CSS colours.
     * Default cycles through the 8 origam intents.
     */
    colorScheme?: Array<TIntent | string>
    /**
     * CSS `aspect-ratio` shortcut (`'16/9'`, `'4/3'`, `'1/1'`…). When
     * set, overrides `height` and lets the chart breathe with the
     * container width.
     */
    aspectRatio?: string
}

/**
 * Emits surfaced by every per-type chart component. Identical to
 * `IChartEmits` from the universal `<OrigamChart>` — the wrapper
 * components forward verbatim.
 */
export interface IChartBaseEmits {
    /** Mouse / keyboard activation on a data point. */
    (e: 'point-click', point: IChartPoint, originalEvent: MouseEvent | KeyboardEvent): void
    /** Click on a legend entry — pair with `series-toggle` for state. */
    (e: 'legend-click', series: IChartSeries, index: number): void
    /** Resulting visibility flip after a legend click. */
    (e: 'series-toggle', series: IChartSeries, visible: boolean): void
}

/**
 * Slot signatures shared across every per-type chart component.
 * Identical to `IChartSlots` from the universal `<OrigamChart>`.
 */
export interface IChartBaseSlots {
    /**
     * Replace the default tooltip body.
     * Sub-chart interfaces extend this with a narrower binding signature;
     * the parameter is typed `any` here so those overrides satisfy the
     * TypeScript function-parameter assignability check (TS2430).
     */
    tooltip?: (bindings: any) => any
    /** Replace one legend entry. */
    'legend-item'?: (bindings: { series: IChartSeries, index: number, visible: boolean }) => any
    /** Replace the title block (title + subtitle). */
    title?: () => any
    /** Render when `series` is empty / every series is hidden. */
    empty?: () => any
}
