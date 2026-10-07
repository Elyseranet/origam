import type { IPlaygroundScene } from '../../interfaces/Scene/playground-scene.interface'

/**
 * Current `IPlaygroundScene.version`. Bumped whenever the scene shape changes
 * in a way a persisted scene cannot be read back under, so an old scene can
 * be migrated rather than silently misread.
 */
export const SCENE_VERSION = 1

/**
 * An empty scene.
 *
 * ⛔ A FACTORY, never a shared constant object. A scene is mutated in place by
 * the editor, so handing out one frozen-by-convention literal would let two
 * playground instances on the same page edit the same `roots` array — and the
 * second mount would start with the first one's content. The `withDefaults`
 * rule in this repo's CLAUDE.md makes the same point for object props, for
 * the same reason.
 */
export function createEmptyScene (): IPlaygroundScene {
    return { version: SCENE_VERSION, roots: [], selectedInstanceId: null }
}
