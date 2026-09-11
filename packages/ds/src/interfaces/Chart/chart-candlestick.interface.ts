import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint } from '../../interfaces'

import type { TIntent } from '../../types'

/**
 * One OHLC data point in a candlestick series.
 *
 * `date` is used as the X-axis label. `open`, `high`, `low`, `close`
 * are the four price levels for the period. All four are required — a
 * datum missing any of them is silently skipped.
 */
export interface IChartCandlestickDatum {
    /** ISO date string or any human-readable label rendered on the X axis. */
    date: string
    /** Opening price of the period. */
    open: number
    /** Highest price of the period. */
    high: number
    /** Lowest price of the period. */
    low: number
    /** Closing price of the period. */
    close: number
}

/**
 * Props for `<OrigamChartCandlestick>` — the financial OHLC chart family.
 *
 * Renders one candlestick per datum: a rectangular body between `open`
 * and `close`, and a thin wick from `low` to `high`. Body fill follows
 * intent or raw CSS colour; bullish (close ≥ open) and bearish
 * (close < open) bodies use distinct colours.
 */
export interface IChartCandlestickProps extends Omit<IChartBaseProps, 'categories'> {
    /**
     * Chart height. Accepts a number (interpreted as `px`) or any valid
     * CSS length. Ignored when `aspectRatio` is set. Default `400`.
     */
    height?: number | string
    /**
     * Fill colour for bullish candles (close ≥ open). Accepts a `TIntent`
     * or any CSS colour string. Default `'success'`.
     */
    bullishColor?: TIntent | string
    /**
     * Fill colour for bearish candles (close < open). Accepts a `TIntent`
     * or any CSS colour string. Default `'danger'`.
     */
    bearishColor?: TIntent | string
    /**
     * Fraction of the per-slot width occupied by the candle body [0..1].
     * Default `0.6`.
     */
    candleWidth?: number
    /**
     * Wick stroke width in SVG user-units. Default `1`.
     */
    wickWidth?: number
    /**
     * Toggle the legend. Candlestick charts rarely need a legend — the
     * default is therefore `false`.
     */
    showLegend?: boolean
    /** Toggle the hover tooltip. Default `true`. */
    showTooltip?: boolean
    /** Render background grid lines. Default `true`. */
    showGrid?: boolean
    /** Render X / Y axes + tick labels. Default `true`. */
    showAxis?: boolean
    /**
     * Override the auto-computed Y axis minimum. When omitted the minimum
     * is derived from `min(low)` over all data with 5 % padding.
     */
    yMin?: number
    /**
     * Override the auto-computed Y axis maximum. When omitted the maximum
     * is derived from `max(high)` over all data with 5 % padding.
     */
    yMax?: number
    /** Formatter applied to X-axis (date) tick labels. */
    xAxisFormat?: (value: string | number) => string
    /** Formatter applied to Y-axis (price) tick labels. */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartCandlestick>`. Mirrors the base family. */
export type IChartCandlestickEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartCandlestick>`. */
export interface IChartCandlestickSlots extends IChartBaseSlots {
    /**
     * Replace the default tooltip card. Receives the usual `point` /
     * `series` / `category` bindings plus the full OHLC datum so the
     * custom slot can render change % and direction.
     */
    tooltip?: (bindings: {
        point: IChartPoint
        series: IChartBaseProps['series'][0]
        category: string | number
        datum: IChartCandlestickDatum
        change: number
        changePct: number
        isBullish: boolean
    }) => any
}

/**
 * Resolved per-candle descriptor produced by the geometry engine.
 * Every numeric field is expressed in SVG user-units.
 */
export interface IChartCandlestickCandle {
    /** Index in the data array. */
    index: number
    /** The raw OHLC datum. */
    datum: IChartCandlestickDatum
    /** Center X of the slot. */
    cx: number
    /** Body left X. */
    bodyX: number
    /** Body top Y (min of yOpen, yClose). */
    bodyY: number
    /** Body width in SVG-px. */
    bodyWidth: number
    /** Body height in SVG-px. */
    bodyHeight: number
    /** Wick top Y (yHigh). */
    wickTop: number
    /** Wick bottom Y (yLow). */
    wickBottom: number
    /** Resolved CSS colour string for the candle. */
    color: string
    /** `true` when close ≥ open. */
    isBullish: boolean
    /** Pre-computed change (close - open). */
    change: number
    /** Pre-computed percentage change. */
    changePct: number
}
