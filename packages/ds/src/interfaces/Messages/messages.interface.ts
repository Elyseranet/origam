import type {
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITransitionComponentProps,
    ITypographyProps
} from '../../interfaces'

export interface IMessagesProps extends ICommonsComponentProps, ITagProps, ITransitionComponentProps, IColorProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, IDensityProps, IElevationProps, ITypographyProps {
    active?: boolean
    messages?: Array<string> | string
}

export interface IMessagesSlots {
    default?: (data: { message: string }) => any
}
