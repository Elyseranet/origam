import OrigamChartCartesian from '../../components/Chart/OrigamChartCartesian.vue'

import { CHART_CARTESIAN_KIND } from '../../enums/Chart/chart-cartesian.enum'

/**
 * Cartesian chart topology — the subset of `TChartType` that
 * `<OrigamChartCartesian>` knows how to render. Each value implies
 * a distinct path generator inside `useChart`:
 *
 * - `'line'`     — `linePath` with optional smoothing.
 * - `'area'`     — `areaPath` (fill) + `linePath` (stroke) per series.
 * - `'bar'`      — horizontal `<rect>` per data point.
 * - `'column'`   — vertical `<rect>` per data point.
 * - `'scatter'`  — `<circle>` per data point, no connecting path.
 * - `'spline'`   — `linePath` forced to `smoothing='monotone'`.
 * - `'stepped-line'` — staircase polyline (right-angle segments).
 *
 * Treated as a separate type rather than a re-export of
 * `TChartType` because the family-level component only accepts
 * this narrower subset — the SFC's `defineProps` enforces it.
 */
export type TChartCartesianKind = `${CHART_CARTESIAN_KIND}`

export type TOrigamChartCartesian = InstanceType<typeof OrigamChartCartesian>
