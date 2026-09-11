import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint, IChartSeries } from '../../interfaces'
import type { TChartPictorialDirection, TChartPictorialMode, TIntent } from '../../types'

/**
 * Props for `<OrigamChartPictorial>` — the pictorial / isotype family.
 *
 * Each data value is represented as a column of repeated SVG icons.
 * The number of filled icons = `Math.round(value / iconsPerUnit)`.
 * Background (empty) icons show the maximum capacity, making partial
 * fills immediately readable (e.g. "3 out of 4 customers recommend us").
 */
export interface IChartPictorialProps extends IChartBaseProps {
    /**
     * SVG `<path d="…">` string for the icon drawn in each slot.
     * Must fit a `viewBox="0 0 24 24"` coordinate system.
     * Default: person silhouette.
     */
    icon?: string
    /**
     * Colour applied to all filled icons. Accepts a `TIntent` name or
     * any raw CSS colour string. When omitted, colours cycle through
     * `colorScheme` by series index (first series → first colour, etc.).
     */
    iconColor?: TIntent | string
    /**
     * Colour painted on "background" icon slots that are not yet filled.
     * Default `'rgba(0,0,0,0.1)'`.
     */
    emptyIconColor?: string
    /**
     * How many data units one icon represents.
     * E.g. `iconsPerUnit=10` → a value of 65 renders 7 filled icons
     * (rounded). Default `1`.
     */
    iconsPerUnit?: number
    /**
     * Stacking direction.
     * - `'vertical'` — icons stacked bottom-to-top (traditional column).
     * - `'horizontal'` — icons stacked left-to-right.
     * Default `'vertical'`.
     */
    direction?: TChartPictorialDirection
    /**
     * Rendering mode.
     * - `'stack'` — classic isotype: rows of small repeated icons (default).
     * - `'fill'` — one large icon per category, clip-masked from the bottom
     *   up to the fill ratio, like a thermometer / glass fill effect.
     *   The unfilled portion shows the icon silhouette as a faint "shadow".
     */
    mode?: TChartPictorialMode
    /**
     * Display the raw value label above (vertical) or to the right
     * (horizontal) of each column. Default `true`.
     */
    showLabel?: boolean
    /**
     * Display the X-axis category labels. Default `true`.
     */
    showAxis?: boolean
    /**
     * X-axis / category label formatter. Identity by default.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Y-axis / value formatter. `String(value)` by default.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartPictorial>`. Mirrors the base family. */
export type IChartPictorialEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartPictorial>`. */
export interface IChartPictorialSlots extends IChartBaseSlots {
    /**
     * Replace the default tooltip card.
     * Receives the hovered point, its series and the resolved category label.
     * Mirrors `IChartBaseSlots.tooltip` for API consistency.
     */
    tooltip?: (bindings: {
        point: IChartPoint
        series: IChartSeries
        category: string | number
    }) => any
    /** Rendered when `series` is empty or has no data. */
    empty?: () => any
}

/**
 * One column descriptor produced by the pictorial geometry engine.
 * Holds pre-computed positions for background and filled icon grids.
 */
export interface IChartPictorialColumn {
    /** Series index (0-based). */
    seriesIndex: number
    /** Data index within the series. */
    dataIndex: number
    /** Category label (from `categories[dataIndex]` or fallback). */
    category: string
    /** Raw numeric value from `series[seriesIndex].data[dataIndex]`. */
    value: number
    /** Pre-formatted value string. */
    formatted: string
    /** Total icon slots in this column (background capacity). */
    totalSlots: number
    /** Number of filled icon slots. */
    filledSlots: number
    /** Resolved fill CSS colour string. */
    color: string
    /** X translation for the column group (SVG coordinate). */
    x: number
    /** Y translation for the column group (SVG coordinate). */
    y: number
    /** Computed icon size in SVG pixels. */
    iconSize: number
    /** Whether this column is currently visible (legend toggle). */
    visible: boolean
}
