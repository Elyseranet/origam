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

import type { TOtpInputFieldType } from '../../types/OtpInputField/otp-input-field.type'

export interface IOtpInputFieldProps extends IFieldProps, IInputProps, IVariantProps {
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
