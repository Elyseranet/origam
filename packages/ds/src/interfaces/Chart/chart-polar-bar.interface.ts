import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint } from '../../interfaces'

/**
 * Props for `<OrigamChartPolarBar>` — the polar bar (nightingale-rose) family.
 *
 * A single series of N data points is rendered as N wedge-shaped arcs
 * arranged radially around a common centre. Each wedge occupies an equal
 * angular slice; its outer radius is proportional to its value relative to
 * the maximum in the series (or `maxValue` when overridden).
 *
 * Commonly used for cyclical data (e.g., hours per day of week, monthly
 * activity) where the equal-angle / variable-radius encoding communicates
 * relative magnitude more intuitively than a linear bar chart.
 */
export interface IChartPolarBarProps extends IChartBaseProps {
    /**
     * Fraction of the total radius reserved as a centre hole.
     * `0` = no hole (wedges meet at the centre point).
     * `1` = zero-thickness ring.
     * Default `0.1`.
     */
    innerRadius?: number
    /**
     * Start angle in radians for the first wedge.
     * `0` = 3 o'clock (standard mathematical).
     * `-Math.PI / 2` = 12 o'clock (conventional chart orientation).
     * Default `0`.
     */
    startAngle?: number
    /**
     * Angular gap between consecutive wedges in radians.
     * `0` = no gap (wedges are flush).
     * Default `0.02`.
     */
    gap?: number
    /**
     * Override the auto-computed maximum value used to scale wedge radii.
     * When omitted, `max(series[0].data)` is used.
     */
    maxValue?: number
    /**
     * Render the category label outside the outer radius of each wedge.
     * Default `true`.
     */
    showLabel?: boolean
    /**
     * Render the numeric value label inside the wedge when there is
     * sufficient angular room. Default `false`.
     */
    showValue?: boolean
    /**
     * Formatter applied to the tooltip X label (category name / index).
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Formatter applied to the tooltip Y value and the in-wedge value label.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartPolarBar>`. Mirrors the base family. */
export type IChartPolarBarEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartPolarBar>`. */
export interface IChartPolarBarSlots extends IChartBaseSlots {
    /**
     * Replace the default tooltip body. Receives the standard bindings
     * plus the pre-computed percentage string for this wedge.
     */
    tooltip?: (bindings: {
        point: IChartPoint
        category: string | number
        percentage: string
    }) => any
}

/**
 * Single wedge descriptor produced by the polar-bar geometry engine.
 * Exposes the pre-computed SVG `<path d="…">` for the arc, label anchor
 * position, and all data needed to render accessibility text and tooltip
 * content.
 */
export interface IChartPolarBarWedge {
    /** Wedge index in the original data array. */
    index: number
    /** SVG `<path d="…">` for the annular wedge shape. */
    d: string
    /** Resolved CSS colour string (intended for `:style="{ fill: … }"`). */
    color: string
    /** Category label. */
    category: string
    /** Raw numeric value. */
    value: number
    /** Pre-formatted value string (via `yAxisFormat` or `String(value)`). */
    formatted: string
    /** Whether this wedge is currently visible (legend toggle). */
    visible: boolean
    /** Computed outer radius for this wedge. */
    outerR: number
    /** Fixed inner radius (shared across all wedges). */
    innerR: number
    /** Start angle (radians). */
    startAngle: number
    /** End angle (radians). */
    endAngle: number
    /** Midpoint angle used for label placement. */
    midAngle: number
    /** X coordinate of the category label anchor. */
    labelX: number
    /** Y coordinate of the category label anchor. */
    labelY: number
    /** SVG `text-anchor` for the category label. */
    labelAnchor: 'start' | 'middle' | 'end'
    /** Percentage of total as a formatted string (e.g. `"23.4%"`). */
    percentage: string
    /** Whether the wedge is wide enough to host a value label inside. */
    showValueLabel: boolean
    /** X coordinate of the in-wedge value label. */
    valueLabelX: number
    /** Y coordinate of the in-wedge value label. */
    valueLabelY: number
}
