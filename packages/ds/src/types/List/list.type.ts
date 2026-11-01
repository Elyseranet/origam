import OrigamList from '../../components/List/OrigamList.vue'
import OrigamListChildren from '../../components/List/OrigamListChildren.vue'
import OrigamListGroupActivator from '../../components/List/OrigamListGroupActivator.vue'

import { LINES, LIST_ROLE } from '../../enums/List/list.enum'

export type TLines = `${LINES}`

export type TListRole = `${LIST_ROLE}`

export type TOrigamList = InstanceType<typeof OrigamList>

export type TOrigamListChildren = InstanceType<typeof OrigamListChildren>
export type TOrigamListGroupActivator = InstanceType<typeof OrigamListGroupActivator>
