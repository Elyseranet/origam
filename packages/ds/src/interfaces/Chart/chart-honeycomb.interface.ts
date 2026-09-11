import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint } from '../../interfaces'

import type { TChartHoneycombColorMode, TChartHoneycombOrientation, TIntent } from '../../types'

/**
 * Props for `<OrigamChartHoneycomb>` — the hexagonal tile-map family.
 *
 * Renders a grid of hexagonal tiles positioned by column (`x`) and
 * row (`y`) index. Useful for categorical tile-maps (US states, periodic
 * table), heatmaps, or any data where spatial arrangement matters more
 * than a continuous axis.
 */
export interface IChartHoneycombProps extends IChartBaseProps {
    /**
     * Hex vertex orientation.
     * `'pointy-top'` — vertex at the top (default).
     * `'flat-top'` — flat edge at the top, vertex on the side.
     */
    orientation?: TChartHoneycombOrientation
    /**
     * Colour-mapping strategy.
     * `'categorical'` — each tile gets a colour from `colorScheme` or the intent cycle.
     * `'heatmap'` — `value` drives a gradient between `heatmapColorRange` endpoints.
     */
    colorMode?: TChartHoneycombColorMode
    /**
     * Two-stop colour range for `colorMode='heatmap'`.
     * First entry = min value colour, second = max value colour.
     * Accepts intent tokens or raw CSS colours.
     * Default `['info', 'danger']`.
     */
    heatmapColorRange?: [TIntent | string, TIntent | string]
    /**
     * Hex side-length in SVG user units. Controls tile size.
     * Default `30`.
     */
    tileSize?: number
    /**
     * Gap between adjacent tiles in SVG user units. Default `2`.
     */
    tileGap?: number
    /**
     * Render the tile's `name` (or `value` when `name` is absent)
     * as text centred in the tile. Default `true`.
     */
    showLabel?: boolean
    /**
     * X-axis / column formatter. Applied to the numeric `x` index
     * in tooltip / axis text. When omitted the raw number is used.
     */
    xAxisFormat?: (value: number | string) => string
    /**
     * Y-axis / row formatter. Applied to the numeric `y` index.
     * When omitted the raw number is used.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartHoneycomb>`. Mirrors the base family. */
export type IChartHoneycombEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartHoneycomb>`. */
export interface IChartHoneycombSlots extends IChartBaseSlots {
    /**
     * Replace the label rendered inside each tile.
     * Receives the tile's `name`, `value`, resolved `color`, and grid position.
     */
    'tile-label'?: (bindings: {
        name: string
        value: number | undefined
        color: string
        x: number
        y: number
        index: number
    }) => any
}

/**
 * Internal tile descriptor produced by the honeycomb geometry engine.
 * Contains every pre-computed value needed to render one `<polygon>`,
 * its label, and tooltip / accessibility content.
 */
export interface IChartHoneycombTile {
    /** Original index of the data point in `series[0].data`. */
    index: number
    /** Column index from `data[i].x`. */
    gridX: number
    /** Row index from `data[i].y`. */
    gridY: number
    /** SVG `points` attribute string for the `<polygon>`. */
    points: string
    /** Resolved CSS colour string. */
    color: string
    /** Tile label (name or formatted value). */
    label: string
    /** Raw `name` string from the data point. */
    name: string
    /** Raw `value` from the data point. */
    value: number | undefined
    /** Centre X in SVG user units. */
    cx: number
    /** Centre Y in SVG user units. */
    cy: number
    /** Whether this tile is currently visible (legend toggle). */
    visible: boolean
}

/**
 * Payload passed to `IChartPoint` for a hovered / clicked tile.
 * Exposes `x` = gridX, `y` = gridY for downstream consumers.
 */
export interface IChartHoneycombPoint extends IChartPoint {
    tileName: string
    tileValue: number | undefined
}
