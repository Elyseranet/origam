import type { IComponentRegistry } from '../Registry/component-registry.interface'
import type { IPlaygroundInstance } from '../Scene/playground-instance.interface'

/*********************************************************
 * IPlaygroundPreviewProps
 ********************************************************/
export interface IPlaygroundPreviewProps {
    /** The one instance this lot renders, or `undefined` for no selection. */
    instance: IPlaygroundInstance | undefined
    registry: IComponentRegistry
}

export interface IPlaygroundPreviewSlots {
    /** Wraps the preview stage. Scoped: `{ instance }`. */
    'preview-surround'?: (scope: { instance: IPlaygroundInstance | undefined }) => unknown
}
