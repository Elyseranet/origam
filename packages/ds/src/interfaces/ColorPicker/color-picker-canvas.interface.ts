import type { IColorHsvEmits } from './color-picker.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'

import type { THSVA } from '../../types/Commons/color.type'

export interface IColorPickerCanvasProps extends ICommonsComponentProps, IDimensionProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    dotSize?: string | number
    ariaLabel?: string
}

/** Emits fired by `<OrigamColorPickerCanvas>` — drag/click updates the HSVA. */
export interface IColorPickerCanvasEmits extends IColorHsvEmits {}

export interface IColorPickerCanvasSlots {}
