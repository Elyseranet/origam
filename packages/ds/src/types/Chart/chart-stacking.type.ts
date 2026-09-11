import type { CHART_STACKING } from '../../enums'

/**
 * Stacking strategy for bar / column / area charts.
 *
 * - `'normal'`  — raw absolute values stacked on top of each other.
 * - `'percent'` — each stack normalised to 100 %; Y-axis fixed
 *                 `0 → 100`, tick labels show `${v}%`.
 */
export type TChartStacking = `${CHART_STACKING}`
