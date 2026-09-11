import type { IChartTick } from '../../interfaces'

/**
 * Props for `<OrigamChartAxis>` — the cartesian-only axes + grid +
 * tick labels block. Extracted from the legacy `<OrigamChart>`
 * monolith so polar / radar / gauge families don't accidentally
 * inherit cartesian chrome (the historical "pie has axis lines"
 * bug).
 *
 * The component is a pure renderer: it expects pre-computed tick
 * arrays + plot corners from `useChart` and paints them. No data
 * coupling, no reactivity beyond its props.
 */
export interface IChartAxisProps {
    /**
     * Pixel coordinates of the plotting area's four corners.
     * Comes verbatim from `useChart().plot.value`.
     */
    plot: {
        x0: number
        y0: number
        x1: number
        y1: number
        cx: number
        cy: number
    }
    /** Tick descriptors for X + Y (primary left axis). Comes from `useChart().ticks.value`. */
    ticks: {
        x: Array<IChartTick>
        y: Array<IChartTick>
    }
    /**
     * Tick descriptors for the secondary right Y axis.
     * When provided, a second vertical axis is rendered on the
     * right edge of the plot area. Comes from
     * `useChart().secondaryTicks.value`.
     */
    secondaryYTicks?: Array<IChartTick>
    /**
     * Render the four-corner axis frame + tick labels. When `false`,
     * the component renders nothing (mirrors the legacy `showAxis`
     * prop on `<OrigamChart>`).
     */
    showAxis?: boolean
    /**
     * Render horizontal grid lines under the plot. When `false`,
     * no grid is drawn (mirrors the legacy `showGrid` prop).
     */
    showGrid?: boolean
    /**
     * Formatter applied to X-axis tick labels. Defaults to
     * `String(value)`.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Formatter applied to Y-axis tick labels. Defaults to
     * `String(value)`.
     */
    yAxisFormat?: (value: number) => string
    /**
     * Formatter applied to the secondary (right) Y-axis tick labels.
     * Falls back to `yAxisFormat`, then `String(value)`.
     */
    secondaryYAxisFormat?: (value: number) => string
}

/**
 * Configuration object for the secondary (right-hand) Y axis.
 * Passed as the `secondaryYAxis` prop on `<OrigamChartCartesian>`.
 */
export interface IChartSecondaryYAxis {
    /** Force the minimum value of the secondary Y scale. Auto-computed when absent. */
    min?: number
    /** Force the maximum value of the secondary Y scale. Auto-computed when absent. */
    max?: number
    /** Formatter applied to the right-axis tick labels. */
    format?: (value: number) => string
    /** Optional axis title rendered alongside the right axis. */
    title?: string
}
