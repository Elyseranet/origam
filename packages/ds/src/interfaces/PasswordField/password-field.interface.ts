import type {
    IAdjacentInnerEmits
} from '../Commons/adjacent.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type {
    IFieldSlots
} from '../Field/field.interface'
import type {
    IInputEmits,
    IInputSlots
} from '../Input/input.interface'
import type { IMenuProps } from '../Menu/menu.interface'
import type { IPasswordRequirement } from './password-requirement.interface'
import type { ITextFieldProps } from '../TextField/text-field.interface'

import type { TIcon } from '../../types/Icon/icon.type'
import type { TPasswordStrengthLevel } from '../../types/PasswordField/password-field.type'

/**
 * Props for `<OrigamPasswordField>` — a TextField specialised for password
 * entry, with three add-ons over a plain TextField:
 *
 *   1. Show/hide toggle on the appendInner icon (`onIcon` / `offIcon`).
 *   2. Optional strength-requirements popup (`requirements` + a set of
 *      `need*` flags + `minLength`). When enabled, a menu opens on focus
 *      and shows a checkmark per met requirement.
 *   3. Each enabled requirement is auto-injected as a validation rule —
 *      consumers don't have to repeat the regex in their `rules` prop.
 *
 * Extends `ITextFieldProps` so anything you can pass to TextField
 * (counter, placeholder, persistentPlaceholder, etc.) flows through.
 */
export interface IPasswordFieldProps extends ITextFieldProps {
    /** Icon shown when the password is HIDDEN (toggle reveals). */
    onIcon?: TIcon
    /** Icon shown when the password is VISIBLE (toggle hides). */
    offIcon?: TIcon
    /** Native maxlength attribute mirrored into the requirements popup. */
    maxlength?: number
    /**
     * Master switch for the strength-requirements popup. When false, the
     * field behaves exactly like a TextField with type="password".
     */
    requirements?: boolean
    /**
     * Keep the requirements popup open even when the field is not focused.
     * Useful for forms that want the requirements always visible.
     */
    persistentRequirements?: boolean
    /** Minimum password length (default 8) — drives the `minLength` rule. */
    minLength?: number
    /** Require at least one lowercase letter. */
    needTiny?: boolean
    /** Require at least one uppercase letter. */
    needUppercase?: boolean
    /** Require at least one digit. */
    needNumber?: boolean
    /** Require at least one non-alphanumeric character. */
    needSpecial?: boolean
    /** Forwarded to the internal `<OrigamMenu>` (location, delays, etc.). */
    menuProps?: IMenuProps
    /** Reserved — toggle the requirements menu programmatically. */
    menu?: boolean
    /**
     * Renders a 4-segment strength bar under the input. Each segment fills
     * as the password gets stronger (weak → fair → good → strong) using
     * `--origam-password-field__strength---bg-{level}` semantic tokens.
     */
    strengthBar?: boolean
    /**
     * Inline requirements checklist (the modern, layout-aware API).
     * Pass an array of `IPasswordRequirement` predicates to render a
     * checklist under the input. When `requirements === true` and
     * `requirementRules` is undefined, the component falls back to
     * `DEFAULT_PASSWORD_REQUIREMENTS` (≥8 chars, ≥1 uppercase, ≥1
     * number, ≥1 special).
     *
     * Distinct from `rules` (inherited from `IValidationProps`) which
     * is the form-level validation rule array — those still flow through
     * to the underlying `<origam-input>`.
     */
    requirementRules?: IPasswordRequirement[]
    /**
     * Layout for the requirements checklist:
     *   - `list` (default) — vertical `<ul>` of `<li>` rows
     *   - `tiles` — wrap of `<OrigamChip>` pills
     */
    requirementsLayout?: 'list' | 'tiles'
    /**
     * Strip every decoration (toggle eye, strength bar, requirements
     * checklist). Useful for confirm-password sub-fields where the
     * adornments would only add noise.
     */
    minimal?: boolean
}

/*********************************************************
 * IPasswordFieldEmits
 *
 * @description
 * ⛔ Extends `IFocusEmits` + `IAdjacentInnerEmits` directly rather than the
 * full `IFieldEmits` — `<OrigamPasswordField>` wraps `<origam-field>`
 * directly (same shape as TextField) and calls its OWN `useFocus(props)`
 * and its OWN `useAdjacent(props)` / `useAdjacentInner(props)`, so
 * `update:focused` / `click:appendInner` / `click:prependInner` are
 * genuinely emitted at THIS level. `IActiveEmits` (`update:active`) is
 * deliberately excluded: PasswordField passes its OWN `isActive || isDirty`
 * computed DOWN to `<origam-field>` as a plain prop, with no
 * `@update:active` listener wired to relay the child's internal toggle —
 * declaring it here promised an event nobody ever fired (issue: guard
 * `unemitted-declarations`, `PasswordField:update:active`).
 ********************************************************/
export interface IPasswordFieldEmits extends IFocusEmits, IAdjacentInnerEmits, IInputEmits {
    (e: 'click:control', event: MouseEvent): void
    (e: 'mousedown:control', event: MouseEvent): void
    /** Fires when the computed strength level changes (v-model:strength). */
    (e: 'update:strength', value: TPasswordStrengthLevel): void
}

export interface IPasswordFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'> {
    /** Renders the strength-requirements popup body (overrides default tile grid). */
    info?: (data: { [key: string]: any }) => any
    /** Renders the counter inside the details slot. */
    counter?: (data: { counter: string, max?: string | number, value: string | number }) => any
    /** Renders the field control (replaces the default `<input>`). */
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
}
