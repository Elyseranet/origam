import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IMarginProps,
    IPaddingProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

export interface ITitleProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IDensityProps, IPaddingProps, IMarginProps, IBorderProps, ITypographyProps {
    text?: string
}
