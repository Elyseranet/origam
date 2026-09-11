import { CHART_TYPE } from '../../enums'

/**
 * Union of all visualisation primitives accepted by the chart family.
 * Derives from `CHART_TYPE` so the enum stays the single source of
 * truth.
 */
export type TChartType = `${CHART_TYPE}`
