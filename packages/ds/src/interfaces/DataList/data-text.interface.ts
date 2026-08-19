import type {
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'

import type { TColor } from '../../types/Commons/color.type'

export interface IDataTextProps extends ICommonsComponentProps, IAdjacentProps, IDensityProps, IMarginProps, IPaddingProps, IColorProps, IBgColorProps {
    text: string | number
    /** @deprecated Use the `hover` object prop instead. Kept for back-compat. */
    hoverColor?: TColor
    /** @deprecated Use the `hover` object prop instead. Kept for back-compat. */
    hoverBgColor?: TColor
}

/** Slot signatures for `<OrigamDataText>`. */
export interface IDataTextSlots extends IAdjacentSlots {
    default?: () => any
}
