import OrigamChartSunburst from '../../components/Chart/OrigamChartSunburst.vue'
import { CHART_SUNBURST_LABEL_MODE } from '../../enums/Chart/chart-sunburst.enum'

export type TOrigamChartSunburst = InstanceType<typeof OrigamChartSunburst>

/**
 * How the label for a node is rendered.
 * - `'inline'`  — centred horizontally inside the arc (wide arcs).
 * - `'rotated'` — rotated tangentially along the arc midpoint (narrow arcs).
 * - `'leader'`  — placed outside the chart with a leader line (very narrow arcs).
 */
export type TChartSunburstLabelMode = `${CHART_SUNBURST_LABEL_MODE}`
