import type { OrigamTreeview, OrigamTreeviewNode } from '../../components'

export type TOrigamTreeview = InstanceType<typeof OrigamTreeview>
export type TOrigamTreeviewNode = InstanceType<typeof OrigamTreeviewNode>

export type TTreeviewSelectMode = 'single' | 'multiple' | 'none'
export type TTreeviewSelectableNodes = 'leaf' | 'all'
