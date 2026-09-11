import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint } from '../../interfaces'

import type { TChartLegendPosition, TIntent } from '../../types'

/**
 * Props for `<OrigamChartHeatmap>` — the rectangular heatmap family.
 *
 * Renders a grid of `<rect>` cells where each cell is coloured by
 * its `value` relative to the min/max of the dataset. Common uses:
 * GitHub-style activity grids, correlation matrices, weekday × hour
 * patterns.
 *
 * `series[0]` is the only consumed series. Each datum must supply
 * `x` (column key), `y` (row key) and a numeric `value`.
 */
export interface IChartHeatmapProps extends IChartBaseProps {
    /**
     * Explicit X-axis category ordering. When omitted, unique `x`
     * values from the dataset are sorted alphabetically / numerically.
     */
    xCategories?: Array<string>
    /**
     * Explicit Y-axis category ordering. When omitted, unique `y`
     * values from the dataset are sorted alphabetically / numerically.
     */
    yCategories?: Array<string>
    /**
     * Two-stop colour range used to interpolate cell colour.
     * First entry = min value colour, second = max value colour.
     * Accepts intent tokens or raw CSS colour strings.
     * Default `['info', 'danger']`.
     */
    colorRange?: [TIntent | string, TIntent | string]
    /**
     * Gap between cells in SVG user units. Default `2`.
     */
    cellGap?: number
    /**
     * Render the numeric value centred inside each cell when the
     * cell is wide/tall enough to accommodate it. Default `true`.
     */
    showLabel?: boolean
    /**
     * Render X and Y axis category labels along the grid edges.
     * Default `true`.
     */
    showAxis?: boolean
    /**
     * Gradient legend bar with min / max labels.
     * Default `true`.
     */
    showGradientLegend?: boolean
    /**
     * Anchor of the gradient legend. Default `'bottom'`.
     */
    legendPosition?: TChartLegendPosition
    /**
     * X-axis category label formatter. Applied to each column label.
     * When omitted, the raw string / number is displayed.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Y-axis / value formatter. Applied to row labels AND to
     * the min/max labels on the gradient legend.
     * When omitted, the raw number is displayed.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartHeatmap>`. Mirrors the base family. */
export type IChartHeatmapEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartHeatmap>`. */
export interface IChartHeatmapSlots extends IChartBaseSlots {
    /**
     * Replace the tooltip body for a hovered cell.
     * Receives the hovered point, its resolved colour, and
     * the formatted x / y / value strings.
     */
    tooltip?: (bindings: {
        point: IChartPoint
        color: string
        xLabel: string
        yLabel: string
        value: number
    }) => any
}

/**
 * Single datum shape consumed from `series[0].data`.
 * Each entry represents one cell in the heatmap grid.
 */
export interface IChartHeatmapDatum {
    /** Column key — maps to an X-axis category. */
    x: number | string
    /** Row key — maps to a Y-axis category. */
    y: number | string
    /** Numeric value driving the cell colour. */
    value: number
}

/**
 * Pre-computed cell descriptor produced by the heatmap geometry engine.
 * Contains every pre-computed value needed to render one `<rect>`,
 * its label, and tooltip / accessibility content.
 */
export interface IChartHeatmapCell {
    /** Original index of the datum in `series[0].data`. */
    index: number
    /** Column category string. */
    xCat: string
    /** Row category string. */
    yCat: string
    /** Raw numeric value. */
    value: number
    /** Resolved CSS colour string for the cell fill. */
    color: string
    /** SVG x position (left edge of the rect). */
    rx: number
    /** SVG y position (top edge of the rect). */
    ry: number
    /** Cell width in SVG user units. */
    rw: number
    /** Cell height in SVG user units. */
    rh: number
    /** Centre X for the value label text. */
    labelX: number
    /** Centre Y for the value label text. */
    labelY: number
    /** `true` when the cell is tall / wide enough to show the label. */
    labelFits: boolean
    /** Whether this cell is currently visible. */
    visible: boolean
}
