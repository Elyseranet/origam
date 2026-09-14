/**
 * Enum form of `TChartCartesianKind`. Used by the cartesian family
 * component to switch on the chart topology without scattering
 * magic strings ('spline' / 'stepped-line') through the codebase.
 */
export enum CHART_CARTESIAN_KIND {
    LINE = 'line',
    AREA = 'area',
    BAR = 'bar',
    COLUMN = 'column',
    SCATTER = 'scatter',
    SPLINE = 'spline',
    STEPPED_LINE = 'stepped-line'
}
