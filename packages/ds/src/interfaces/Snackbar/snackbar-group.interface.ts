import type { ICommonsComponentProps, ITagProps } from '../../interfaces'
import type { TSnackbarGroupDirection, TSnackbarGroupLocation } from '../../types'

/**
 * Props for `<OrigamSnackbarGroup>` — a multi-toast container that
 * orchestrates a queue of `OrigamSnackbar` instances driven through
 * the `useSnackbarGroup({ id })` composable.
 *
 * The component itself owns NO local visual state — every notification
 * is added via `notify()` and removed via `dismiss()` or auto-timeout.
 * The component subscribes to its registered stack `id` and re-renders
 * when the underlying `items` ref changes.
 */
export interface ISnackbarGroupProps extends ICommonsComponentProps, ITagProps {
    /**
     * Identifier of the stack this container renders. Pair with
     * `useSnackbarGroup({ id })` to spawn items into the same stack.
     * Multiple stacks can coexist (e.g. a global one + a per-region
     * one) — each one is keyed independently.
     *
     * @default 'default'
     */
    id?: string
    /**
     * Anchor location on the viewport. Drives both the absolute
     * positioning (top/bottom + left/right/center pinning) and the
     * `direction` default.
     *
     * @default 'bottom-right'
     */
    location?: TSnackbarGroupLocation
    /**
     * Maximum number of items rendered concurrently. When `notify()`
     * pushes a new item past `max`, the oldest item in the stack is
     * evicted FIFO (its `onDismiss` callback still fires).
     *
     * @default 5
     */
    max?: number
    /**
     * Default auto-dismiss timeout (ms) applied to items that do not
     * supply their own `duration`. Pass `0` to make all items sticky
     * by default.
     *
     * @default 5000
     */
    defaultDuration?: number
    /**
     * Gap between stacked items (CSS dimension — `'12px'`, `'1rem'`,
     * `8`, …).
     *
     * @default '12px'
     */
    spacing?: string | number
    /**
     * Stacking order. When unset, defaults to `'top-down'` for
     * `top-*` locations and `'bottom-up'` for `bottom-*` locations
     * — matching the natural reading direction of fresh items.
     */
    direction?: TSnackbarGroupDirection
}
