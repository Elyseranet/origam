import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint, IChartSeries } from '../../interfaces'

import type { TIntent } from '../../types'

/**
 * A single datum node in the sunburst tree.
 * Internal nodes may omit `value` — it will be computed from children.
 */
export interface IChartSunburstDatum {
    /** Display name for the node. */
    name: string
    /**
     * Numeric value. Optional for internal nodes: if absent the value
     * equals the sum of direct children.
     */
    value?: number
    /** Override colour for this specific node. */
    color?: TIntent | string
    /** Child nodes — forms the next ring outward. */
    children?: Array<IChartSunburstDatum>
}

/**
 * How the label for a node is rendered.
 * - `'inline'`  — centred horizontally inside the arc (wide arcs).
 * - `'rotated'` — rotated tangentially along the arc midpoint (narrow arcs).
 * - `'leader'`  — placed outside the chart with a leader line (very narrow arcs).
 */
export type TChartSunburstLabelMode = 'inline' | 'rotated' | 'leader'

/**
 * Fully-resolved node produced by the geometry engine. Every field is
 * definite — defaults / inherited values have been applied.
 */
export interface IChartSunburstNode {
    /** Unique path key (`"Root > Branch > Leaf"`). */
    id: string
    /** Display name (copy of `datum.name`). */
    name: string
    /** Resolved numeric value (sum of children when absent in datum). */
    value: number
    /** Tree depth; roots are 0. */
    depth: number
    /** Index within the root-level array (used for colour inheritance). */
    rootIndex: number
    /** Arc start angle in radians [0, 2π). */
    startAngle: number
    /** Arc end angle in radians (0, 2π]. */
    endAngle: number
    /** Inner ring radius for this node (SVG units). */
    innerR: number
    /** Outer ring radius for this node (SVG units). */
    outerR: number
    /** Pre-computed SVG `<path d="…">` for the arc segment. */
    d: string
    /** Resolved CSS colour string (intent var or raw). */
    color: string
    /** Whether this node is currently visible (legend toggle on root). */
    visible: boolean
    /** Full ancestor path string `"Root > Branch > Leaf"`. */
    path: string
    /** How the label for this node should be rendered. */
    labelMode: TChartSunburstLabelMode
}

/** Props for `<OrigamChartSunburst>`. */
export interface IChartSunburstProps extends Omit<IChartBaseProps, 'categories'> {
    /**
     * Proportion of the overall radius reserved for the centre hole.
     * `0` = full pie (no hole). `0.4` = deep donut.
     * Default `0.15`.
     */
    innerRadius?: number
    /**
     * Radial gap between consecutive rings in SVG pixels.
     * Default `1`.
     */
    ringPadding?: number
    /**
     * When `true`, arc labels are rendered for nodes whose angular
     * span is ≥ 0.1 rad. Default `true`.
     */
    showLabel?: boolean
    /**
     * Y-axis / tooltip value formatter. Receives the numeric value,
     * returns a display string. When omitted the raw number is used.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartSunburst>`. Mirrors the base family. */
export type IChartSunburstEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartSunburst>`. */
export interface IChartSunburstSlots extends IChartBaseSlots {
    /**
     * Replace the default tooltip body. Receives the hovered node plus
     * derived helpers.
     */
    tooltip?: (bindings: {
        point: IChartPoint | null
        series: IChartSeries | null
        category: string | number
        node: IChartSunburstNode | null
        path: string
    }) => any
}
