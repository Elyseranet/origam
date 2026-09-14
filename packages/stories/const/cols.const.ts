import type { IOptions } from '@origam/interfaces'
import type { TCols } from '@origam/types'

/**
 * Grid column counts surfaced in Histoire controls, for `cols` and its
 * five per-breakpoint twins (`sm` … `xxl`).
 *
 * The grid is 12-column based. `'auto'` and `true` are the two non-numeric
 * sentinel values accepted by `IColProps.cols`: `'auto'` shrink-wraps the
 * content (`flex-grow: 0; flex-basis: auto`), `true` makes the column
 * grow to fill the remaining space (`flex-grow: 1; flex-basis: 0`).
 *
 * ⛔ NE PAS reutiliser cette liste pour les props `offset*` : leur regle
 * SCSS n'existe que pour 1 a 11 (`@if ($size != 12)` dans la boucle de
 * `OrigamCol.vue`). `auto`, `true` et `12` y seraient des options mortes.
 * Utiliser `offsetList` / `OFFSET_OPTIONS` a la place.
 */
export const colsList: Array<IOptions<TCols>> = [
    { label: '(none)', value: undefined },
    { label: 'auto (shrink to content)', value: 'auto' },
    { label: 'true (grow to fill)', value: true },
    { label: '1', value: '1' as TCols },
    { label: '2', value: '2' as TCols },
    { label: '3', value: '3' as TCols },
    { label: '4', value: '4' as TCols },
    { label: '5', value: '5' as TCols },
    { label: '6', value: '6' as TCols },
    { label: '7', value: '7' as TCols },
    { label: '8', value: '8' as TCols },
    { label: '9', value: '9' as TCols },
    { label: '10', value: '10' as TCols },
    { label: '11', value: '11' as TCols },
    { label: '12', value: '12' as TCols },
]

/**
 * Column counts surfaced for the `offset*` props.
 *
 * Deliberately NOT `colsList`: the SCSS only emits an
 * `.origam-col--offset-{n}` rule for 1 through 11 — the loop in
 * `OrigamCol.vue` guards it with `@if ($size != 12)`, and neither
 * `'auto'` nor `true` has an offset counterpart. Exposing those three in
 * an offset control would drive a prop with no effect. Issue #550, C7.
 */
export const offsetList: Array<IOptions<TCols>> = [
    { label: '(none)', value: undefined },
    { label: '1', value: '1' as TCols },
    { label: '2', value: '2' as TCols },
    { label: '3', value: '3' as TCols },
    { label: '4', value: '4' as TCols },
    { label: '5', value: '5' as TCols },
    { label: '6', value: '6' as TCols },
    { label: '7', value: '7' as TCols },
    { label: '8', value: '8' as TCols },
    { label: '9', value: '9' as TCols },
    { label: '10', value: '10' as TCols },
    { label: '11', value: '11' as TCols },
]
