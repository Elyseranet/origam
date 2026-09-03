import type {
    IAdjacentInnerEmits
} from '../Commons/adjacent.interface'
import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type {
    IFieldProps,
    IFieldSlots
} from '../Field/field.interface'
import type {
    IInputProps,
    IInputSlots
} from '../Input/input.interface'
import type { IVariantProps } from '../Commons/variant.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TOtpInputFieldType } from '../../types/OtpInputField/otp-input-field.type'

/*********************************************************
 * IOtpInputFieldProps — typography surface narrowed (issue #501)
 *
 * @description
 * `fontWeight` / `lineHeight` / `letterSpacing` / `fontFamily` are typed on
 * `IFieldProps` / `IInputProps` for THEIR OWN components (where each has a
 * real effect — see the corrected typography-paint audit, issue #501), but
 * `<OrigamOtpInputField>` never mounts an `<origam-input>` and only forwards
 * to its per-cell `<origam-field>` with `label` explicitly excluded (see
 * `fieldProps()` in `OrigamOtpInputField.vue`) — so none of those values
 * reach a surface that paints them here.
 *
 * @description
 * Only `fontSize` does (the visible `.origam-otp-input-field__field` cell).
 * `Omit` strips the inherited surface back down before re-adding exactly
 * what this component supports.
 ********************************************************/
export interface IOtpInputFieldProps extends Omit<IFieldProps, 'fontFamily' | 'fontWeight' | 'lineHeight' | 'letterSpacing'>, Omit<IInputProps, 'fontFamily' | 'fontWeight' | 'lineHeight' | 'letterSpacing'>, IVariantProps, Pick<ITypographyProps, 'fontSize'> {
    autofocus?: boolean
    divider?: string
    focusAll?: boolean
    length?: number | string
    modelValue?: number | string | null
    placeholder?: string
    /**
     * Rôle ARIA de la racine.
     *
     * ⛔ Était déclarée mais JAMAIS lue : le template codait `role="group"`
     * en dur, donc la passer n'avait aucun effet. Elle est désormais liée,
     * avec `'group'` pour défaut — la valeur qui était figée.
     */
    role?: string
    type?: TOtpInputFieldType
}

/**
 * ⛔ Extends `ICommonsComponentEmits` + `IFocusEmits` + `IAdjacentInnerEmits`
 * directly — NOT `IFieldEmits` nor `IInputEmits` wholesale.
 *
 *   - `update:modelValue` (`ICommonsComponentEmits`) — genuinely alive:
 *     `useVModel(props, 'modelValue', …)` (own call, line ~232).
 *   - `update:focused` (`IFocusEmits`) — genuinely alive: `useFocus(props)`
 *     (own call, line ~222).
 *   - `click:appendInner` / `click:prependInner` / `click:clear`
 *     (`IAdjacentInnerEmits`) — `<origam-field>` (one per OTP cell) already
 *     emits all three via its own `useAdjacentInner`; `click:clear` was
 *     already relayed explicitly (`handleClear`); `click:appendInner` /
 *     `click:prependInner` are now relayed the same way (see the
 *     `@click:append-inner` / `@click:prepend-inner` listeners added to
 *     every `<origam-field>` cell in the template).
 *   - `IActiveEmits` (`update:active`) is deliberately EXCLUDED: with N
 *     `<origam-field>` cells per OTP, there is no single coherent "active"
 *     value to expose, and none is wired.
 *   - `IAdjacentEmits` (`click:append` / `click:prepend`, from
 *     `IInputEmits`) is deliberately EXCLUDED: `<OrigamOtpInputField>`
 *     never mounts an `<origam-input>` and renders no outer prepend/append
 *     UI at all — there is no path that could ever fire either event
 *     (issue: guard `unemitted-declarations`,
 *     `OtpInputField:click:append,click:prepend`).
 */
export interface IOtpInputFieldEmits extends ICommonsComponentEmits, IFocusEmits, IAdjacentInnerEmits {
    (e: 'finish', value: string): void
    (e: 'click:control', event: MouseEvent): void
    (e: 'mousedown:control', event: MouseEvent): void
}

export interface IOtpInputFieldSlots extends Omit<IFieldSlots, 'default'>, Omit<IInputSlots, 'default'> {
    /** Generic slot — no slot props. */
    default?: () => any
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
}
