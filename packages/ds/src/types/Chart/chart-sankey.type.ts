import OrigamChartSankey from '../../components/Chart/OrigamChartSankey.vue'

export type TOrigamChartSankey = InstanceType<typeof OrigamChartSankey>

/**
 * Per-link layout spec computed while laying out ribbons — carries the
 * source/target band heights and Y offsets used to sort links so
 * ribbons leave each source in target-Y order and arrive at each
 * target in source-Y order. Moved out of `OrigamChartSankey.vue` (was
 * a `type` declared inside the `layoutLinks` computed) so the `.vue`
 * file only imports it, per the "no declarations in .vue" rule.
 */
export type TChartSankeyLinkSpec = {
    index: number
    from: string
    to: string
    value: number
    color: string
    srcBandH: number
    tgtBandH: number
    srcY: number
    tgtY: number
}
