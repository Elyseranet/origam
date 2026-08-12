/**
 * Tournament format of `<OrigamBracket>`.
 *
 * Renamed from `BRACKET_VARIANT` (ADR-005, Q4) — the value drives the
 * round-derivation algorithm and the SVG connector geometry
 * (`OrigamBracket.vue`), not a visual preset. `round-robin` renders an
 * entirely different NxN matrix layout, not a styled tree.
 */
export enum BRACKET_FORMAT {
    SINGLE_ELIMINATION = 'single-elimination',
    DOUBLE_ELIMINATION = 'double-elimination',
    ROUND_ROBIN = 'round-robin'
}
