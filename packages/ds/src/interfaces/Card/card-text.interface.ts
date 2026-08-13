import type {
    IBorderProps,
    ICommonsComponentProps,
    IDensityProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

export interface ICardTextSlots {
    /** Overrides the `text` prop. */
    default?: () => any
}

export interface ICardTextProps extends ICommonsComponentProps, ITagProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, ITypographyProps {
    text?: string | number
}
