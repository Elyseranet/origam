import type { METADATA_SOURCE } from '../../enums/Commons/metadata-source.enum'

/*********************************************************
 * ISlotDefinition
 *
 * @description
 * One slot a component exposes. 735 across the catalogue, measured on
 * `develop` @ bcb9dc909 — and **invisible to the runtime descriptor
 * entirely**. `Component.props` says nothing about slots and there is no
 * `Component.slots`; only the type-level source sees them.
 *
 * @description
 * This is the single strongest argument for keeping two sources rather than
 * settling for the cheaper one: a playground with no slot list can only ever
 * render a component's default content.
 ********************************************************/
export interface ISlotDefinition {
    /** The slot name — `default`, `prepend`, `item`… */
    name: string
    /** Human-facing label. Defaults to `name`. */
    label: string
    /**
     * The slot-props signature as the TypeScript printer renders it, e.g.
     * `{ item: T; index: number }`. `null` for a slot taking no props.
     */
    slotPropsType: string | null
    /** JSDoc text from the slot declaration, when present. */
    description?: string
    /** Which stage established this entry. */
    source: METADATA_SOURCE
}
