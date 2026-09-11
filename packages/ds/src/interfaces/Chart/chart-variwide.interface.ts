import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint } from '../../interfaces'

import type { TIntent } from '../../types'

/**
 * A single datum in the variwide series.
 *
 * Encodes two dimensions simultaneously:
 *   - `value`  → bar HEIGHT (primary metric, maps to Y axis)
 *   - `width`  → bar WIDTH  (secondary metric, proportional share of plot width)
 */
export interface IChartVariwideDatum {
    /** Category label shown on the X axis tick and in the tooltip. */
    category: string
    /**
     * Primary value — drives the bar HEIGHT via the Y scale.
     * e.g. GDP in trillions, revenue in M€, response time in ms.
     */
    value: number
    /**
     * Secondary value — drives the bar WIDTH proportionally
     * (`barPixels = plotWidth * width / Σwidths`).
     * e.g. population in M, number of requests, market share %.
     */
    width: number
    /**
     * Optional per-datum colour override. Accepts a `TIntent` token
     * or any raw CSS colour string. When omitted the chart cycles
     * through `colorScheme`.
     */
    color?: TIntent | string
}

/**
 * Pre-computed column descriptor produced by the variwide geometry
 * engine. Consumed by the template to render a single `<rect>`.
 */
export interface IChartVariwideColumn {
    /** Index in the original data array. */
    index: number
    /** Category label from the datum. */
    category: string
    /** Raw primary value. */
    value: number
    /** Raw secondary (width) value. */
    widthValue: number
    /** Pre-formatted value string (primary). */
    formattedValue: string
    /** Pre-formatted width string (secondary). */
    formattedWidth: string
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
    /** X center — used for the X-axis tick label. */
    cx: number
}

/**
 * Props for `<OrigamChartVariwide>`.
 *
 * A variwide chart encodes two metrics per category:
 *   - **height** represents the primary value (Y axis scale)
 *   - **width**  represents the secondary value (proportional share of the plot width)
 *
 * Typical uses: GDP × population, revenue × market share,
 * response time × request count.
 *
 * `series[0].data` must be an array of `IChartVariwideDatum`
 * (plain `number` items are accepted for compatibility but carry
 * no `width` information — they default to equal widths).
 */
export interface IChartVariwideProps extends IChartBaseProps {
    /**
     * Gap in SVG pixels between adjacent columns.
     * Default `2`.
     */
    barGap?: number
    /**
     * Show the value label above each column. Default `true`.
     */
    showLabel?: boolean
    /**
     * Render X (category) and Y (value) axes. Default `true`.
     */
    showAxis?: boolean
    /**
     * Render horizontal grid lines aligned with Y-axis ticks.
     * Default `true`.
     */
    showGrid?: boolean
    /**
     * Formatter applied to X-axis category tick labels.
     * When omitted the category string is shown as-is.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Formatter applied to Y-axis value tick labels and to the
     * primary-value display in tooltip and above-bar label.
     * When omitted the raw number is used.
     */
    yAxisFormat?: (value: number) => string
    /**
     * Override the auto-computed Y minimum.
     * Useful when the data starts well above zero.
     */
    yMin?: number
    /**
     * Override the auto-computed Y maximum.
     */
    yMax?: number
}

/** Emits surfaced by `<OrigamChartVariwide>`. Mirrors the base family. */
export type IChartVariwideEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartVariwide>`. */
export interface IChartVariwideSlots extends IChartBaseSlots {
    /**
     * Custom tooltip content.
     * Receives both encodings so consumers can format them freely.
     */
    tooltip?: (bindings: {
        point: IChartPoint
        category: string
        value: number
        widthValue: number
        formattedValue: string
        formattedWidth: string
        color: string
    }) => any
}
