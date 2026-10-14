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

/** One `useStyle()` rule, resolved for the server render. */
export interface ISsrStyleEntry {
    /** DOM id of the `<style>` tag the rule belongs to. */
    id: string

    /** The `#element-id { … }` rule, already safe to embed in a `<style>`. */
    css: string
}

/**
 * Per-app registry of the rules `useStyle()` produced during a server render.
 * Rules are registered as GETTERS and read at collection time, so a value a
 * later pass of the render settled on is what ships.
 */
export interface ISsrStyleCollector {
    add (id: string, css: () => string): void

    entries (): ISsrStyleEntry[]
}
