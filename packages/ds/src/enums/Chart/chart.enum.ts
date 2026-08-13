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
