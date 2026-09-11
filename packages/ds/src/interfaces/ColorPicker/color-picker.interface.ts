import type {
    IBorderProps,
    IColorPickerCanvasProps,
    IColorPickerEditProps,
    IColorPickerPreviewProps,
    IColorPickerSwatchesProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IPickerProps,
    IRoundedProps
} from "../../interfaces"

import type { TColorModes, THSVA } from "../../types"

/** Shared emit shape for sub-components driving the HSVA model
 *  (Canvas / Edit / Preview / Swatches all push their changes up the
 *  same channel). Factored here so the four sub-component interfaces
 *  can extend it without redeclaring. */
export interface IColorHsvEmits {
    (e: 'update:colorHsv', value: THSVA): void
}

/** Shared emit shape for sub-components that flip between color modes
 *  (RGB / HSL / HSV / HEX, …). */
export interface IColorModeEmits {
    (e: 'update:mode', value: TColorModes): void
}

export interface IColorPickerProps extends ICommonsComponentProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IPickerProps, IColorProps, IColorPickerCanvasProps, IColorPickerPreviewProps, IColorPickerEditProps, IColorPickerSwatchesProps {
    canvasHeight?: string | number
    canvasWidth?: string | number
    hideCanvas?: boolean
    hideSliders?: boolean
    hideInputs?: boolean
    showSwatches?: boolean
    swatchesMaxHeight?: string | number
    modelValue?: Record<string, unknown> | string | undefined | null
}

export interface IColorPickerMode {
    inputProps: Record<string, unknown>
    inputs: Array<{
        [key: string]: any
        label: string
        getValue: (color: any) => number | string
        getColor: (color: any, v: string) => any
    }>
    from: (color: any) => THSVA
    to: (color: THSVA) => any
}

/** Emits fired by `<OrigamColorPicker>` — v-model on the resolved colour
 *  plus the active input mode. */
export interface IColorPickerEmits extends ICommonsComponentEmits, IColorModeEmits {}
