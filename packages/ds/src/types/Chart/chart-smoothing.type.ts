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
