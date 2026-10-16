import type { IComponentRegistry } from '../Registry/component-registry.interface'
import type { IPlaygroundInstance } from '../Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../Scene/playground-scene.interface'

/*********************************************************
 * IPlaygroundPreviewProps
 ********************************************************/
export interface IPlaygroundPreviewProps {
    /** The scene — every root is rendered, with its `children` (lot D). */
    scene: IPlaygroundScene
    /**
     * The selected instance, or `undefined` for no selection. Not rendered
     * differently: it is handed to the `preview-surround` slot so a host can
     * annotate the selection.
     */
    selectedInstance: IPlaygroundInstance | undefined
    registry: IComponentRegistry
}

/*********************************************************
 * IPlaygroundPreviewEmits
 *
 * @description
 * `instance-emit` relays one emit of the rendered instance, raw arguments
 * included — formatting them for display is the event log's job.
 ********************************************************/
export interface IPlaygroundPreviewEmits {
    (e: 'instance-emit', instanceId: string, name: string, args: unknown[]): void
}

export interface IPlaygroundPreviewSlots {
    /** Wraps the preview stage. Scoped: `{ instance }`. */
    'preview-surround'?: (scope: { instance: IPlaygroundInstance | undefined }) => unknown
}
