/**
 * Closed list of CSS `grid-auto-flow` values surfaced by `<OrigamGrid>`.
 *
 * The native CSS spec accepts more permutations (`row column dense`, …),
 * but the matrix below is what 99 % of dashboards / page-builders need.
 * If a consumer needs a more exotic value, they can pass a raw string via
 * `:style` on the outer container — we don't double-validate
 * `grid-auto-flow`.
 */
export enum GRID_AUTO_FLOW {
    ROW = 'row',
    COLUMN = 'column',
    ROW_DENSE = 'row dense',
    COLUMN_DENSE = 'column dense'
}
