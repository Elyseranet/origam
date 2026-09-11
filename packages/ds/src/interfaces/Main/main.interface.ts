import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

export interface IMainProps extends ITagProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IDimensionProps, IElevationProps, IBgColorProps, IColorProps {
    scrollable?: boolean
}
