import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IElevationProps,
    IHoverProps,
    ILocationProps,
    IMarginProps,
    IOverlayProps,
    IPaddingProps,
    IPositionProps,
    IRoundedProps,
    IStatusProps,
    ITagProps,
    ITransitionComponentProps
} from '../../interfaces'

export interface ISnackbarProps extends ICommonsComponentProps, ITagProps, IStatusProps, IColorProps, IBgColorProps, IOverlayProps, IPositionProps, ILocationProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, ITransitionComponentProps, IActiveProps, IHoverProps {
    multiLine?: boolean
    text?: string
    timer?: boolean | string
    timeout?: number | string
    vertical?: boolean
}
