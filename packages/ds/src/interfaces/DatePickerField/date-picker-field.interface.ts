import type {
    IChipProps,
    IMenuProps,
    ITextFieldProps,
    ITransitionComponentProps
} from "../../interfaces"

export interface IDatePickerFieldProps extends ITextFieldProps, ITransitionComponentProps {
    menu?: boolean,
    menuProps?: IMenuProps,
    range?: boolean
    multiple?: boolean
    openOnClear?: boolean
    closeText?: string
    openText?: string
    closeOnSelect?: boolean
    chipProps?: IChipProps
    closableChips?: boolean
}
