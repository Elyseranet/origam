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
     * The selected instance, or `undefined` for no selection. Handed to the
     * `preview-surround` slot so a host can annotate the selection, and
     * outlined while `selectMode` is on (lot E1, #1164).
     */
    selectedInstance: IPlaygroundInstance | undefined
    registry: IComponentRegistry
    /**
     * Selection mode (lot E1, #1164). While `true`, a click on a rendered
     * instance SELECTS it and never reaches the component: the pointer
     * events of `SELECT_MODE_CAPTURED_EVENTS` are stopped in the capture
     * phase. While `false` (default) the preview is inert to selection and
     * every component keeps its own interaction.
     */
    selectMode?: boolean
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
    /** A click in selection mode landed on this instance (lot E1, #1164). */
    (e: 'select-instance', instanceId: string): void
}

export interface IPlaygroundPreviewSlots {
    /** Wraps the preview stage. Scoped: `{ instance }`. */
    'preview-surround'?: (scope: { instance: IPlaygroundInstance | undefined }) => unknown
}
