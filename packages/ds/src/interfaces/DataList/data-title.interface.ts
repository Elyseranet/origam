import type {
    IAdjacentEmits,
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

export interface IDataTitleProps extends ICommonsComponentProps, IAdjacentProps, IDensityProps, IMarginProps, IPaddingProps, IColorProps, IBgColorProps {
    text: string | number
}

/*********************************************************
 * IDataTitleEmits
 *
 * @description
 * Emits fired by `<OrigamDataTitle>` — the prepend/append icon or
 * avatar zones relay `click:prepend` / `click:append` via `useAdjacent`.
 ********************************************************/
export interface IDataTitleEmits extends IAdjacentEmits {}

/** Slot signatures for `<OrigamDataTitle>`. */
export interface IDataTitleSlots extends IAdjacentSlots {
    default?: (data: { text: string | number }) => any
}
