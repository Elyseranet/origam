import type {
    ICommonsComponentProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TInlineEditInputType } from '../../types'

/**
 * Signature of a validator passed to `<OrigamInlineEdit>` (and to the
 * `useInlineEdit` composable). Returns `true` when the draft value is
 * acceptable, or an error message (`string`) that the component will
 * surface via `role="alert"`.
 *
 * Async validators are supported — return a `Promise` and the component
 * will keep the editor open (and expose `isPending = true`) until it
 * resolves.
 */
export type TInlineEditValidator = (value: string) =>
    | true
    | string
    | Promise<true | string>

/**
 * A single validation rule for `<OrigamInlineEdit>`. Matches the
 * contract shared by all DS form fields (`IValidationProps.rules`):
 * a function that receives the current string value and returns
 * `true` when it passes, or an error message string when it fails.
 * Async rules (returning a `Promise`) are supported.
 */
export type TInlineEditRule = (value: string) => true | string | Promise<true | string>

/**
 * Props for `<OrigamInlineEdit>` — edit-in-place pattern.
 *
 * The component is intentionally headless on the display side: by
 * default it renders a button-styled span with the current value (or
 * the placeholder when the value is empty); consumers can fully
 * override the affordance via the scoped `#display` slot. In edit
 * mode it renders a native `<input>` (or `<textarea>` when `multiline`
 * is true) — wrapping a heavier component (TextField, …) is not
 * needed and would defeat the keyboard-driven UX.
 */
export interface IInlineEditProps extends ICommonsComponentProps, ITagProps, ITypographyProps {
    /**
     * Current value (v-model target). Accepts both `string` and
     * `number` for ergonomics — the internal draft is normalised to a
     * string, then `update:modelValue` re-emits with the same shape as
     * the original (number stays number, string stays string).
     */
    modelValue: string | number
    /**
     * Placeholder shown on the input AND surfaced inside the default
     * `#display` slot when `modelValue` is empty. Consumers wrap with
     * `t()` if they need i18n.
     */
    placeholder?: string
    /**
     * Array of validation rules using the standard DS contract
     * (same as `OrigamTextField` / `OrigamInput` rules). Each rule
     * is a function receiving the current string value and returning
     * `true` (pass) or an error message string (fail). Rules are
     * evaluated sequentially on confirm; the first failure surfaces
     * as the inline error and blocks the commit.
     *
     * When both `rules` and `validate` are provided, `rules` are
     * evaluated first. If any rule fails, `validate` is skipped.
     * Only the first error message is displayed.
     */
    rules?: Array<TInlineEditRule>
    /**
     * Validation callback. Returns `true` (or `Promise<true>`) when
     * the draft is acceptable, or an error message string that will
     * be surfaced in a `role="alert"` element near the input.
     *
     * Sync validators run on every Enter / blur. Async validators
     * keep the editor open until the returned Promise settles.
     *
     * When both `rules` and `validate` are provided, `rules` are
     * evaluated first. `validate` only runs if all rules pass.
     */
    validate?: TInlineEditValidator
    /**
     * Auto-focus the input when entering edit mode. Setting this to
     * false is useful for forms where keyboard focus is managed by a
     * parent (e.g. a wizard that steps focus through siblings).
     *
     * @default true
     */
    autoFocus?: boolean
    /**
     * Select all the input's text when it gains focus on edit entry.
     * Common for "click title to rename" patterns — the user can
     * immediately type a replacement without selecting first.
     *
     * @default true
     */
    selectOnFocus?: boolean
    /**
     * Confirm the draft when the input loses focus. When false, the
     * editor stays open on blur and the user must explicitly Enter
     * to confirm or Escape to cancel.
     *
     * @default true
     */
    confirmOnBlur?: boolean
    /**
     * Confirm on `Enter`. Disable when the edit zone is a multiline
     * textarea and Enter should produce a newline (Cmd/Ctrl+Enter to
     * confirm is the convention — apps wire this manually).
     *
     * @default true
     */
    confirmOnEnter?: boolean
    /**
     * Cancel (revert the draft) on `Escape`.
     *
     * @default true
     */
    cancelOnEscape?: boolean
    /**
     * Disables the component — the display affordance becomes
     * non-interactive (button `disabled`, span `aria-disabled`), the
     * `edit()` method short-circuits, and any in-flight edit is
     * cancelled (draft discarded).
     *
     * @default false
     */
    disabled?: boolean
    /**
     * Render a `<textarea>` instead of a `<input>` in edit mode.
     * When true, `confirmOnEnter` should generally be disabled by the
     * consumer so newlines are not swallowed.
     *
     * @default false
     */
    multiline?: boolean
    /**
     * Strip surrounding whitespace before emitting `update:modelValue`
     * AND before running the validator. Disable for fields where
     * trailing spaces are significant (passwords, …).
     *
     * @default true
     */
    trim?: boolean
    /**
     * Native HTML input type when not in multiline mode.
     *
     * @default 'text'
     */
    inputType?: TInlineEditInputType
    /**
     * Surface a loading affordance (CSS class hook) on the root while
     * an async `validate` Promise is in flight. The component sets
     * `aria-busy="true"` regardless — this prop only controls the
     * visual hook.
     *
     * @default false
     */
    loadingOnConfirm?: boolean
    /**
     * Render built-in action buttons (Edit / Confirm / Cancel) next to
     * the component.
     *
     * When `false` (default), only keyboard shortcuts are available:
     * Enter to confirm, Escape to cancel, click on the display to edit.
     *
     * When `true`, three icon buttons are rendered:
     * - **Edit** — visible in display mode, enters edit mode on click.
     * - **Confirm** — visible in edit mode, commits the draft on click.
     * - **Cancel** — visible in edit mode, discards the draft on click.
     *
     * The `disabled` prop also disables all three buttons.
     *
     * @default false
     */
    showActions?: boolean
}

/**
 * Emits for `<OrigamInlineEdit>`.
 */
export interface IInlineEditEmits {
    /** Final value after successful validation. Same shape as input. */
    (e: 'update:modelValue', value: string | number): void
    /** Editor entered edit mode (display → input transition). */
    (e: 'edit'): void
    /** Editor exited via cancel — the draft was discarded. */
    (e: 'cancel'): void
    /**
     * Confirmation attempt — fires AFTER validation passes, BEFORE
     * `update:modelValue`. Consumers can intercept the value for
     * server-side persistence; the v-model is updated regardless.
     */
    (e: 'confirm', value: string | number): void
    /** Validator returned an error message (sync or async). */
    (e: 'validate-error', message: string): void
}

/**
 * Bindings exposed by the scoped `#display` slot. Consumers use these
 * to drive any custom affordance (heading, badge, …) into edit mode.
 */
export interface IInlineEditDisplaySlotBindings {
    /** Current value (already coerced to string). */
    value: string
    /** Switches the component into edit mode. */
    edit: () => void
    /** True when the value is empty / nullish — drives placeholder styling. */
    isEmpty: boolean
    /** Resolved placeholder string (with sane fallback). */
    placeholder: string
    /** Mirrors the `disabled` prop, for visual handling. */
    disabled: boolean
}

/**
 * Bindings exposed by the scoped `#edit` slot. Consumers use these to
 * render a fully custom input layout while keeping the same state
 * machine.
 */
export interface IInlineEditEditSlotBindings {
    /** Draft value (two-way; mutate to feed the validator). */
    value: string
    /** Update the draft from the slot. */
    setValue: (next: string) => void
    /** Run the validator and, if it passes, commit the draft. */
    confirm: () => void
    /** Discard the draft and return to display mode. */
    cancel: () => void
    /** Current validation error (null when no error). */
    error: string | null
    /** True while an async validator is in flight. */
    isPending: boolean
}

/**
 * Bindings exposed by the scoped `#actions` slot — typically used to
 * render visible confirm / cancel buttons (X / ✓).
 */
export interface IInlineEditActionsSlotBindings {
    /** Run the validator and commit if it passes. */
    confirm: () => void
    /** Discard the draft and return to display mode. */
    cancel: () => void
    /** True while an async validator is in flight. */
    isPending: boolean
}

/**
 * Slot signatures for `<OrigamInlineEdit>`.
 */
export interface IInlineEditSlots {
    display?: (bindings: IInlineEditDisplaySlotBindings) => any
    edit?: (bindings: IInlineEditEditSlotBindings) => any
    actions?: (bindings: IInlineEditActionsSlotBindings) => any
}

/**
 * Options for the `useInlineEdit` composable.
 */
export interface IUseInlineEditOptions {
    /**
     * Array of validation rules — evaluated in order before `validate`.
     * First failure blocks the commit and surfaces the error message.
     */
    rules?: Array<TInlineEditRule>
    /** Sync or async validator — see `TInlineEditValidator`. */
    validate?: TInlineEditValidator
    /**
     * Strip surrounding whitespace before running the validator and
     * emitting the new value.
     *
     * @default true
     */
    trim?: boolean
    /**
     * Called when the draft is committed. Use this when the composable
     * is consumed outside the SFC's emit pipeline (e.g. inside a
     * unit-test harness or a wrapper composable).
     */
    onConfirm?: (value: string) => void
    /** Called when the draft is discarded. */
    onCancel?: () => void
    /** Called when a validator returns an error message. */
    onError?: (message: string) => void
}
