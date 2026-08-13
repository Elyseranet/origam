import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITransitionComponentProps
} from "../../interfaces"

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
