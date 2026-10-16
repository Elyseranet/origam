import type { IComponentDefinition } from '../Catalog/component-definition.interface'

/*********************************************************
 * IPlaygroundSnippetsProps
 *
 * @description
 * The snippets of the component at the root of the scene — the dock's
 * "Snippets" panel. `undefined` for an empty scene.
 ********************************************************/
export interface IPlaygroundSnippetsProps {
    definition: IComponentDefinition | undefined
}

/*********************************************************
 * IPlaygroundSnippetsEmits
 *
 * @description
 * `load` names a snippet of `definition` by its `IComponentSnippet.id`; the
 * playground root instantiates it through `useSceneEditor().loadSnippet`.
 ********************************************************/
export interface IPlaygroundSnippetsEmits {
    (e: 'load', snippetId: string): void
}

export interface IPlaygroundSnippetsSlots {
    [name: string]: never
}
