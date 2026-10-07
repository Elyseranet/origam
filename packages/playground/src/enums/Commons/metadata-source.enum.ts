/*********************************************************
 * METADATA_SOURCE
 *
 * @description
 * Which extraction stage established a given piece of metadata. Recorded per
 * field rather than per component because the two sources answer DIFFERENT
 * questions and neither subsumes the other — measured on `develop` @
 * bcb9dc909 across all 218 components:
 *
 * | fact                                  | RUNTIME | TYPES |
 * |---------------------------------------|---------|-------|
 * | prop names (`extends` flattened)      | yes     | yes   |
 * | required flag                         | yes     | yes   |
 * | default VALUE                         | yes     | no    |
 * | one-constructor runtime type          | yes     | no    |
 * | literal union members                 | **no**  | yes   |
 * | emits (410) and slots (735)           | partial | yes   |
 * | JSDoc description                     | no      | yes   |
 *
 * @description
 * The two rows that matter. A DEFAULT only exists in the runtime descriptor —
 * `withDefaults` is compiled into it, and nothing in the type tells you that
 * `variant` starts at `'outlined'`. A union's MEMBERS only exist in the type —
 * `variant?: TKbdVariant` leaves no trace of `tonal | outlined | filled` at
 * runtime. So a playground that drops either source loses either every
 * starting value or every picker.
 *
 * @description
 * `ALIAS` is the second type-level stage and is NOT redundant with `TYPES`:
 * the TypeScript printer preserves an alias NAME whenever the type carries
 * one, so `location?: TAnchor` prints as `"TAnchor"` and its 18 members have
 * to be resolved by a separate compiler pass. 13 of the 34 aliases reached
 * this way turned out to be finite literal unions.
 ********************************************************/
export enum METADATA_SOURCE {
    /** `Component.props` — the descriptor the SFC compiler emits. */
    RUNTIME = 'runtime',
    /** `vue-component-meta` — the printed TypeScript type. */
    TYPES = 'types',
    /** A TypeScript pass resolving a named alias to its literal members. */
    ALIAS = 'alias',
    /** Supplied by the host or by hand, not extracted. */
    AUTHORED = 'authored'
}
