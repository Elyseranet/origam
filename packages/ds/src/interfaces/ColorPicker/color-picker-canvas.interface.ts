import type { IColorHsvEmits, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

import type { THSVA } from "../../types"

export interface IColorPickerCanvasProps extends ICommonsComponentProps, IDimensionProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    dotSize?: string | number
    ariaLabel?: string
}

/** Emits fired by `<OrigamColorPickerCanvas>` — drag/click updates the HSVA. */
export interface IColorPickerCanvasEmits extends IColorHsvEmits {}
