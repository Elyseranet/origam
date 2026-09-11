import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

/**
 * Props for `<OrigamClipboard>` — copy-to-clipboard wrapper.
 *
 * The component is intentionally chrome-less: it owns the copy
 * pipeline (`navigator.clipboard.writeText` + `execCommand` fallback)
 * and the auto-resetting `copied` flag, but it does NOT impose any
 * visual on the trigger. The built-in trigger (rendered when no slot
 * is provided) is a single button whose label flips to `feedbackText`
 * while `copied` is true — that's the only feedback surface the
 * component owns. Consumers needing a different feedback shape (toast,
 * inline pill, animation, …) pass a `#default` scoped slot exposing
 * `{ copy, copied, error }` and render whatever they want.
 */
export interface IClipboardProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IRoundedProps, IMarginProps, IPaddingProps, ITypographyProps {
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
     * Disables the copy action. The default trigger becomes
     * non-interactive (`disabled` attribute) and `copy()` becomes a
     * no-op. The scoped slot still receives the `copy` function so
     * consumers can decide what to render — but it will short-circuit.
     *
     * @default false
     */
    disabled?: boolean
}

/**
 * Emits for `<OrigamClipboard>`.
 */
export interface IClipboardEmits {
    /** Fired after a successful write. Carries the payload string. */
    (e: 'copy', value: string): void
    /** Fired after a failed write (clipboard API denied, no permission, …). */
    (e: 'error', err: Error): void
}

/**
 * Bindings exposed via the `#default` scoped slot. Consumers use these
 * to wire any trigger — button, icon, span, custom widget — to the
 * copy pipeline without re-implementing the timing logic.
 */
export interface IClipboardScopedSlotBindings {
    /** Triggers the copy pipeline. Promise resolves true on success. */
    copy: () => Promise<boolean>
    /** True for `feedbackDuration` ms after a successful copy. */
    copied: boolean
    /** Set when the last copy attempt threw, null otherwise. */
    error: Error | null
}

/**
 * Slot signatures for `<OrigamClipboard>`.
 */
export interface IClipboardSlots {
    /**
     * Custom trigger. Scoped — receives `{ copy, copied, error }`.
     * When omitted, the component renders a default icon button with
     * `mdi:mdi-content-copy`.
     */
    default?: (bindings: IClipboardScopedSlotBindings) => any
    /**
     * Custom feedback marker rendered when `showFeedback` is true and
     * `copied` is true. Scoped — receives the boolean for symmetry
     * with the default slot.
     */
    feedback?: (bindings: { copied: boolean }) => any
}

/**
 * Options for the `useClipboard` composable.
 */
export interface IUseClipboardOptions {
    /**
     * Duration (ms) the returned `copied` ref stays true after a
     * successful write before auto-resetting.
     *
     * @default 2000
     */
    feedbackDuration?: number
}
