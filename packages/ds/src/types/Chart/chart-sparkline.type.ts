import { CHART_SPARKLINE_KIND } from '../../enums/Chart/chart-sparkline.enum'
import OrigamChartSparkline from '../../components/Chart/OrigamChartSparkline.vue'

/**
 * The four rendering modes of the sparkline family.
 *
 * - `'line'`   — polyline connecting data points.
 * - `'area'`   — line with a translucent fill below.
 * - `'column'` — vertical bars (Y values mapped to height).
 * - `'bar'`    — horizontal bars (Y values mapped to width).
 */
export type TChartSparklineKind = `${CHART_SPARKLINE_KIND}`

export type TOrigamChartSparkline = InstanceType<typeof OrigamChartSparkline>
