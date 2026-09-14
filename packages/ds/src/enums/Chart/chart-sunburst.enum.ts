/**
 * How the label for a sunburst node is rendered.
 *
 * - `INLINE`  — centred horizontally inside the arc (wide arcs).
 * - `ROTATED` — rotated tangentially along the arc midpoint (narrow arcs).
 * - `LEADER`  — placed outside the chart with a leader line (very narrow arcs).
 */
export enum CHART_SUNBURST_LABEL_MODE {
    INLINE = 'inline',
    ROTATED = 'rotated',
    LEADER = 'leader'
}
