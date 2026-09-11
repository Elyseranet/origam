import OrigamCol from '../../components/Grids/OrigamCol.vue'
import { COLS } from '../../enums/Grids/col.enum'

export type TCols = `${COLS}` | true | 'auto'

export type TOrigamCol = InstanceType<typeof OrigamCol>
