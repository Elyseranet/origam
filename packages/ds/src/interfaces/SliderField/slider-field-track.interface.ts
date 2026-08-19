import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'

import type {
    TAlways,
    TTick
} from '../../types/SliderField/slider-field.type'

export interface ISliderFieldTrackProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IRoundedProps {
    start?: number
    stop?: number
    disabled?: boolean
    /** Forces `danger` intent on both color channels — driven by the parent
     *  slider's `error` flag. */
    error?: boolean
    /** Boundaries for tick filtering (first / last suppression). */
    min?: number
    max?: number
    /** Orientation hint passed by the parent — controls logical CSS axis. */
    isVertical?: boolean
    /** Inverts the start direction when `reverse` is on or in vertical mode. */
    indexFromEnd?: boolean
    /** Tick visibility. Same semantics as the parent's `showTicks`. */
    showTicks?: TAlways
    /** Tick dot size — px or token unit. */
    tickSize?: number | string
    /** Pre-computed tick descriptors — parent owns the math. */
    ticks?: Array<TTick>
}

/**
 * Slot signatures for `<OrigamSliderFieldTrack>`. `item` and the
 * per-tick `item.{index}` share the same `{ tick, index }` scope — the
 * indexed form is the fallback the un-indexed `item` slot itself falls
 * back to.
 */
export interface ISliderFieldTrackSlots {
    item?: (data: { tick: TTick, index: number }) => any
    [key: `item.${number}`]: ((data: { tick: TTick, index: number }) => any) | undefined
}
