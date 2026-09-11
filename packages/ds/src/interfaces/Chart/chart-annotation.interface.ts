import type { TIntent } from '../../types'

/**
 * A single overlay annotation drawn on top of a cartesian chart's
 * SVG surface. Annotations are positioned in data coordinates and
 * projected to pixel space by the chart's X/Y scales. They are
 * cartesian-only — polar, radar, gauge and other non-cartesian
 * families ignore this prop.
 *
 * Four kinds are supported:
 *
 * - `'arrow'`   — a directed line with an arrowhead at the head end,
 *                 optional text label near the tail.
 * - `'label'`   — a rounded-rect callout box with text, connected to
 *                 the data point by a thin leader line.
 * - `'circle'`  — a stroked circle centred on the data point,
 *                 optional text label next to it.
 * - `'bracket'` — a horizontal or L-shaped bracket spanning two data
 *                 coordinates, centered text label above/below.
 */
export interface IChartAnnotation {
    /** Annotation kind. */
    kind: 'arrow' | 'label' | 'circle' | 'bracket'
    /** Source / anchor data coordinate on the X axis (category string or numeric index). */
    x: number | string
    /** Source / anchor data coordinate on the Y axis. */
    y: number
    /**
     * End-point X coordinate in data space.
     * Required for `'arrow'` (head position) and `'bracket'` (right edge).
     */
    x2?: number | string
    /**
     * End-point Y coordinate in data space.
     * Optional for `'bracket'` — when omitted the bracket stays
     * horizontal (`y2 === y`).
     */
    y2?: number
    /** Text content rendered alongside the annotation. */
    text?: string
    /** Stroke / fill colour — accepts a `TIntent` name or any CSS colour string. */
    color?: TIntent | string
    /** Stroke width in SVG units. Default `1.5`. */
    width?: number
    /** Circle radius in SVG units. Applies to the `'circle'` kind only. Default `12`. */
    radius?: number
    /**
     * Horizontal offset of the text label relative to its anchor
     * point, in SVG units. Positive values push the label right.
     * Default `0`.
     */
    dx?: number
    /**
     * Vertical offset of the text label relative to its anchor
     * point, in SVG units. Positive values push the label down.
     * Default `-14`.
     */
    dy?: number
}

/**
 * Resolved SVG geometry for one annotation. Produced by
 * `computeAnnotationGeometry` in `chart.composable.ts` and consumed
 * directly by `<OrigamChartCartesian>` for rendering. Fields are
 * gated per `kind` — the renderer checks `kind` before reading each
 * optional field.
 */
export interface IChartAnnotationGeo {
    kind: IChartAnnotation['kind']
    /** Resolved CSS colour string. */
    stroke: string
    strokeWidth: number
    /** Anchor pixel coordinate (tail of arrow / anchor of label / centre of circle / left edge of bracket). */
    ax: number
    ay: number
    /** End pixel coordinate (head of arrow / right edge of bracket). Equals `(ax, ay)` when unused. */
    bx: number
    by: number
    /** Arrowhead polygon `points` attribute — populated for `kind === 'arrow'`. */
    arrowPoints?: string
    /** Text content to display alongside the annotation. */
    text?: string
    /** Resolved horizontal text offset in SVG units. */
    dx: number
    /** Resolved vertical text offset in SVG units. */
    dy: number
    /** Circle radius in SVG units — populated for `kind === 'circle'`. */
    radius: number
    /** Callout rounded-rect geometry — populated for `kind === 'label'`. */
    callout?: { x: number, y: number, width: number, height: number }
    /** Bottom-centre of the callout box where the leader line terminates — populated for `kind === 'label'`. */
    leaderEnd?: { x: number, y: number }
}
