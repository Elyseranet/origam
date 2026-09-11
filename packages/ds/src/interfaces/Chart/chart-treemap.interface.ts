import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots } from '../../interfaces'

import type { TChartTreemapAlgorithm, TIntent } from '../../types'

/**
 * A single data item for the treemap's series.
 *
 * Extends the `{ name, value }` shape that the treemap reads from
 * `series[0].data`. The optional `color` overrides the palette entry for
 * this specific tile. `children` is reserved for a future nested /
 * drilldown mode and is **ignored in v1** — all rendering is flat.
 */
export interface IChartTreemapDatum {
    /** Tile display label. */
    name: string
    /** Numeric magnitude — drives tile area. Must be ≥ 0. */
    value: number
    /**
     * Optional per-tile colour override. Accepts a design-system intent
     * token (`TIntent`) or any raw CSS colour string.
     */
    color?: TIntent | string
    /**
     * Reserved for future nested / drilldown support. Currently unused;
     * v1 renders a flat single-level treemap only.
     */
    children?: Array<IChartTreemapDatum>
}

/**
 * Internal tile descriptor produced by the layout engine. All coordinates
 * are in SVG-user-unit space (the fixed `600 × 400` viewport).
 */
export interface IChartTreemapTile {
    /** Index in the original sorted data array. */
    index: number
    /** Unique key derived from the datum name — used in `v-for :key`. */
    key: string
    /** Display label. */
    name: string
    /** Raw numeric value. */
    value: number
    /** Pre-formatted value string (after applying `yAxisFormat` if present). */
    formatted: string
    /** Resolved CSS colour string. */
    color: string
    /** SVG x coordinate of the tile's top-left corner. */
    x: number
    /** SVG y coordinate of the tile's top-left corner. */
    y: number
    /** Tile width in SVG user units. */
    width: number
    /** Tile height in SVG user units. */
    height: number
    /** Whether the tile is currently visible (legend toggle). */
    visible: boolean
    /**
     * `true` when the tile is large enough to show the `name + value`
     * label inline (min 60 × 24 SVG px).
     */
    labelFits: boolean
}

/**
 * Props for `<OrigamChartTreemap>`.
 *
 * The component consumes `series[0]` only. Each item in
 * `series[0].data` becomes one tile, sized proportionally to its
 * `value`. Additional series are silently ignored.
 *
 * v1 renders a **flat, single-level** treemap. Nested children are
 * accepted in the data type for forward compatibility but are not
 * rendered.
 */
export interface IChartTreemapProps extends IChartBaseProps {
    /**
     * Layout algorithm.
     * - `'squarified'` — minimises tile aspect ratio (default).
     * - `'slice-dice'` — alternates horizontal / vertical slicing.
     * Default `'squarified'`.
     */
    algorithm?: TChartTreemapAlgorithm
    /**
     * Whether to render the `name` + `value` text inside each tile when
     * the tile is at least 60 × 24 SVG-px. Default `true`.
     */
    showLabel?: boolean
    /**
     * Formatter applied to the numeric value in tile labels and
     * the tooltip. When absent the raw number is stringified.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartTreemap>`. Mirrors the base family. */
export type IChartTreemapEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartTreemap>`. */
export interface IChartTreemapSlots extends IChartBaseSlots {
    /**
     * Replace the label rendered inside each tile.
     * Receives the tile descriptor for full customisation.
     */
    'tile-label'?: (bindings: {
        name: string
        value: number
        formatted: string
        color: string
        index: number
        visible: boolean
    }) => any
}
