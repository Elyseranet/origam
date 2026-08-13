import type { CHART_HONEYCOMB_COLOR_MODE, CHART_HONEYCOMB_ORIENTATION } from '../../enums'
import { OrigamChartHoneycomb } from '../../components'

export type TChartHoneycombColorMode = `${ CHART_HONEYCOMB_COLOR_MODE }`

export type TChartHoneycombOrientation = `${ CHART_HONEYCOMB_ORIENTATION }`

export type TOrigamChartHoneycomb = InstanceType<typeof OrigamChartHoneycomb>
