import { OrigamCol } from "../../components"
import { COLS } from '../../enums'

export type TCols = `${COLS}` | true | 'auto'

export type TOrigamCol = InstanceType<typeof OrigamCol>
