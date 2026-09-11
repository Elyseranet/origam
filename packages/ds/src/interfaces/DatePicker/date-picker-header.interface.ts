import type {
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'

import type { TTransitionProps } from '../../types/Transition/transition.type'

export interface IDatePickerHeaderProps extends ICommonsComponentProps, IColorProps, IAdjacentProps, IDensityProps {
    header?: string
    transition?: TTransitionProps
}

/** Emits fired by `<OrigamDatePickerHeader>` — click on the header text.
 *  `event` is optional: the handler calls `emits('click')` without forwarding
 *  the originating MouseEvent. */
export type IDatePickerHeaderEmits = (e: 'click', event?: MouseEvent) => void

/** Slot signatures for `<OrigamDatePickerHeader>` — `prepend` / `append`
 *  render with no scope (avatar/icon slots), same contract as
 *  `IAdjacentSlots`; `default` (the header text itself) also carries none. */
export interface IDatePickerHeaderSlots extends IAdjacentSlots {
    default?: () => any
}
