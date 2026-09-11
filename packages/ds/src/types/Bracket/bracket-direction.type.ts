import type { TDirection } from '../Commons/direction.type'

/**
 * Layout axis of the bracket tree.
 *
 * - `'horizontal'` — each round is a column, matches stack vertically
 *   within the column, connectors flow left-to-right.
 * - `'vertical'`   — each round is a row, matches lay out horizontally,
 *   connectors flow top-to-bottom.
 *
 * Mirrors the global `TDirection` so the bracket plays nicely with the
 * rest of the design system's direction props.
 */
export type TBracketDirection = TDirection
