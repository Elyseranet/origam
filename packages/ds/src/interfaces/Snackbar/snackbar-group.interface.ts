import type { Ref } from 'vue'

import type { ICommonsComponentProps, ISnackbarGroupItem, ISnackbarGroupItemOptions, ITagProps } from '../../interfaces'
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
     * by default. Registered into the shared stack store on mount (and
     * kept in sync reactively), so it applies to `notify()` calls from
     * ANY `useSnackbarGroup({ id })` instance targeting this stack —
     * not only calls that repeat `defaultDuration` as a composable
     * option.
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

/**
 * Per-`id` singleton store backing `useSnackbarGroup`.
 *
 * One entry per stack `id`, held in a module-level map for the lifetime
 * of the module, so any number of components / composables addressing
 * the same `id` share state (notify here, dismiss there).
 */
export interface ISnackbarGroupState {
    items: Ref<Array<ISnackbarGroupItem>>
    timers: Map<string, number>
    counter: { current: number }
    /**
     * Fallback `duration` (ms) for this stack, registered by the
     * mounted `<OrigamSnackbarGroup defaultDuration="…">` instance (see
     * `useSnackbarGroupInternal`'s `registerDefaultDuration`). Lets
     * `notify()` — called from ANYWHERE, independent of which
     * `useSnackbarGroup({ id })` call site fired it — honour the
     * component's declared default without requiring every caller to
     * repeat `defaultDuration` as a composable option. See #snackbar-
     * group-default-duration-bug: before this, the component's prop and
     * the composable's `notify()` never met, so `defaultDuration` on
     * `<OrigamSnackbarGroup>` was purely decorative.
     */
    defaultDuration: Ref<number>
}

/** Options accepted by `useSnackbarGroup`. */
export interface IUseSnackbarGroupOptions {
    id?: string
    /**
     * Maximum number of items kept in the stack. When `notify` would
     * push past this number, the oldest item is evicted FIFO. When
     * undefined, the stack is unbounded (the rendering component
     * still caps the visible count via its `max` prop).
     */
    max?: number
    /**
     * Fallback `duration` applied to items that omit their own.
     * Defaults to `SNACKBAR_GROUP_DEFAULT_DURATION` (5 000 ms).
     */
    defaultDuration?: number
}

/**
 * Public API returned by `useSnackbarGroup`. The `items` ref is the
 * same reactive reference shared with the matching
 * `<OrigamSnackbarGroup id="…">` instance, so direct mutation outside
 * of `notify` / `dismiss` is discouraged.
 */
export interface IUseSnackbarGroupReturn {
    items: Readonly<Ref<ReadonlyArray<ISnackbarGroupItem>>>
    notify: (opts: ISnackbarGroupItemOptions) => string
    dismiss: (itemId: string) => void
    dismissAll: () => void
}
