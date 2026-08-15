import type { OrigamTreeview, OrigamTreeviewNode } from '../../components'
import { TREEVIEW_SELECT_MODE, TREEVIEW_SELECTABLE_NODES } from '../../enums'

export type TOrigamTreeview = InstanceType<typeof OrigamTreeview>
export type TOrigamTreeviewNode = InstanceType<typeof OrigamTreeviewNode>

export type TTreeviewSelectMode = `${TREEVIEW_SELECT_MODE}`
export type TTreeviewSelectableNodes = `${TREEVIEW_SELECTABLE_NODES}`
