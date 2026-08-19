import type OrigamTreeview from '../../components/Treeview/OrigamTreeview.vue'
import type OrigamTreeviewNode from '../../components/Treeview/OrigamTreeviewNode.vue'
import { TREEVIEW_SELECT_MODE, TREEVIEW_SELECTABLE_NODES } from '../../enums/Treeview/treeview.enum'

export type TOrigamTreeview = InstanceType<typeof OrigamTreeview>
export type TOrigamTreeviewNode = InstanceType<typeof OrigamTreeviewNode>

export type TTreeviewSelectMode = `${TREEVIEW_SELECT_MODE}`
export type TTreeviewSelectableNodes = `${TREEVIEW_SELECTABLE_NODES}`
