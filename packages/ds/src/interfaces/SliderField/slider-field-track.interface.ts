import type { IBgColorProps,
    IColorProps, ICommonsComponentProps, IRoundedProps, ISizeProps } from '../../interfaces'

import type { TAlways, TTick } from '../../types'

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
