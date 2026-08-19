import type { IColorHsvEmits } from './color-picker.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'

import type {
    TColorType,
    THSVA
} from '../../types/Commons/color.type'

export interface IColorPickerSwatchesProps extends ICommonsComponentProps, IDimensionProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    swatches?: Array<Array<TColorType>>
}

/** Emits fired by `<OrigamColorPickerSwatches>` — click on a swatch tile
 *  pushes the colour up the HSVA channel. */
export interface IColorPickerSwatchesEmits extends IColorHsvEmits {}
