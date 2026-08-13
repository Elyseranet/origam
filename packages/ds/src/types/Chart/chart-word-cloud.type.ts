import { OrigamChartWordCloud } from '../../components'

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
