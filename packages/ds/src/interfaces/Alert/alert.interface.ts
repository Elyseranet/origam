import type {
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    IClickCloseEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IHoverEmits,
    IHoverProps
} from '../Commons/hover.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { IStatusProps } from '../Commons/status.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IAlertProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IDimensionProps, IPaddingProps, IMarginProps, IDensityProps, IElevationProps, ILocationProps, IPositionProps, IRoundedProps, IStatusProps, IHoverProps, IAdjacentProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
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

/** Slot signatures for `<OrigamAlert>`. */
export interface IAlertSlots extends IAdjacentSlots {
    /** Overrides the whole prepend/content/append layout. */
    wrapper?: () => any
    title?: () => any
    text?: () => any
    default?: () => any
    close?: () => any
}
