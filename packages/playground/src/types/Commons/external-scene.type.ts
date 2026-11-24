import type { PLAYGROUND_SCENE_ERROR } from '../../enums/Commons/scene-error.enum'
import type { IPlaygroundScene } from '../../interfaces/Scene/playground-scene.interface'

/*********************************************************
 * TExternalSceneResult
 *
 * @description
 * What `resolveExternalScene` makes of a URL: nothing asked (`none`), a scene
 * to load, or a short error code (plus the offending value when there is one).
 ********************************************************/
export type TExternalSceneResult =
    | { status: 'none' }
    | { status: 'scene', scene: IPlaygroundScene }
    | { status: 'error', code: PLAYGROUND_SCENE_ERROR, detail?: string }
