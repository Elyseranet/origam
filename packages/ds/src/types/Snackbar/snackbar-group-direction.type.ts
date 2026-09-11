/**
 * Stacking direction for `OrigamSnackbarGroup`.
 *
 * - `top-down` — newest item appended at the bottom of the visible
 *   list (older items drift upward as the stack grows). Default for
 *   locations anchored to the top edge.
 * - `bottom-up` — newest item appears at the top of the visible list
 *   (older items drift downward). Default for locations anchored to
 *   the bottom edge.
 */
export type TSnackbarGroupDirection = 'top-down' | 'bottom-up'
