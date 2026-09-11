/**
 * Stacking strategy for bar / column / area charts.
 *
 * - `NORMAL`  — series are stacked using their raw absolute values.
 *               The Y-axis spans `0 → max(stack total)`.
 * - `PERCENT` — each stack is normalised to 100 %. The Y-axis is
 *               fixed at `0 → 100` and tick labels default to the
 *               `${v}%` format. The tooltip shows both the raw value
 *               and its share of the stack.
 */
export enum CHART_STACKING {
    NORMAL = 'normal',
    PERCENT = 'percent'
}

export enum CHART_TYPE {
    LINE = 'line',
    AREA = 'area',
    BAR = 'bar',
    COLUMN = 'column',
    PIE = 'pie',
    DONUT = 'donut',
    SCATTER = 'scatter',
    RADAR = 'radar',
    SPLINE = 'spline',
    STEPPED_LINE = 'stepped-line',
    GAUGE = 'gauge',
    PYRAMID = 'pyramid',
    FUNNEL = 'funnel',
    HONEYCOMB = 'honeycomb',
    TREEMAP = 'treemap',
    SANKEY = 'sankey',
    WORD_CLOUD = 'word-cloud',
    HEATMAP = 'heatmap',
    SUNBURST = 'sunburst',
    BOX_PLOT = 'box-plot',
    PICTORIAL = 'pictorial',
    CANDLESTICK = 'candlestick',
    STREAMGRAPH = 'streamgraph',
    VARIWIDE = 'variwide',
    POLAR_BAR = 'polar-bar',
    BULLET = 'bullet',
    PARETO = 'pareto',
    MAP = 'map',
    SPARKLINE = 'sparkline'
}

/**
 * Path smoothing strategy for `line` / `area` / `spline` charts.
 *
 * - `NONE`     — straight line segments between data points (default).
 * - `CURVE`    — cubic Bezier between every pair of points using a
 *                tangent estimation a la Catmull-Rom. Visually smoother
 *                but slightly overshoots at sharp peaks.
 * - `MONOTONE` — monotone cubic interpolation (Fritsch-Carlson). Smooth
 *                like `CURVE` but guaranteed not to overshoot — what most
 *                "spline" demos show. Used as the implicit default for
 *                `type='spline'`.
 *
 * Note: `'stepped-line'` is a `CHART_TYPE`, not a smoothing value —
 * staircase is a different topology (right-angle connections), not a
 * curve choice. See `CHART_CARTESIAN_KIND`.
 */
export enum CHART_SMOOTHING {
    NONE = 'none',
    CURVE = 'curve',
    MONOTONE = 'monotone'
}
