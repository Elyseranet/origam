/**
 * Closed list of CSS `grid-auto-flow` values surfaced by `<OrigamGrid>`.
 *
 * The native CSS spec accepts more permutations (`column dense`,
 * `row column dense`, …), but the matrix below is what 99 % of
 * dashboards / page-builders need. If a consumer needs a more
 * exotic value, they can pass a raw string via `:style` on the
 * outer container — we don't double-validate `grid-auto-flow`.
 */
export type TGridAutoFlow =
    | 'row'
    | 'column'
    | 'row dense'
    | 'column dense'
