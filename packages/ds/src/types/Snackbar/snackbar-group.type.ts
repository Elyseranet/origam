import type { OrigamSnackbarGroup } from "../../components"

export type TOrigamSnackbarGroup = InstanceType<typeof OrigamSnackbarGroup>


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

/**
 * Anchor locations supported by `OrigamSnackbarGroup`.
 *
 * Two-keyword strings (e.g. `'top-right'`) describe a corner, single
 * keyword strings (`'top'`, `'bottom'`) describe a viewport edge with
 * horizontal centering. Each location maps to a CSS pinning pair on
 * the stack root (`top` / `bottom` + `left` / `right` / centered).
 */
export type TSnackbarGroupLocation =
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'top'
    | 'bottom'
