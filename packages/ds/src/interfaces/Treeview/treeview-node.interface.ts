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

/*********************************************************
 * ITreeviewNodeEmits
 *
 * @description
 * `<OrigamTreeviewNode>` emits nothing of its own — expand/select state
 * changes go through the injected `ITreeviewProvide.toggleExpanded` /
 * `toggleSelected` callbacks, which mutate the ancestor `<OrigamTreeview>`'s
 * state directly rather than emitting up the tree.
 ********************************************************/
export interface ITreeviewNodeEmits {}

/** Slots exposed by `<OrigamTreeviewNode>`. */
export interface ITreeviewNodeSlots {
    /**
     * Extra content rendered UNDER a node's row — the built-in row
     * (guides, chevron, icon, label, size) is always rendered and is not
     * replaceable. Receives the node itself plus its resolved state, so
     * the added content can mirror the built-in affordances without
     * recomputing them. Forwarded down every recursion level, and
     * relayed from `<OrigamTreeview>`.
     */
    node (props: {
        node: ITreeviewNode
        depth: number
        isExpanded: boolean
        isSelected: boolean
    }): unknown
}
