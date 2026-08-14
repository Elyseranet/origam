import type {
    IBorderProps,
    ICommonsComponentProps,
    IElevationProps,
    IInputProps,
    IMarginProps,
    IPaddingProps,
    IRadioProps,
    IRoundedProps,
    ISelectionControlGroupProps
} from '../../interfaces'

export interface IRadioGroupProps extends ICommonsComponentProps, Partial<Omit<IRadioProps, 'trueValue' | 'falseValue'>>, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IInputProps, Partial<Omit<ISelectionControlGroupProps, 'multiple'>> {

}

/** Slot signatures for `<OrigamRadioGroup>`. `item` reuses the same
 *  `{id, messagesId, isDisabled, isReadonly, isValid}` scope as
 *  `default` (NOT the individual `item` being rendered — the template
 *  forwards the outer `<OrigamInput>` scope unchanged). */
export interface IRadioGroupSlots {
    default?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
    label?: (data: { label?: string, required?: boolean }) => any
    item?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
}
