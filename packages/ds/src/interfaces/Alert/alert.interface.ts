import type {
    IAdjacentProps,
    IBorderProps,
    IBgColorProps,
    IClickCloseEmits,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IHoverEmits,
    IHoverProps,
    ILocationProps,
    IMarginProps,
    IPaddingProps,
    IPositionProps,
    IRoundedProps,
    IStatusProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IAlertProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IDimensionProps, IPaddingProps, IMarginProps, IDensityProps, IElevationProps, ILocationProps, IPositionProps, IRoundedProps, IStatusProps, IHoverProps, IAdjacentProps, ITypographyProps {
    closable?: boolean
    closeIcon?: TIcon
    closeLabel?: string
    modelValue?: boolean
    title?: string
    text?: string
}

/** Emits fired by `<OrigamAlert>` — close button, dismissal v-model,
 *  hover propagation. */
export interface IAlertEmits extends ICommonsComponentEmits, IClickCloseEmits, IHoverEmits {}
