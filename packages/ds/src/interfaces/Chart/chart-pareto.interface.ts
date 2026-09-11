import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint } from '../../interfaces'

import type { TIntent } from '../../types'

/**
 * A single datum in the Pareto series.
 *
 * Encodes one category-value pair. The component auto-sorts descending
 * by value before rendering.
 */
export interface IChartParetoDatum {
    /** Category label shown on the X axis tick and in the tooltip. */
    category: string
    /**
     * Raw numeric value for this category.
     * e.g. defect count, cost, frequency.
     */
    value: number
}

/**
 * Pre-computed bar descriptor produced by the Pareto geometry engine.
 * Consumed by the template to render a single `<rect>` column.
 */
export interface IChartParetoBar {
    /** Index in the sorted data array (0 = highest value). */
    index: number
    /** Category label from the datum. */
    category: string
    /** Raw numeric value from the datum. */
    value: number
    /** Pre-formatted value string. */
    formattedValue: string
    /** Individual share of total (0–1). */
    share: number
    /** Cumulative percentage up to and including this bar (0–1). */
    cumulative: number
    /** Resolved CSS colour string (for `fill`). */
    color: string
    /** SVG X of the left edge of the bar. */
    x: number
    /** SVG Y of the top edge of the bar. */
    y: number
    /** Bar width in SVG pixels. */
    w: number
    /** Bar height in SVG pixels. */
    h: number
    /** X center of the bar — used for the X-axis tick label and cumulative line dot. */
    cx: number
    /** Y of the cumulative percentage dot on the right Y-axis scale. */
    dotY: number
}

/**
 * Props for `<OrigamChartPareto>`.
 *
 * A Pareto chart combines vertical columns (sorted descending by value)
 * with a cumulative percentage line overlaid on a secondary right Y-axis.
 *
 * Typical uses: quality control, root-cause analysis, 80/20 rule.
 *
 * `series[0].data` must be an array of `IChartParetoDatum`.
 */
export interface IChartParetoProps extends IChartBaseProps {
    /**
     * Colour of all columns. Accepts a `TIntent` token or any raw CSS
     * colour string. Default `'primary'`.
     */
    barColor?: TIntent | string
    /**
     * Colour of the cumulative percentage line. Accepts a `TIntent` token
     * or any raw CSS colour string. Default `'danger'`.
     */
    lineColor?: TIntent | string
    /**
     * Gap in SVG pixels between adjacent columns. Default `4`.
     */
    barGap?: number
    /**
     * Whether to render the cumulative percentage line. Default `true`.
     */
    showLine?: boolean
    /**
     * Whether to show a value label above each column. Default `false`.
     */
    showLabel?: boolean
    /**
     * Render X (category) and Y (value + percentage) axes. Default `true`.
     */
    showAxis?: boolean
    /**
     * Render horizontal grid lines aligned with Y-axis ticks. Default `true`.
     */
    showGrid?: boolean
    /**
     * Formatter applied to X-axis category tick labels.
     * When omitted the category string is shown as-is.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Formatter applied to the left Y-axis (value) tick labels.
     * When omitted the raw number is used.
     */
    yAxisFormat?: (value: number) => string
    /**
     * Formatter applied to the right Y-axis (cumulative %) tick labels.
     * Default formats as rounded integer percentage, e.g. `"80%"`.
     */
    cumulativeFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartPareto>`. Mirrors the base family. */
export type IChartParetoEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartPareto>`. */
export interface IChartParetoSlots extends IChartBaseSlots {
    /**
     * Custom tooltip content.
     * Receives the full bar descriptor so consumers can show share + cumulative.
     */
    tooltip?: (bindings: {
        point: IChartPoint
        category: string
        value: number
        formattedValue: string
        share: number
        cumulative: number
        color: string
    }) => any
}
