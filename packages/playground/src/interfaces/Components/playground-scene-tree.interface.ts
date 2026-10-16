import type { IComponentRegistry } from '../Registry/component-registry.interface'
import type { IPlaygroundScene } from '../Scene/playground-scene.interface'

/*********************************************************
 * IPlaygroundSceneTreeProps
 *
 * @description
 * The scene as a selectable tree, plus the two structural edits lot D adds:
 * adding a child to the selected instance and removing it. The tree holds no
 * scene — like the inspector, it reports intents and the playground root
 * routes them to `useSceneEditor`.
 ********************************************************/
export interface IPlaygroundSceneTreeProps {
    scene: IPlaygroundScene
    registry: IComponentRegistry
    /** The resolved selection (`useSceneEditor().selectedInstance`'s id). */
    selectedId: string | null
}

/*********************************************************
 * IPlaygroundSceneTreeEmits
 ********************************************************/
export interface IPlaygroundSceneTreeEmits {
    (e: 'select', instanceId: string): void
    /** Add an instance of `componentName` to the DEFAULT slot of `parentId`. */
    (e: 'add-child', parentId: string, componentName: string): void
    (e: 'remove', instanceId: string): void
}

export interface IPlaygroundSceneTreeSlots {
    [name: string]: never
}

/*********************************************************
 * IPlaygroundSceneTreeOption
 *
 * @description
 * One entry of the "add a child" picker — the `{ title, value }` shape
 * `OrigamSelect` reads by default (`IItemProps.itemTitle` / `itemValue`).
 ********************************************************/
export interface IPlaygroundSceneTreeOption {
    title: string
    value: string
}
