import type { CHART_STACKING } from '../../enums'
import { CHART_TYPE } from '../../enums'
import { OrigamChart } from '../../components'

/**
 * Loose item shape accepted by chart data arrays — either a raw
 * primitive (string label / number value) or a `{ value }` object
 * for richer descriptors. Consumers normalise via
 * `IChartSeries.data` / `useChart`.
 */
export type TChartItem = string | number | { value: number }

/**
 * Path smoothing strategy for `line` / `area` / `spline` charts.
 *
 * - `'none'`     — straight line segments between data points (default).
 * - `'curve'`    — cubic Bezier between every pair of points using a
 *                  tangent estimation a la Catmull-Rom. Visually
 *                  smoother but slightly overshoots at sharp peaks.
 * - `'monotone'` — monotone cubic interpolation (Fritsch-Carlson).
 *                  Smooth like `'curve'` but guaranteed not to
 *                  overshoot — what most "spline" demos show. Used
 *                  as the implicit default for `type='spline'`.
 *
 * Note: `'stepped-line'` is a CHART_TYPE, not a smoothing value —
 * staircase is a different topology (right-angle connections),
 * not a curve choice. See `TChartCartesianKind`.
 */
export type TChartSmoothing = 'none' | 'curve' | 'monotone'

/**
 * Stacking strategy for bar / column / area charts.
 *
 * - `'normal'`  — raw absolute values stacked on top of each other.
 * - `'percent'` — each stack normalised to 100 %; Y-axis fixed
 *                 `0 → 100`, tick labels show `${v}%`.
 */
export type TChartStacking = `${CHART_STACKING}`

/**
 * Union of all visualisation primitives accepted by the chart family.
 * Derives from `CHART_TYPE` so the enum stays the single source of
 * truth.
 */
export type TChartType = `${CHART_TYPE}`

export type TOrigamChart = InstanceType<typeof OrigamChart>
