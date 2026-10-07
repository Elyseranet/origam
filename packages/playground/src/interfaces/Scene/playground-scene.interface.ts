import type { IPlaygroundInstance } from './playground-instance.interface'

/*********************************************************
 * IPlaygroundScene
 *
 * @description
 * What the playground is currently showing: the root instances plus the
 * selection. Serialisable in full, so a scene can be saved, restored, or
 * handed over in a URL.
 *
 * @description
 * ⛔ The scene carries NO theme, and that is a decision by the owner rather
 * than an omission. The playground receives a theme as a PROP from its host —
 * an autonomous app passes light/dark, `packages/marketing` passes one of its
 * brand identities — and the playground has no knowledge of which themes
 * exist. Putting a theme id in the scene would make a saved scene claim an
 * identity its next host may not have registered, and would turn this
 * package into something that has to know the brand list to validate itself.
 *
 * @description
 * `roots` is plural because comparing instances side by side is the normal
 * use, not a special mode: showing the seven `variant` values of a button at
 * once is seven roots, and demanding a synthetic wrapper component to hold
 * them would put a non-DS component in the catalogue.
 ********************************************************/
export interface IPlaygroundScene {
    /** Schema version, so a persisted scene can be migrated rather than dropped. */
    version: number
    /** The top-level instances, in render order. */
    roots: IPlaygroundInstance[]
    /**
     * The selected instance's `id`, or `null` for no selection.
     *
     * An id rather than a reference or a path: an id survives a reorder, and
     * it is what the selection emits carry, so the inspector and the host
     * agree on one vocabulary.
     */
    selectedInstanceId: string | null
}
