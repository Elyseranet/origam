import type { CHART_MAP_MODE } from '../../enums/Chart/chart-map.enum'
import OrigamChartMap from '../../components/Chart/OrigamChartMap.vue'

/**
 * Rendering mode for `<OrigamChartMap>`.
 *
 * - `'choropleth'`    — country shapes coloured by data value.
 * - `'flight-routes'` — curved arcs drawn between country pairs.
 */
export type TChartMapMode = `${CHART_MAP_MODE}`

export type TOrigamChartMap = InstanceType<typeof OrigamChartMap>
