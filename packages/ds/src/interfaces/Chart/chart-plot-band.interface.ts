import type { TIntent } from '../../types'

/**
 * A coloured rectangular zone drawn behind (or above) chart data,
 * spanning a numeric range along either the X or Y axis.
 * Cartesian-family only — not applicable to polar / radar / gauge.
 */
export interface IChartPlotBand {
    /**
     * Axis the band spans. `'y'` shades a horizontal stripe;
     * `'x'` shades a vertical stripe. Default `'y'`.
     */
    axis?: 'x' | 'y'
    /** Lower bound in axis units. String when `axis='x'` and categories are strings. */
    from: number | string
    /** Upper bound in axis units. */
    to: number | string
    /**
     * Fill colour. Accepts a `TIntent` token name or any CSS colour string.
     * Default resolves to the `warning` intent bg token.
     */
    color?: TIntent | string
    /** Fill opacity in the 0..1 range. Default `0.15`. */
    opacity?: number
    /** Optional label rendered centred inside the band. */
    label?: string
    /** Label fill colour. Accepts a `TIntent` token or CSS colour. Default `'currentColor'`. */
    labelColor?: TIntent | string
    /**
     * Z-order relative to chart data.
     * - `'below'` (default) — drawn behind series paths / bars / points.
     * - `'above'` — drawn on top of data.
     */
    layer?: 'below' | 'above'
}
