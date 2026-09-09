import OrigamList from '../../components/List/OrigamList.vue'

import { LINES } from '../../enums/List/list.enum'

export type TLines = `${LINES}`

export type TOrigamList = InstanceType<typeof OrigamList>
