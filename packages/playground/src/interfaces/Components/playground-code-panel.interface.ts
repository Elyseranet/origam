import type { ISceneCodeOptions } from '../Commons/scene-code-options.interface'
import type { IPlaygroundScene } from '../Scene/playground-scene.interface'

/*********************************************************
 * IPlaygroundCodePanelProps
 *
 * @description
 * The "Code" panel renders the scene as a Vue template — one direction only
 * (#1048): it reads the scene, it never writes it, so it has no emit.
 ********************************************************/
export interface IPlaygroundCodePanelProps {
    /** The scene to render as code. */
    scene: IPlaygroundScene
    /** Formatting options forwarded to `generateSceneCode`. */
    codeOptions?: ISceneCodeOptions
}
