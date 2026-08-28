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

export interface IDataTextProps extends ICommonsComponentProps, IAdjacentProps, IDensityProps, IMarginProps, IPaddingProps, IColorProps, IBgColorProps {
    text: string | number
}

/*********************************************************
 * IDataTextEmits
 *
 * @description
 * Emits fired by `<OrigamDataText>` — the prepend/append icon or
 * avatar zones relay `click:prepend` / `click:append` via `useAdjacent`.
 ********************************************************/
export interface IDataTextEmits extends IAdjacentEmits {}

/** Slot signatures for `<OrigamDataText>`. */
export interface IDataTextSlots extends IAdjacentSlots {
    default?: () => any
}
