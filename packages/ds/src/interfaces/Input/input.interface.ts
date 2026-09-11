import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IDirectionProps,
    IElevationProps,
    IFocusEmits,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ITypographyProps,
    IValidationProps
} from '../../interfaces'

export interface IInputProps extends ICommonsComponentProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBgColorProps, IBorderProps, IElevationProps, IDimensionProps, IDirectionProps, IValidationProps, IAdjacentProps, ISizeProps, ITypographyProps {
    centerAffix?: boolean
    hideDetails?: boolean | string
    hideSpinButtons?: boolean
    hint?: string
    persistentHint?: boolean
    messages?: Array<string> | string
}

/**
 * Aggregate emits for `<OrigamInput>` — re-exports the v-model echo, the
 * outer prepend/append clicks, and the focus state. Consumers
 * (`<OrigamField>`, downstream typed inputs) consolidate these via
 * `defineEmits<IInputEmits>()`.
 */
export interface IInputEmits extends ICommonsComponentEmits, IAdjacentEmits, IFocusEmits {
}

/**
 * Slot signatures for `<OrigamInput>`. The `default` slot exposes the
 * input control's identity + state so downstream components can wire up
 * their native element with the right ARIA / event handlers.
 */
export interface IInputSlots extends IAdjacentSlots {
    default?: (data: {
        id: string
        messagesId: string
        isDisabled: boolean
        isDirty: boolean
        isValid: boolean | undefined
        isReadonly: boolean
    }) => any
    messages?: (data: { hasMessages: boolean, messages: Array<string> | Record<string, string> }) => any
    message?: (message: any) => any
    details?: (props: any) => any
}
