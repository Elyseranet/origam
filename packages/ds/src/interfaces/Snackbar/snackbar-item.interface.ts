import type { ICommonsComponentProps, ITypographyProps } from '../../interfaces'
import type { TIcon, TIntent } from '../../types'
import type { ISnackbarGroupItemAction } from '../../interfaces'

/**
 * Props for `<OrigamSnackbarItem>` — the pure visual layer of a single
 * toast notification. This component owns:
 *   - Intent theming (surface colour, border, icon tinting)
 *   - Icon + title + message layout
 *   - Action buttons rendering
 *   - Dismiss button rendering
 *   - ARIA semantics (role, aria-live, aria-atomic)
 *
 * It does NOT own positioning, transitions, overlay, or auto-dismiss
 * logic — those concerns belong to the parent (`OrigamSnackbar` or
 * `OrigamSnackbarGroup`).
 *
 * Both `OrigamSnackbar` and `OrigamSnackbarGroup` consume this component
 * so all visual intent / layout logic lives in one place only.
 */
export interface ISnackbarItemProps extends ICommonsComponentProps, ITypographyProps {
    /**
     * Semantic intent — drives icon defaults and surface colouring via
     * `--origam-color__feedback--{intent}---*` tokens.
     *
     * @default 'info'
     */
    intent?: TIntent

    /**
     * Optional title rendered as a bold first line.
     * Useful for short labels (e.g. "Saved", "Error").
     */
    title?: string

    /**
     * Body text rendered under the title (or as the sole line when
     * `title` is absent). Can be omitted when content is provided
     * via the `default` slot.
     */
    message?: string

    /**
     * Prepend icon override. When omitted, defaults to the per-intent
     * icon (`mdiCheckCircle` for success, `mdiAlertCircle` for danger,
     * etc.). Pass `false` to suppress the icon entirely.
     */
    icon?: TIcon | false

    /**
     * Action buttons rendered inline after the text block.
     * Each action fires `handler()` and dismisses the item by default
     * unless `keepOpen: true`.
     */
    actions?: ReadonlyArray<ISnackbarGroupItemAction>

    /**
     * Whether to render the close (✕) dismiss button.
     *
     * @default true
     */
    dismissible?: boolean

    /**
     * Accessible label for the dismiss button.
     *
     * @default 'Dismiss notification'
     */
    dismissLabel?: string

    /**
     * ARIA role for the item element. Inferred from `intent` when not
     * set explicitly: `warning` / `danger` → `'alert'`, others → `'status'`.
     */
    role?: 'status' | 'alert'

    /**
     * ARIA live region politeness. Inferred from `intent` when not set
     * explicitly: `warning` / `danger` → `'assertive'`, others → `'polite'`.
     */
    ariaLive?: 'polite' | 'assertive'

    /**
     * `data-cy` attribute injected on the root item element, forwarded
     * from the parent stack/snackbar so each toast is addressable in e2e
     * tests.
     */
    dataCy?: string
}
