import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

export interface ICounterProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IColorProps, IBgColorProps, IElevationProps, IDensityProps, ITransitionComponentProps {
    active?: boolean
    disabled?: boolean
    max?: string | number
    value?: string | number
}

/** Slot signatures for `<OrigamCounter>`. `value` defaults to `0`
 *  (`withDefaults`) so it's always defined at runtime; `max` has no
 *  default and stays optional. */
export interface ICounterSlots {
    default?: (data: { counter: string, max?: string | number, value: string | number }) => any
}

/*********************************************************
 * ICounterEmits
 *
 * @description
 * Emits fired by `<OrigamCounter>` — none. Purely presentational,
 * displays `value` / `max` without owning any interactive state.
 ********************************************************/
export interface ICounterEmits {}
