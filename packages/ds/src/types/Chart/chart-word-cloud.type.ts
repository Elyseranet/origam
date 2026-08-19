import { CHART_WORD_CLOUD_ROTATION } from '../../enums/Chart/chart-word-cloud.enum'
import OrigamChartWordCloud from '../../components/Chart/OrigamChartWordCloud.vue'

/**
 * Word rotation mode for `<OrigamChartWordCloud>`.
 * - `'none'`        — all words horizontal (0°).
 * - `'random'`      — uniform random angle in [-30°, 30°].
 * - `'orthogonal'`  — each word either 0° or 90° (parity-based for determinism).
 */
export type TChartWordCloudRotation = `${CHART_WORD_CLOUD_ROTATION}`

export type TOrigamChartWordCloud = InstanceType<typeof OrigamChartWordCloud>

/**
 * Raw datum shape accepted from `series[0].data` before placement.
 * Moved out of `OrigamChartWordCloud.vue` (was a `type` declared
 * inside the `placedWords` computed) so the `.vue` file only imports
 * it, per the "no declarations in .vue" rule.
 */
export type TChartWordCloudRawDatum = {
    text: string
    value: number
    color?: string
}
