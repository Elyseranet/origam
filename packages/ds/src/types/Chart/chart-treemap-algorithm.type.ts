/**
 * Treemap layout algorithm selector.
 *
 * - `'squarified'` — Bruls / Huijse / van Wijk squarified algorithm.
 *   Tiles are laid out row by row, each row accumulates items while
 *   their worst aspect ratio improves. Produces nearly-square tiles.
 *
 * - `'slice-dice'` — Alternates horizontal and vertical splits at
 *   each recursion level (slice at even depth, dice at odd depth).
 *   Tiles tend to be long and thin but preserve data order.
 */
export type TChartTreemapAlgorithm = 'squarified' | 'slice-dice'
