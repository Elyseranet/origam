import type { ComputedRef } from 'vue'
import type { IBgColorProps,
    IColorProps, ICommonsComponentProps, IDensityProps, ISizeProps } from '../../interfaces'
import type { TIcon } from '../../types'
import type { TTreeviewSelectMode, TTreeviewSelectableNodes } from '../../types'

export interface ITreeviewNode {
    id: string
    label: string
    icon?: TIcon
    size?: string
    children?: ITreeviewNode[]
    disabled?: boolean
    expandable?: boolean
}

export interface ITreeviewProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IDensityProps {
    items: ITreeviewNode[]
    modelValue?: string[] | string
    expandedValue?: string[]
    selectMode?: TTreeviewSelectMode
    selectableNodes?: TTreeviewSelectableNodes
    showLines?: boolean
    expandOnClick?: boolean
}

export interface ITreeviewNodeProps extends ICommonsComponentProps {
    node: ITreeviewNode
    depth?: number
}

export interface ITreeviewProvide {
    toggleExpanded: (id: string) => void
    toggleSelected: (id: string) => void
    isExpanded: (id: string) => boolean
    isSelected: (id: string) => boolean
    selectMode: ComputedRef<TTreeviewSelectMode>
    selectableNodes: ComputedRef<TTreeviewSelectableNodes>
    showLines: ComputedRef<boolean>
    expandOnClick: ComputedRef<boolean>
    color: ComputedRef<string | undefined>
}
