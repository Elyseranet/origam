import type { TIcon, TIntent } from '../../types'

/**
 * Action button descriptor attached to a snackbar stack item.
 *
 * Surfaces in the rendered snackbar as a button — clicking it invokes
 * `handler` and (by default) dismisses the item. Set `keepOpen: true`
 * to keep the snackbar visible after the click (e.g. for a multi-step
 * confirmation).
 */
export interface ISnackbarGroupItemAction {
    label: string
    handler: () => void
    intent?: TIntent
    keepOpen?: boolean
}

/**
 * Options accepted by `useSnackbarGroup().notify(opts)`.
 *
 * Every field is optional except that the resulting item must surface
 * SOMETHING to the user — either a `title`, a `message`, or both.
 * The composable does not enforce this at runtime; emitting an empty
 * item is a no-op but is allowed for programmatic flexibility.
 */
export interface ISnackbarGroupItemOptions {
    /** Bold first line. Useful for short labels (e.g. "Saved"). */
    title?: string
    /** Body text under the title (or sole line when `title` absent). */
    message?: string
    /**
     * Semantic intent driving icon defaults, `role=status|alert`, and
     * surface coloring. Defaults to `info`.
     */
    intent?: TIntent
    /**
     * Auto-dismiss timeout in milliseconds. Overrides the stack-level
     * `defaultDuration`. Pass `0` to make the item sticky (no auto
     * dismiss — user has to dismiss it manually or programmatically).
     */
    duration?: number
    /**
     * Prepend icon override. Defaults to the per-intent icon
     * (`mdiCheckCircle` for success, `mdiAlertCircle` for danger, …).
     */
    icon?: TIcon
    /** Optional action buttons rendered in the snackbar footer. */
    actions?: ReadonlyArray<ISnackbarGroupItemAction>
    /** Whether to show the close (`X`) button. Default `true`. */
    dismissible?: boolean
    /** Callback fired once the item leaves the stack. */
    onDismiss?: () => void
}

/**
 * Materialised item held inside the stack store. Adds the auto-generated
 * `id` to the option shape so callers can address the item afterwards
 * (`dismiss(id)`).
 */
export interface ISnackbarGroupItem extends ISnackbarGroupItemOptions {
    id: string
    createdAt: number
}
