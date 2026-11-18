/**
 * token-sheet.const.ts — static tables of the token sheet reader (scripts/token-sheet.mjs).
 */

/*********************************************************
 * SHEETS
 *
 * @description
 * The hand-maintained token stylesheets, in increasing precedence. `light.css`
 * is last because it is the default identity the catalogue documents: when a
 * name is declared in several sheets, the light value is the one the page
 * should show.
 *
 * @description
 * `dark.css` is read even though the page documents light, because a handful
 * of names are declared ONLY there. Including it keeps a real token from
 * being reported as absent.
 ********************************************************/
export const SHEETS = [
    'packages/ds/src/assets/css/tokens/primitive.css',
    'packages/ds/src/assets/css/tokens/dark.css',
    'packages/ds/src/assets/css/tokens/light.css'
]

/*********************************************************
 * DECL_RE
 *
 * @description
 * Matches one custom-property declaration at the start of a line. Anchored on
 * `--origam-` so a `var()` reference inside a value is never mistaken for a
 * declaration, and stops at the first `;` so a multi-value shadow stays whole.
 ********************************************************/
export const DECL_RE = /^[ \t]*(--origam-[A-Za-z0-9_-]+)[ \t]*:[ \t]*([^;]+);/gm

/*********************************************************
 * BLOCK_SEPARATORS
 *
 * @description
 * The three separators that can join two segments BEFORE the `---` boundary:
 * a plain hyphen (both segments belong to one flat block name), `__` (the
 * next segment is a BEM child) and `--` (the next segment is a state).
 ********************************************************/
export const BLOCK_SEPARATORS = ['-', '__', '--']

/*********************************************************
 * PINNED
 *
 * @description
 * The four dotted paths whose enumeration matches TWO declared names. Each is
 * settled by reading which variable the component's own SCSS consumes FIRST —
 * the primary channel, the other being its `var()` fallback. Not a preference:
 * the primary is the one a consumer sets to change the rendering.
 *
 * @description
 * `chip.overlay.opacity` — `OrigamChip.vue:643` reads
 * `var(--origam-chip__overlay---opacity, var(--origam-chip---overlay-opacity, 0))`.
 * @description
 * `data-table.row.background-color` — `OrigamDataTableRow.vue:303` reads
 * `var(--origam-data-table-row---background-color, var(--origam-data-table__row---background-color, ...))`.
 * @description
 * `data-table.row.transition-duration` — same file, line 306, same shape.
 * @description
 * `data-table.row.column-title.font-weight` — same file, line 314, same shape.
 ********************************************************/
export const PINNED = {
    'chip.overlay.opacity': '--origam-chip__overlay---opacity',
    'data-table.row.background-color': '--origam-data-table-row---background-color',
    'data-table.row.transition-duration': '--origam-data-table-row---transition-duration',
    'data-table.row.column-title.font-weight': '--origam-data-table-row__column-title---font-weight'
}
