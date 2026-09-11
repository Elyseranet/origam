import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint, IChartSeries } from '../../interfaces'

import type { TChartStreamgraphOffset } from '../../types'

/**
 * Props for `<OrigamChartStreamgraph>` — the streamgraph family.
 *
 * Multiple series are rendered as continuous flowing ribbons stacked
 * over time (X axis). The baseline is computed from `offsetMode`:
 *
 * - `'wiggle'`     — Byron-Wattenberg wiggle algorithm: centered
 *                    baseline that minimises the total slope change.
 *                    This is the canonical streamgraph layout.
 * - `'silhouette'` — centered baseline at half of the total stack.
 * - `'expand'`     — normalised so the total fills 100% of the plot
 *                    height at every X position.
 * - `'zero'`       — traditional stacked area with baseline at 0.
 */
export interface IChartStreamgraphProps extends IChartBaseProps {
    /**
     * Baseline offset algorithm. Default `'wiggle'`.
     */
    offsetMode?: TChartStreamgraphOffset
    /**
     * Path interpolation. `'curve'` applies Catmull-Rom smoothing
     * on each ribbon's top and bottom polylines. `'none'` uses
     * straight linear segments. Default `'curve'`.
     */
    smoothing?: 'none' | 'curve'
    /**
     * Toggle the X / Y axis guides. Default `true`.
     */
    showAxis?: boolean
    /**
     * Toggle background grid lines. Default `false`.
     */
    showGrid?: boolean
    /**
     * Formatter applied to each X-axis category label.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Formatter applied to Y-axis tick labels.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartStreamgraph>`. */
export type IChartStreamgraphEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartStreamgraph>`. */
export interface IChartStreamgraphSlots extends IChartBaseSlots {
    /**
     * Custom tooltip body. Receives every visible series value at
     * the hovered X position so consumers can render a multi-series
     * breakdown row.
     */
    tooltip?: (bindings: {
        point: IChartPoint | null
        series: IChartSeries | null
        category: string | number
        allPoints: Array<{ series: IChartSeries; value: number; color: string }>
    }) => any
}

/**
 * Pre-computed ribbon descriptor produced by the streamgraph
 * geometry engine for a single series at a single render pass.
 */
export interface IChartStreamgraphRibbon {
    /** Series index in the original `series` array. */
    seriesIndex: number
    /** Display name from `series[i].name`. */
    name: string
    /** Resolved CSS colour for this ribbon. */
    color: string
    /** SVG `<path d="…">` — top forward + bottom reverse, closed. */
    d: string
    /** Whether this ribbon is currently toggled visible. */
    visible: boolean
    /** Raw data values at each X position for tooltip display. */
    values: Array<number>
}
