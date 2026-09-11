import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

export interface IListSubheader extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, ITypographyProps {
    inset?: boolean,
    sticky?: boolean,
    title?: string,
}
