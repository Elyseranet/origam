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
