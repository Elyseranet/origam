import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { ITreeviewNode } from './treeview.interface'

/*********************************************************
 * ITreeviewNodeProps / ITreeviewNodeSlots
 *
 * @description
 * Props/slots for `<OrigamTreeviewNode>` — the only consumer. Split
 * out of `interfaces/Treeview/treeview.interface.ts` under issue
 * #364, which used to hold two distinct component surfaces
 * (Treeview / TreeviewNode) in one file.
 ********************************************************/
export interface ITreeviewNodeProps extends ICommonsComponentProps {
    node: ITreeviewNode
    depth?: number
}

/** `<OrigamTreeviewNode>` emits nothing of its own — expand/select state
 *  changes go through the injected `ITreeviewProvide.toggleExpanded` /
 *  `toggleSelected` callbacks, which mutate the ancestor `<OrigamTreeview>`'s
 *  state directly rather than emitting up the tree. */
export interface ITreeviewNodeEmits {}

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
