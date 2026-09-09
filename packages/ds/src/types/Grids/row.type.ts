import OrigamRow from '../../components/Grids/OrigamRow.vue'
import { FLEX_DIRECTION } from '../../enums/Grids/row.enum'

export type TFlexDirection = `${FLEX_DIRECTION}`

export type TOrigamRow = InstanceType<typeof OrigamRow>
