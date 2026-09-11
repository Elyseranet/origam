import type {
    IBgColorProps,
    IPickerTitleProps,
    ISheetProps
} from "../../interfaces"

export interface IPickerProps extends ISheetProps, IBgColorProps, IPickerTitleProps {
    landscape?: boolean
    hideHeader?: boolean
}
