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
    /**
     * Accessible name for the tree's root `role="tree"` element. Without
     * it the tree is announced with no label, so pass one whenever the
     * surrounding context does not already name it.
     */
    ariaLabel?: string
}

export interface ITreeviewNodeProps extends ICommonsComponentProps {
    node: ITreeviewNode
    depth?: number
}

/** Slots exposed by `<OrigamTreeviewNode>`. */
export interface ITreeviewNodeSlots {
    /**
     * Replaces the default row rendering for a node. Receives the node
     * itself plus its resolved state, so a custom row can mirror the
     * built-in affordances (chevron, selection) without recomputing them.
     */
    node (props: {
        node: ITreeviewNode
        depth: number
        isExpanded: boolean
        isSelected: boolean
    }): unknown
}

/** Emits fired by `<OrigamTreeview>` — v-model echoes (selection,
 *  expansion) and node select/toggle lifecycle. */
export interface ITreeviewEmits {
    (e: 'update:modelValue', value: string[] | string): void
    (e: 'update:expandedValue', value: string[]): void
    (e: 'select', id: string): void
    (e: 'toggle', id: string, expanded: boolean): void
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
