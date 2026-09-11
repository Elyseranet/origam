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
