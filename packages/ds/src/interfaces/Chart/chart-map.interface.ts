import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint, IChartSeries } from '../../interfaces'

import type { TChartMapMode } from '../../types/Chart/chart-map-mode.type'
import type { TIntent } from '../../types'

/**
 * A single choropleth data point keyed by ISO-3166-1 alpha-2 code.
 */
export interface IChartMapChoroplethDatum {
    /** ISO-3166-1 alpha-2 country code (e.g. `'FR'`, `'US'`). */
    code: string
    /** Numeric value used to drive the colour interpolation. */
    value: number
    /** Human-readable label. Defaults to `code` when omitted. */
    name?: string
}

/**
 * A single flight-route datum connecting two country centroids.
 */
export interface IChartMapRouteDatum {
    /** ISO-3166-1 alpha-2 code for the route origin. */
    from: string
    /** ISO-3166-1 alpha-2 code for the route destination. */
    to: string
    /** Optional flow weight — drives the stroke width via `Math.log(value + 1) * 1.5`. */
    value?: number
    /** Overrides `lineColor` for this route specifically. */
    color?: TIntent | string
}

/**
 * Internal country descriptor produced by the map geometry engine.
 * Holds the pre-resolved fill colour and ARIA metadata.
 */
export interface IChartMapCountry {
    /** ISO-3166-1 alpha-2 code. */
    code: string
    /** SVG `<path d="…">` string from `WORLD_MAP_PATHS`. */
    d: string
    /** Resolved CSS fill colour string. */
    fill: string
    /** Raw numeric value (undefined for countries not in the dataset). */
    value: number | undefined
    /** Display name (from datum or code fallback). */
    name: string
    /** Whether this country has data in the current series. */
    hasData: boolean
}

/**
 * Internal route descriptor produced by the map geometry engine.
 */
export interface IChartMapRoute {
    /** Zero-based index in the series data array. */
    index: number
    /** SVG quadratic Bezier path string: `M x1,y1 Q cx,cy x2,y2`. */
    d: string
    /** Resolved CSS stroke colour. */
    stroke: string
    /** Stroke width in SVG pixels. */
    strokeWidth: number
    /** Centroid [x, y] of the origin country. */
    fromPoint: [number, number]
    /** Centroid [x, y] of the destination country. */
    toPoint: [number, number]
    /** Origin country code. */
    from: string
    /** Destination country code. */
    to: string
    /** Optional flow value. */
    value: number | undefined
}

/**
 * Props for `<OrigamChartMap>`.
 *
 * Supports two rendering modes:
 *   - `'choropleth'` — country shapes coloured by a continuous value
 *     interpolated between two intent / CSS colour endpoints.
 *   - `'flight-routes'` — curved arcs between pairs of country centroids
 *     drawn over a neutral map backdrop.
 */
export interface IChartMapProps extends IChartBaseProps {
    /**
     * Rendering mode. Default `'choropleth'`.
     */
    mode?: TChartMapMode
    /**
     * Colour gradient endpoints for choropleth mode.
     * First colour = min value; second colour = max value.
     * Supports intent names and raw CSS strings.
     * Default `['info', 'danger']`.
     */
    colorRange?: [TIntent | string, TIntent | string]
    /**
     * Fill colour for countries that have no value in the dataset.
     * Default `'rgba(0,0,0,0.08)'`.
     */
    defaultCountryFill?: string
    /**
     * Stroke colour applied to all country path outlines.
     * Default `'rgba(0,0,0,0.2)'`.
     */
    borderColor?: string
    /**
     * Default stroke colour for flight-route arcs.
     * Overridden per route via `IChartMapRouteDatum.color`.
     * Default `'primary'`.
     */
    lineColor?: TIntent | string
    /**
     * Radius in SVG pixels of the endpoint circles on each route.
     * Default `4`.
     */
    nodeRadius?: number
    /**
     * Bezier control-point offset as a fraction of the chord length [0..1].
     * `0` = straight line; `0.3` = gentle arc (default); `0.5` = visible arc.
     */
    routeCurvature?: number
    /**
     * Y-axis value formatter used in tooltips and the choropleth legend.
     * When omitted, values are displayed as-is.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartMap>`. Mirrors the base family. */
export type IChartMapEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartMap>`. */
export interface IChartMapSlots extends IChartBaseSlots {
    /**
     * Replace the default tooltip body.
     * Receives the hovered point, series, and category label.
     */
    tooltip?: (bindings: { point: IChartPoint, series: IChartSeries, category: string | number }) => any
    /** Render when `series` is empty or has no renderable data. */
    empty?: () => any
}
