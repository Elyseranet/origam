import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint, IChartSeries } from '../../interfaces'

import type { TIntent } from '../../types'

/**
 * Five-number summary + outlier list produced by `computeQuartiles`.
 * Exported so consumers can type the return value without importing
 * the util directly.
 */
export interface IBoxPlotStats {
	/** Minimum non-outlier value (lower whisker tip). */
	min: number
	/** First quartile (25th percentile). */
	q1: number
	/** Median (50th percentile). */
	median: number
	/** Third quartile (75th percentile). */
	q3: number
	/** Maximum non-outlier value (upper whisker tip). */
	max: number
	/** IQR = Q3 − Q1. */
	iqr: number
	/** Values outside the 1.5·IQR fences. */
	outliers: Array<number>
}

/**
 * Pre-aggregated datum — all five-number-summary values are provided
 * directly by the consumer. Outliers (values outside 1.5·IQR fences)
 * are supplied as an explicit array.
 */
export interface IChartBoxPlotDatum {
	/** Category label shown on the X axis. */
	category: string
	/** Minimum (lower fence or true min when no outliers). */
	min: number
	/** First quartile — Q1 (25th percentile). */
	q1: number
	/** Median — Q2 (50th percentile). */
	median: number
	/** Third quartile — Q3 (75th percentile). */
	q3: number
	/** Maximum (upper fence or true max when no outliers). */
	max: number
	/** Values lying outside the 1.5·IQR whisker fences. */
	outliers?: Array<number>
	/**
	 * Override colour for this datum. Intent token or raw CSS colour.
	 * When absent the category index cycles through `colorScheme`.
	 */
	color?: TIntent | string
}

/**
 * Raw-samples datum — the component derives the five-number summary
 * via Tukey's method (linear interpolation) and detects outliers
 * at the 1.5·IQR fence.
 */
export interface IChartBoxPlotRawDatum {
	/** Category label shown on the X axis. */
	category: string
	/**
	 * Array of individual observations. Must contain at least 4 values
	 * for meaningful quartile computation. Fewer values are handled
	 * gracefully: all map to the same min/q1/median/q3/max.
	 */
	samples: Array<number>
	/**
	 * Override colour for this datum. Intent token or raw CSS colour.
	 * When absent the category index cycles through `colorScheme`.
	 */
	color?: TIntent | string
}

/**
 * Internal box descriptor produced by the geometry engine for each
 * category slot. All coordinates are in SVG-space pixels.
 */
export interface IChartBoxPlotBox {
	/** Category index (position in the data array). */
	index: number
	/** Category label. */
	category: string
	/** Resolved five-number summary (already coerced to SVG Y coords). */
	stats: {
		min: number
		q1: number
		median: number
		q3: number
		max: number
	}
	/** Raw numeric five-number summary (data-space values). */
	rawStats: {
		min: number
		q1: number
		median: number
		q3: number
		max: number
	}
	/** IQR in data space. */
	iqr: number
	/** SVG Y coordinate for Q3 (top of box rect). */
	svgQ3: number
	/** SVG Y coordinate for Q1 (bottom of box rect). */
	svgQ1: number
	/** SVG Y coordinate for the median line. */
	svgMedian: number
	/** SVG Y coordinate for the upper whisker tip. */
	svgMax: number
	/** SVG Y coordinate for the lower whisker tip. */
	svgMin: number
	/** Pre-computed box rectangle height (|svgQ1 − svgQ3|) — avoids template-level Math.abs(). */
	boxHeight: number
	/** SVG X centre of the slot. */
	cx: number
	/** Half-width of the box rectangle. */
	halfBoxW: number
	/** Half-width of the whisker cap segment. */
	halfCapW: number
	/** Resolved CSS colour string. */
	color: string
	/** SVG Y coordinates + raw values of each outlier. */
	outliers: Array<{ svgY: number, value: number }>
	/** Whether this box is currently visible (legend toggle). */
	visible: boolean
}

/**
 * Props for `<OrigamChartBoxPlot>`.
 *
 * Box-and-whisker plot: renders one box per category showing the
 * five-number statistical summary (min / Q1 / median / Q3 / max)
 * plus optional outlier dots.
 *
 * Accepts two data shapes:
 * - **Pre-aggregated** (`IChartBoxPlotDatum`) — consumer supplies all
 *   five values and the outlier array.
 * - **Raw samples** (`IChartBoxPlotRawDatum`) — the component computes
 *   quartiles via Tukey's linear-interpolation method and derives the
 *   1.5·IQR whisker fences automatically.
 */
export interface IChartBoxPlotProps extends IChartBaseProps {
	/**
	 * Explicit category order. When absent the order is inferred from
	 * the first occurrence of each category in `series[0].data`.
	 */
	categories?: Array<string>
	/**
	 * Box width as a fraction of the per-category slot width.
	 * Range [0, 1]. Default `0.6`.
	 */
	boxWidth?: number
	/**
	 * Whisker cap width as a fraction of the per-category slot width.
	 * Range [0, 1]. Default `0.4`.
	 */
	whiskerCapWidth?: number
	/** Render outlier dots beyond the whisker fences. Default `true`. */
	showOutliers?: boolean
	/** Render X and Y axes. Default `true`. */
	showAxis?: boolean
	/** Render horizontal grid lines. Default `true`. */
	showGrid?: boolean
	/**
	 * Override the auto-computed Y-axis minimum.
	 * When absent the component uses `min(data) − 10 %` padding.
	 */
	yMin?: number
	/**
	 * Override the auto-computed Y-axis maximum.
	 * When absent the component uses `max(data) + 10 %` padding.
	 */
	yMax?: number
	/**
	 * Formatter applied to X-axis category labels.
	 * Default: identity (category string returned as-is).
	 */
	xAxisFormat?: (value: string | number) => string
	/**
	 * Formatter applied to Y-axis tick values.
	 * Default: `String(value)`.
	 */
	yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartBoxPlot>`. Mirrors the base chart emit family. */
export type IChartBoxPlotEmits = IChartBaseEmits

/**
 * Slot signatures exposed by `<OrigamChartBoxPlot>`.
 *
 * The `tooltip` slot receives the full five-number summary plus
 * IQR and outlier count so custom tooltip cards can surface all
 * statistical context.
 */
export interface IChartBoxPlotSlots extends IChartBaseSlots {
	/**
	 * Override the default tooltip card.
	 * Receives `point` (carries `x` = category, `y` = median),
	 * `series`, `category`, and the extended `box` descriptor.
	 */
	tooltip?: (bindings: {
		point: IChartPoint
		series: IChartSeries
		category: string | number
		box: IChartBoxPlotBox
	}) => any
}
