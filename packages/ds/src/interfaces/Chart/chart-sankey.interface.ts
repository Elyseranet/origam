import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots } from '../../interfaces'

import type { TIntent } from '../../types'

/**
 * A single flow datum in the Sankey series.
 * `from` and `to` are node name strings — nodes are inferred
 * automatically from the full set of unique names.
 */
export interface IChartSankeyDatum {
    /** Source node name. */
    from: string
    /** Target node name. */
    to: string
    /** Flow magnitude. Must be ≥ 0. */
    value: number
    /**
     * Optional per-link colour override. Accepts a design-system intent
     * token (`TIntent`) or any raw CSS colour string. When absent the
     * source node's colour is used.
     */
    color?: TIntent | string
}

/**
 * Internal node descriptor produced by the Sankey layout engine.
 * All coordinates are in SVG-user-unit space.
 */
export interface IChartSankeyNode {
    /** Unique node name (inferred from `from` / `to` values). */
    name: string
    /** Column index (0-based topological depth). */
    column: number
    /** Total flow value (max of incoming and outgoing sums). */
    value: number
    /** Pre-formatted value string. */
    formatted: string
    /** Resolved CSS colour string. */
    color: string
    /** SVG x coordinate of the node rect's left edge. */
    x: number
    /** SVG y coordinate of the node rect's top edge. */
    y: number
    /** Node rect height in SVG user units, proportional to value. */
    height: number
    /** Accumulated outgoing y offset (used during link placement). */
    outgoingOffset: number
    /** Accumulated incoming y offset (used during link placement). */
    incomingOffset: number
}

/**
 * Internal link descriptor for each `IChartSankeyDatum` after layout.
 * Carries the rendered SVG path `d` attribute and visual metadata.
 */
export interface IChartSankeyLink {
    /** Index in the original data array. */
    index: number
    /** Source node name. */
    from: string
    /** Target node name. */
    to: string
    /** Raw numeric flow value. */
    value: number
    /** Pre-formatted value string. */
    formatted: string
    /** Rendered SVG cubic Bezier path string. */
    d: string
    /** Resolved CSS stroke colour string (defaults to source node color). */
    color: string
    /** Stroke width in SVG user units. */
    strokeWidth: number
}

/**
 * Props for `<OrigamChartSankey>`.
 *
 * The component consumes `series[0]` only. Each item in
 * `series[0].data` must conform to `IChartSankeyDatum` — a
 * `{ from, to, value }` triple. Nodes are inferred automatically
 * from the union of all `from` and `to` strings; columns are assigned
 * by topological depth (Kahn's algorithm).
 */
export interface IChartSankeyProps extends IChartBaseProps {
    /**
     * Width of each node rectangle in SVG pixels. Default `16`.
     */
    nodeWidth?: number
    /**
     * Minimum vertical gap between sibling nodes within the same column,
     * in SVG pixels. Default `8`.
     */
    nodePadding?: number
    /**
     * Opacity of the flow ribbons (links). Range [0, 1]. Default `0.4`.
     */
    linkOpacity?: number
    /**
     * Whether to render node labels. Left-column nodes are right-aligned
     * outside their rect; right-column nodes are left-aligned outside.
     * Default `true`.
     */
    showLabel?: boolean
    /**
     * X-axis / value formatter applied to node labels and tooltip values.
     * When omitted the raw number is displayed.
     */
    xAxisFormat?: (value: number | string) => string
    /**
     * Y-axis formatter — alias kept for API symmetry with other
     * families. Same as `xAxisFormat` for this geometry.
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartSankey>`. Mirrors the base family. */
export type IChartSankeyEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartSankey>`. */
export interface IChartSankeySlots extends IChartBaseSlots {
    /**
     * Replace the label rendered beside each node.
     */
    'node-label'?: (bindings: {
        name: string
        value: number
        formatted: string
        color: string
        column: number
    }) => any
}
