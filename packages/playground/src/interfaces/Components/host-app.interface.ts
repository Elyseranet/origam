import type { TExternalSceneResult } from '../../types/Commons/external-scene.type'
import type { IComponentDefinition } from '../Catalog/component-definition.interface'

/*********************************************************
 * IHostAppProps
 *
 * @description
 * What `host/main.ts` resolved from the URL before mounting (#1441): the
 * scene (or error) a driver asked for, and the catalogue definitions that
 * scene needs on top of the demo seed.
 ********************************************************/
export interface IHostAppProps {
    external: TExternalSceneResult
    extraDefinitions: IComponentDefinition[]
}
