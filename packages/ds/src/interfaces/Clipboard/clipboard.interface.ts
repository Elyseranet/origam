import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { TIcon } from '../../types/Icon/icon.type'

/*********************************************************
 * IClipboardProps
 *
 * @description
 * Props for `<OrigamClipboard>` — copy-to-clipboard wrapper.
 *
 * @description
 * The component is intentionally chrome-less: it owns the copy
 * pipeline (`navigator.clipboard.writeText` + `execCommand` fallback)
 * and the auto-resetting `copied` flag, but it does NOT impose any
 * visual on the trigger. The built-in trigger (rendered when no slot
 * is provided) is a single button whose label flips to `feedbackText`
 * while `copied` is true — that's the only feedback surface the
 * component owns. Consumers needing a different feedback shape (toast,
 * inline pill, animation, …) pass a `#default` scoped slot exposing
 * `{ copy, copied, error }` and render whatever they want.
 ********************************************************/
export interface IClipboardProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IRoundedProps, IMarginProps, IPaddingProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight'> {
    /**
     * Text payload written to the clipboard on `copy()`. Required.
     * Re-read each time the trigger fires, so a parent that mutates
     * the value between mounts still copies the up-to-date string.
     */
    value: string
    /**
     * Duration (ms) the `copied` flag stays true after a successful
     * write. The state auto-resets after this window — there is no
     * need to clear it from the consumer side.
     *
     * @default 2000
     */
    feedbackDuration?: number
    /**
     * Label rendered inside the built-in feedback overlay (and the
     * auto-rendered button label when no slot is provided). Consumers
     * wrap with `t()` if they need full i18n.
     *
     * @default 'Copied!'
     */
    feedbackText?: string
    /**
     * Alias for `feedbackText`. Takes precedence when both are passed.
     * Provided for callers who prefer the "success" framing in their
     * codebase.
     */
    successText?: string
    /**
     * Icon rendered by the built-in trigger at rest.
     *
     * Was a module-level constant (`MDI_ICONS.CONTENT_COPY`) with no way
     * for a consumer to change it — the classeur flagged it, and an icon
     * a consumer cannot pick is a dead surface. Now a real prop, so the
     * theme's `components['origam-clipboard']` block can set it too.
     *
     * @default 'mdi:mdi-content-copy'
     */
    icon?: TIcon
    /**
     * Icon swapped in while `copied` is true. Lets the trigger acknowledge
     * the copy on its own, without the label change that used to widen the
     * button mid-interaction.
     *
     * @default 'mdi:mdi-check'
     */
    copiedIcon?: TIcon
    /**
     * Disables the copy action. The default trigger becomes
     * non-interactive (`disabled` attribute) and `copy()` becomes a
     * no-op. The scoped slot still receives the `copy` function so
     * consumers can decide what to render — but it will short-circuit.
     *
     * @default false
     */
    disabled?: boolean
}

/*********************************************************
 * IClipboardEmits
 *
 * @description
 * Emits for `<OrigamClipboard>`.
 ********************************************************/
export interface IClipboardEmits {
    /** Fired after a successful write. Carries the payload string. */
    (e: 'copy', value: string): void
    /** Fired after a failed write (clipboard API denied, no permission, …). */
    (e: 'error', err: Error): void
}

/*********************************************************
 * IClipboardScopedSlotBindings
 *
 * @description
 * Bindings exposed via the `#default` scoped slot. Consumers use these
 * to wire any trigger — button, icon, span, custom widget — to the
 * copy pipeline without re-implementing the timing logic.
 ********************************************************/
export interface IClipboardScopedSlotBindings {
    /** Triggers the copy pipeline. Promise resolves true on success. */
    copy: () => Promise<boolean>
    /** True for `feedbackDuration` ms after a successful copy. */
    copied: boolean
    /** Set when the last copy attempt threw, null otherwise. */
    error: Error | null
}

/*********************************************************
 * IClipboardSlots
 *
 * @description
 * Slot signatures for `<OrigamClipboard>`.
 ********************************************************/
export interface IClipboardSlots {
    /**
     * Custom trigger. Scoped — receives `{ copy, copied, error }`.
     * When omitted, the component renders a default icon button with
     * `mdi:mdi-content-copy`.
     */
    default?: (bindings: IClipboardScopedSlotBindings) => any
    /**
     * Custom feedback content rendered **inside the tooltip** that opens
     * while `copied` is true, replacing the default `feedbackText`.
     *
     * It used to render inside the trigger button itself, which widened
     * the button mid-interaction and put a transient `aria-live` region
     * inside a control. The acknowledgement now lives in a tooltip and
     * the button only swaps its icon.
     *
     * Only applies to the built-in trigger — has no effect when
     * `#default` is overridden with a custom trigger (there is no
     * tooltip to render it in). Scoped — receives the boolean for
     * symmetry with the default slot.
     */
    feedback?: (bindings: { copied: boolean }) => any
}

/*********************************************************
 * IUseClipboardOptions
 *
 * @description
 * Options for the `useClipboard` composable.
 ********************************************************/
export interface IUseClipboardOptions {
    /**
     * Duration (ms) the returned `copied` ref stays true after a
     * successful write before auto-resetting.
     *
     * @default 2000
     */
    feedbackDuration?: number
}
