import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IDirectionProps,
    IElevationProps,
    IFocusEmits,
    IFocusProps,
    IRoundedProps,
    IVariantProps
} from '../../interfaces'

/**
 * Props for `<OrigamConfirmWrapper>` — a "type-it-twice" form helper that
 * pairs a primary input with a confirmation input and lights up only when
 * both values match. Common pattern for password creation, email change,
 * destructive confirmations, etc.
 *
 * Inherits the standard form mixins so it slots into a Field/Form pipeline
 * alongside any other input control.
 */
export interface IConfirmWrapperProps extends ICommonsComponentProps,
    IAdjacentProps, IDirectionProps, IColorProps, IDensityProps,
    IRoundedProps, IElevationProps, IVariantProps, IFocusProps {
    modelValue?: any
    confirm?: any
    field?: string
    defaults?: Record<string, any>
    confirmLabel?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    error?: boolean
    errorMessages?: string | string[]
    hideDetails?: boolean | 'auto'
    messages?: string | string[]
    hint?: string
    persistentHint?: boolean
    centerAffix?: boolean
    label?: string
}

export interface IConfirmWrapperEmits extends ICommonsComponentEmits,
    IAdjacentEmits, IFocusEmits {
    (e: 'update:confirm', value: any): void
}

export interface IConfirmWrapperSlots extends IAdjacentSlots {
    default?: () => any
    confirm?: () => any
    header?: () => any
    title?: (props: any) => any
    messages?: (data: { hasMessages: boolean, messages: string[], messagesId: string }) => any
    message?: (data: { message: string }) => any
    details?: (data: { id: string, messagesId: string, isDirty: boolean, isDisabled: boolean, isReadonly: boolean }) => any
}
