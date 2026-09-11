import type { IChartBaseProps, IChartPoint, IChartSeries } from '../../interfaces'

import type { TChartSparklineKind } from '../../types'

import type { TIntent } from '../../types'

/**
 * Props for `<OrigamChartSparkline>` — the tiny inline-chart family.
 *
 * Sparklines are compact data visualizations designed for embedding in
 * table cells, KPI cards, and dashboards. They have no axes, no legend,
 * no grid by default — just the data shape at a glance.
 *
 * Only a single series is rendered. The `color` prop controls the
 * stroke / fill uniformly (no palette cycling).
 */
export interface IChartSparklineProps extends Omit<IChartBaseProps, 'series' | 'showLegend' | 'legendPosition' | 'colorScheme'> {
    /** Single data series. Data must be `Array<number>`. */
    series: Array<IChartSeries>

    /**
     * Rendering mode.
     * `'line'` — polyline connecting data points.
     * `'area'` — line with a translucent fill below.
     * `'column'` — vertical bars.
     * `'bar'` — horizontal bars.
     * Default `'line'`.
     */
    type?: TChartSparklineKind

    /**
     * Stroke / fill intent or raw CSS colour.
     * Default `'primary'`.
     */
    color?: TIntent | string

    /**
     * Stroke width for line and area modes (SVG pixels).
     * Default `1.5`.
     */
    lineWidth?: number

    /**
     * Render a filled circle marker at every data point.
     * Only meaningful for `'line'` and `'area'` modes.
     * Default `false`.
     */
    showMarkers?: boolean

    /**
     * Highlight the minimum value point in red.
     * Default `false`.
     */
    showMin?: boolean

    /**
     * Highlight the maximum value point in green.
     * Default `false`.
     */
    showMax?: boolean

    /**
     * Highlight the last data point in the primary colour.
     * Default `true`.
     */
    showLast?: boolean

    /**
     * Radius of highlighted marker circles (SVG pixels).
     * Default `2.5`.
     */
    markerSize?: number

    /**
     * CSS width of the sparkline container.
     * Accepts a number (px) or a CSS string (`'100%'`, `'8rem'`).
     * Default `120`.
     */
    width?: number | string

    /**
     * CSS height of the sparkline container.
     * Accepts a number (px) or a CSS string (`'100%'`, `'2rem'`).
     * Default `30`.
     */
    height?: number | string
}

/** Emits surfaced by `<OrigamChartSparkline>`. */
export interface IChartSparklineEmits {
    /** Mouse / keyboard activation on a data point. */
    (e: 'point-click', point: IChartPoint, originalEvent: MouseEvent | KeyboardEvent): void
}

/** Slot signatures exposed by `<OrigamChartSparkline>`. */
export interface IChartSparklineSlots {
    /** Replace the default tooltip body on hover. */
    tooltip?: (bindings: { point: IChartPoint, series: IChartSeries, index: number }) => any
    /** Render when `series` is empty or carries no data. */
    empty?: () => any
}

/**
 * Internal marker descriptor — a highlighted circle on the SVG.
 * Used for min / max / last indicator rendering.
 */
export interface IChartSparklineKind {
    /** SVG cx coordinate. */
    cx: number
    /** SVG cy coordinate. */
    cy: number
    /** Circle radius in SVG pixels. */
    r: number
    /** Resolved CSS fill colour. */
    fill: string
    /** Role of this marker (min / max / last). */
    role: 'min' | 'max' | 'last'
    /** Data index this marker corresponds to. */
    dataIndex: number
}
