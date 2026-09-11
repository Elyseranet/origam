import type { IColorHsvEmits, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

import type { TColorType, THSVA } from "../../types"

export interface IColorPickerSwatchesProps extends ICommonsComponentProps, IDimensionProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    swatches?: Array<Array<TColorType>>
}

/** Emits fired by `<OrigamColorPickerSwatches>` — click on a swatch tile
 *  pushes the colour up the HSVA channel. */
export interface IColorPickerSwatchesEmits extends IColorHsvEmits {}
