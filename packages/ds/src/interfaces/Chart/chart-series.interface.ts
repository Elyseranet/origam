import type {
    TChartType,
    TIntent
} from '../../types'

import type { IChartDrilldownLink } from './chart-drilldown.interface'

/**
 * A single data series rendered by `<OrigamChart>`. The `data`
 * accepts two shapes:
 *
 * - **Number array** — values are positioned along the X axis using
 *   the matching index in `categories`. Easiest form for time-bucket
 *   charts (sales per month).
 * - **Object array** — explicit `{x, y}` coordinates. Required for
 *   `scatter` (no implicit X axis) and useful for sparse data
 *   (`x` jumps from 1 to 5 without intermediate values).
 *
 * Each series can override the global colour palette via `color`
 * (intent name OR raw CSS string) and the global chart `type` via
 * `type` (mix-chart — a column with a `line` overlaid).
 */
export interface IChartSeries {
    /** Display name in the legend + screen-reader description. */
    name: string

    /**
     * Series data. Numbers are aligned to `categories[index]`.
     * Objects carry their own X coordinate (numeric or category
     * string), useful for scatter and irregular sampling.
     */
    data: Array<number> | Array<IChartSeriesPoint>

    /**
     * Intent token (`primary`, `success`, …) or raw CSS colour
     * (`#ff0080`, `rgb(…)`). When absent, the chart pulls the
     * next colour from `colorScheme` cycling by series index.
     */
    color?: TIntent | string

    /**
     * Whether the series is currently visible. Driven from the
     * legend click (`legend-click` → `series-toggle`). Default
     * `true`.
     */
    visible?: boolean

    /**
     * Override the chart-level `type` for this series only.
     * Enables mix charts (a `column` chart with a `line`
     * overlay on top).
     */
    type?: TChartType

    /**
     * Which Y axis this series is mapped to.
     * `0` (default) = left primary axis, `1` = right secondary axis.
     * Only meaningful for cartesian chart families (line, area, bar,
     * column, scatter, spline, stepped-line). Ignored for pie, donut,
     * radar, and gauge.
     */
    yAxis?: 0 | 1
}

/**
 * Object form of a single data point in `IChartSeries.data`.
 * Used for scatter or any series where the X axis isn't a
 * simple `categories[index]`.
 */
export interface IChartSeriesPoint {
    /** X coordinate (numeric for scatter, string for categorical). */
    x: number | string
    /** Y value mapped to the vertical scale. */
    y: number
    /** Optional friendly label (overrides `x` in tooltips). */
    name?: string
    /**
     * Third dimension for `scatter` — turns the chart into a
     * bubble plot where the dot RADIUS scales with `z`. Useful
     * when each (x, y) coordinate carries an associated magnitude
     * (sample size, population, score, …). When absent the point
     * keeps the default fixed radius.
     */
    z?: number
    /**
     * Drilldown reference. When present and the chart has a matching
     * `IChartDrilldownDataset`, clicking this point replaces the chart
     * view with the sub-dataset.
     */
    drilldown?: IChartDrilldownLink
}
