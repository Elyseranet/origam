import type { IComponentRegistry } from '../Registry/component-registry.interface'
import type { IPlaygroundInstance } from '../Scene/playground-instance.interface'

/*********************************************************
 * IPlaygroundSceneNodeProps
 *
 * @description
 * One instance of the scene, rendered with its subtree. The node renders
 * itself recursively for `children`, so the preview only iterates the roots.
 ********************************************************/
export interface IPlaygroundSceneNodeProps {
    instance: IPlaygroundInstance
    registry: IComponentRegistry
    /**
     * The selected instance id (lot E1, #1164). The node whose instance it
     * names marks its rendered root `data-pg-selected`, which the preview
     * outlines while the selection mode is on. Passed down unchanged.
     */
    selectedId?: string | null
}

/*********************************************************
 * IPlaygroundSceneNodeEmits
 *
 * @description
 * Same payload as `IPlaygroundPreviewEmits` — a node relays its own emits
 * AND those of its descendants, each tagged with the id of the instance
 * that fired it, so the preview forwards them unchanged.
 ********************************************************/
export interface IPlaygroundSceneNodeEmits {
    (e: 'instance-emit', instanceId: string, name: string, args: unknown[]): void
}

export interface IPlaygroundSceneNodeSlots {
    [name: string]: never
}

/*********************************************************
 * IPlaygroundSceneNodeSlot
 *
 * @description
 * One slot a node fills on the component it renders: the child instances
 * placed there and, for the default slot only, the instance's plain text.
 ********************************************************/
export interface IPlaygroundSceneNodeSlot {
    name: string
    text: string
    children: IPlaygroundInstance[]
}
