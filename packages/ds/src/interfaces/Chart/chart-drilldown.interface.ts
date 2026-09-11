import type { IChartSeries } from './chart-series.interface'

/**
 * Reference attached to a data point that signals a drilldown is
 * available. When the user clicks a point that carries this link,
 * the chart looks up the matching `IChartDrilldownDataset` by `id`
 * and re-renders with the sub-dataset.
 */
export interface IChartDrilldownLink {
    /** Identifier used to look up the matching dataset in `IChartDrilldownProps.datasets`. */
    id: string
    /** Display name shown in the breadcrumb trail for this level. */
    name?: string
}

/**
 * A named sub-dataset associated with a drilldown level. The chart
 * swaps its active series + categories with these values when the
 * user drills in to this entry.
 */
export interface IChartDrilldownDataset {
    /** Unique identifier — must match `IChartDrilldownLink.id` on the parent point. */
    id: string
    /** Human-readable name shown in the breadcrumb trail. */
    name: string
    /** Series rendered when this dataset is active. */
    series: Array<IChartSeries>
    /**
     * X-axis category labels for the sub-dataset. When absent the
     * chart falls back to numeric indices.
     */
    categories?: Array<string>
}

/**
 * Chart-level prop that wires up the drilldown feature. Pass this to
 * `drilldown` on `<OrigamChartCartesian>` or `<OrigamChartPolar>`.
 */
export interface IChartDrilldownProps {
    /**
     * Bank of named sub-datasets. Looked up by
     * `IChartDrilldownLink.id` on point-click.
     */
    datasets: Array<IChartDrilldownDataset>
    /**
     * Localized label rendered on the "Back" button / first breadcrumb
     * segment. Default `'← Back'`.
     */
    backLabel?: string
}

/**
 * One frame in the navigation stack maintained internally by the chart.
 * The root frame is pushed on mount; each drill-in pushes an additional
 * frame; "Back" pops the top frame.
 */
export interface IChartDrilldownFrame {
    /** Display name for this level (used in the breadcrumb). */
    name: string
    /** Series rendered at this level. */
    series: Array<IChartSeries>
    /** Category labels at this level. */
    categories: Array<string>
}
