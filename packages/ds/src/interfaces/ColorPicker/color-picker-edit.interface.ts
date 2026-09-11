import type {
    IColorHsvEmits,
    IColorModeEmits
} from './color-picker.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'

import type { TColorModes } from '../../types/ColorPicker/color-picker.type'
import type { THSVA } from '../../types/Commons/color.type'

export interface IColorPickerEditProps extends ICommonsComponentProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    mode?: TColorModes
    modes?: Array<TColorModes>
    ariaLabel?: string
}

/** Emits fired by `<OrigamColorPickerEdit>` — input edits the HSVA and
 *  flips between the active mode. */
export interface IColorPickerEditEmits extends IColorHsvEmits, IColorModeEmits {}

export interface IColorPickerEditSlots {}
