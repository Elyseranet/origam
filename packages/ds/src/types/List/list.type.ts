import OrigamList from '../../components/List/OrigamList.vue'

import { LINES, LIST_ROLE } from '../../enums/List/list.enum'

export type TLines = `${LINES}`

export type TListRole = `${LIST_ROLE}`

export type TOrigamList = InstanceType<typeof OrigamList>
