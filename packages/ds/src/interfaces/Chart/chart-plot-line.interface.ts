import type { TIntent } from '../../types'

/**
 * A single threshold line drawn at a fixed axis value, either
 * horizontally (Y-axis) or vertically (X-axis).
 * Cartesian-family only — not applicable to polar / radar / gauge.
 */
export interface IChartPlotLine {
    /**
     * Axis the line is perpendicular to. `'y'` draws a horizontal
     * line at a Y value; `'x'` draws a vertical line at an X value.
     * Default `'y'`.
     */
    axis?: 'x' | 'y'
    /** Position on the axis in axis units. String when `axis='x'` and categories are strings. */
    value: number | string
    /**
     * Stroke colour. Accepts a `TIntent` token name or any CSS colour string.
     * Default resolves to the `danger` intent bg token.
     */
    color?: TIntent | string
    /** Stroke width in SVG user units. Default `1.5`. */
    width?: number
    /** Dash pattern of the line. Default `'dashed'`. */
    dash?: 'solid' | 'dashed' | 'dotted'
    /** Optional label placed at the end of the line. */
    label?: string
    /**
     * Horizontal alignment of the label for Y-axis lines.
     * `'right'` (default) places the label at the right edge;
     * `'left'` at the left edge.
     */
    labelAlign?: 'left' | 'right'
    /**
     * Z-order relative to chart data.
     * - `'below'` — drawn behind series.
     * - `'above'` (default) — drawn on top of data so the line remains visible.
     */
    layer?: 'below' | 'above'
}
