import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots } from '../../interfaces'

import type { TChartWordCloudRotation } from '../../types/Chart/chart-word-cloud-rotation.type'

/**
 * A single processed word datum used by the layout engine.
 * Computed from `IChartSeries.data` entries after sorting and font-size mapping.
 */
export interface IChartWordCloudDatum {
    /** Display text of the word. */
    text: string
    /** Raw numeric value driving the font size. */
    value: number
    /** Resolved CSS color string for the fill. */
    color: string
}

/**
 * Internal word descriptor after geometry placement.
 * Extends `IChartWordCloudDatum` with layout coordinates.
 */
export interface IChartWordCloudWord extends IChartWordCloudDatum {
    /** Computed font size in px. */
    fontSize: number
    /** Horizontal centre of the word in SVG coordinates. */
    x: number
    /** Vertical centre of the word in SVG coordinates. */
    y: number
    /** Rotation angle in degrees. */
    angle: number
    /** Original index in the sorted data array. */
    index: number
    /** Estimated bounding box width (used for collision detection). */
    width: number
    /** Estimated bounding box height (used for collision detection). */
    height: number
}

/**
 * Props for `<OrigamChartWordCloud>`.
 *
 * Reads `series[0]`. Each datum in `series[0].data` must be either a
 * `{ text, value, color? }` object or a plain number (ignored — use
 * object form for word clouds).
 */
// WordCloud owns domain `fontWeight` (number | string — the weight of the
// rendered WORDS), which collides with the chart-header typography
// `fontWeight: TFontWeight` inherited from IChartBaseProps. Omit the inherited
// one so the word-rendering prop wins; WordCloud's title/subtitle keep their
// theme weight (header fontSize still applies via the inherited prop).
export interface IChartWordCloudProps extends Omit<IChartBaseProps, 'fontWeight'> {
    /**
     * Minimum font size in px applied to the word with the lowest value.
     * Default `12`.
     */
    minFontSize?: number
    /**
     * Maximum font size in px applied to the word with the highest value.
     * Default `64`.
     */
    maxFontSize?: number
    /**
     * Word rotation strategy.
     * - `'none'`       — all words horizontal (default).
     * - `'random'`     — uniform random in [-30°, 30°].
     * - `'orthogonal'` — 0° or 90° alternating by index parity.
     */
    rotation?: TChartWordCloudRotation
    /**
     * Font family applied to all words. Defaults to `'inherit'` so it
     * picks up the host page's typeface.
     */
    fontFamily?: string
    /**
     * Font weight applied to all words. Default `600`.
     */
    fontWeight?: number | string
    /**
     * X-axis / value formatter. Unused for word clouds; kept for API
     * symmetry with other chart families.
     */
    xAxisFormat?: (value: number | string) => string
    /**
     * Y-axis formatter applied to the value shown in the tooltip.
     * When omitted the raw number is displayed.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartWordCloud>`. Mirrors the base family. */
export type IChartWordCloudEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartWordCloud>`. */
export type IChartWordCloudSlots = IChartBaseSlots
