/**
 * Polar chart topology — the subset of `TChartType` that
 * `<OrigamChartPolar>` knows how to render. Two values, two arc
 * generators:
 *
 * - `'pie'`   — `arcPath` with `innerR = 0` (closed wedge).
 * - `'donut'` — `arcPath` with `innerR > 0` (outer + inner arc).
 *
 * Polar charts deliberately don't render cartesian axes / grid —
 * the family component lives in its own SFC for exactly that
 * reason (the legacy `<OrigamChart>` shell painted axis lines
 * behind pie/donut slices, which is the user's primary complaint).
 */
export type TChartPolarKind = 'pie' | 'donut'
