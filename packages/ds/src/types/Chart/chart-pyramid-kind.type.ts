import { CHART_PYRAMID_KIND } from '../../enums'

/**
 * The two rendering modes of the pyramid / funnel family.
 *
 * - `'pyramid'` — narrow at the top, widening toward the bottom.
 * - `'funnel'`  — wide at the top, narrowing toward the bottom
 *                 (classic conversion funnel shape).
 */
export type TChartPyramidKind = `${CHART_PYRAMID_KIND}`
