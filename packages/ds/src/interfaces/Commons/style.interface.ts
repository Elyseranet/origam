import { IConfigurableDocument } from "../../interfaces"

export interface IStyleTagOptions extends IConfigurableDocument {
    /**
     * Media query for styles to apply
     */
    media?: string

    /**
     * Load the style immediately
     *
     * @default true
     */
    immediate?: boolean

    /**
     * Manual controls the timing of loading and unloading
     *
     * @default false
     */
    manual?: boolean

    /**
     * DOM id of the style tag
     *
     * @default auto-incremented
     */
    id?: string
}
