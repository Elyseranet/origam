import type { IBgColorProps } from '../Commons/color.interface'
import type { IPickerTitleProps } from './picker-title.interface'
import type { ISheetProps } from '../Sheet/sheet.interface'

export interface IPickerProps extends ISheetProps, IBgColorProps, IPickerTitleProps {
    landscape?: boolean
    hideHeader?: boolean
}

/** Slot signatures for `<OrigamPicker>`. */
export interface IPickerSlots {
    title?: () => any
    header?: () => any
    default?: () => any
    actions?: () => any
}
