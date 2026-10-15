import { IConfigurableDocument } from './commons.interface'

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

/*********************************************************
 * ISsrStyleEntry / ISsrStyleCollector (#1092)
 *
 * @description
 * `ISsrStyleEntry` is one `useStyle()` rule resolved for the server render:
 * `id` is the DOM id of the `<style>` tag it belongs to, `css` the
 * `#element-id { … }` rule, already safe to embed in a `<style>`.
 *
 * @description
 * `ISsrStyleCollector` is the per-app registry of those rules. Rules are
 * registered as GETTERS and read at collection time, so a value a later pass
 * of the render settled on is what ships.
 ********************************************************/
export interface ISsrStyleEntry {
    id: string

    css: string
}

export interface ISsrStyleCollector {
    add (id: string, css: () => string): void

    entries (): ISsrStyleEntry[]
}
