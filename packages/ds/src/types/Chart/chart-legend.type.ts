import OrigamChartLegend from '../../components/Chart/OrigamChartLegend.vue'

import type { TDirectionBoth } from '../Commons/anchor.type'

/**
 * Anchor position of the legend block inside `<OrigamChart>`. The
 * SVG plotting area shrinks or grows depending on the value — the
 * flex layout in the SCSS handles the box arithmetic.
 *
 * Aliases the Commons physical-side vocabulary (`BLOCK` + `INLINE` =
 * top/bottom/left/right) rather than redeclaring its four literals.
 */
export type TChartLegendPosition = TDirectionBoth

export type TOrigamChartLegend = InstanceType<typeof OrigamChartLegend>
