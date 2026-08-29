import type {
    IFieldEmits,
    IFieldProps,
    IFieldSlots
} from '../Field/field.interface'
import type {
    IInputEmits,
    IInputProps,
    IInputSlots
} from '../Input/input.interface'
import type { IVariantProps } from '../Commons/variant.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TOtpInputFieldType } from '../../types/OtpInputField/otp-input-field.type'

/**
 * `fontWeight` / `lineHeight` / `letterSpacing` / `fontFamily` are typed on
 * `IFieldProps` / `IInputProps` for THEIR OWN components (where each has a
 * real effect — see the corrected typography-paint audit, issue #501), but
 * `<OrigamOtpInputField>` never mounts an `<origam-input>` and only forwards
 * to its per-cell `<origam-field>` with `label` explicitly excluded (see
 * `fieldProps()` in `OrigamOtpInputField.vue`) — so none of those values
 * reach a surface that paints them here. Only `fontSize` does (the visible
 * `.origam-otp-input-field__field` cell). `Omit` strips the inherited
 * surface back down before re-adding exactly what this component supports.
 */
export interface IOtpInputFieldProps extends Omit<IFieldProps, keyof ITypographyProps>, Omit<IInputProps, keyof ITypographyProps>, IVariantProps, Pick<ITypographyProps, 'fontSize'> {
    autofocus?: boolean
    divider?: string
    focusAll?: boolean
    length?: number | string
    modelValue?: number | string | null
    placeholder?: string
    persistentPlaceholder?: boolean
    role?: string
    type?: TOtpInputFieldType
}

export interface IOtpInputFieldEmits extends IFieldEmits, IInputEmits {
    (e: 'finish', value: string): void
    (e: 'click:control', event: MouseEvent): void
    (e: 'mousedown:control', event: MouseEvent): void
    (e: 'click:clear', event: MouseEvent): void
}

export interface IOtpInputFieldSlots extends Omit<IFieldSlots, 'default'>, Omit<IInputSlots, 'default'> {
    /** Generic slot — no slot props. */
    default?: () => any
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
}
