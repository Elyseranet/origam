import type { IColorHsvEmits } from './color-picker.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'

import type { THSVA } from '../../types/Commons/color.type'

export interface IColorPickerPreviewProps extends ICommonsComponentProps, IDimensionProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    hideAlpha?: boolean
    ariaLabel?: string
}

/** Emits fired by `<OrigamColorPickerPreview>` — alpha slider updates the HSVA. */
export interface IColorPickerPreviewEmits extends IColorHsvEmits {}

export interface IColorPickerPreviewSlots {}
