import type { IColorHsvEmits, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

import type { THSVA } from "../../types"

export interface IColorPickerPreviewProps extends ICommonsComponentProps, IDimensionProps {
    colorHsv?: THSVA | null
    disabled?: boolean
    hideAlpha?: boolean
}

/** Emits fired by `<OrigamColorPickerPreview>` — alpha slider updates the HSVA. */
export interface IColorPickerPreviewEmits extends IColorHsvEmits {}
