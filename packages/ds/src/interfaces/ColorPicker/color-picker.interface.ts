import type { IBorderProps } from '../Commons/border.interface'
import type { IColorPickerCanvasProps } from './color-picker-canvas.interface'
import type { IColorPickerEditProps } from './color-picker-edit.interface'
import type { IColorPickerPreviewProps } from './color-picker-preview.interface'
import type { IColorPickerSwatchesProps } from './color-picker-swatches.interface'
import type { IColorProps } from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type {
    IPickerProps,
    IPickerSlots
} from '../Picker/picker.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TColorModes } from '../../types/ColorPicker/color-picker.type'
import type { THSVA } from '../../types/Commons/color.type'

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

/** Slot signatures for `<OrigamColorPicker>` — thin wrapper forwarding
 *  the exact same slots as the underlying `<OrigamPicker>`. */
export interface IColorPickerSlots extends IPickerSlots {}
