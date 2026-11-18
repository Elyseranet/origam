/*********************************************************
 * ICatalogIndexEntry
 *
 * @description
 * One row of `src/assets/catalog-index.json` (`meta:catalog`, #1145): what a
 * host needs to know about a component WITHOUT loading its definition —
 * which family it belongs to, so that a parent and the sub-components that
 * render inside it can be loaded together.
 ********************************************************/
export interface ICatalogIndexEntry {
    /** The export name — `OrigamBtn`. */
    name: string
    /** `origam-btn`. */
    tag: string
    /** The `components/{Family}/` directory. */
    family: string
    /** `name` minus the `Origam` prefix. */
    label: string
}
