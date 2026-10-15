/*********************************************************
 * IPlaygroundDockSlots
 *
 * @description
 * The panels the bottom dock hosts. Each lot fills its own slot from
 * `Playground.vue` (lot C: `code`), so the dock stays a shell that knows
 * none of them.
 ********************************************************/
export interface IPlaygroundDockSlots {
    /** The "Code" panel — the scene rendered as a Vue template. */
    code?: () => unknown
}
