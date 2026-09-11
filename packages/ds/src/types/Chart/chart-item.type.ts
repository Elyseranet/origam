/**
 * Loose item shape accepted by chart data arrays — either a raw
 * primitive (string label / number value) or a `{ value }` object
 * for richer descriptors. Consumers normalise via
 * `IChartSeries.data` / `useChart`.
 */
export type TChartItem = string | number | { value: number }
