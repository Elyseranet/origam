import type { IColorHsvEmits, IColorModeEmits, ICommonsComponentProps } from "../../interfaces"

import type { TColorModes, THSVA } from "../../types"

export interface IColorPickerEditProps extends ICommonsComponentProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    mode?: TColorModes
    modes?: Array<TColorModes>
}

/** Emits fired by `<OrigamColorPickerEdit>` — input edits the HSVA and
 *  flips between the active mode. */
export interface IColorPickerEditEmits extends IColorHsvEmits, IColorModeEmits {}
