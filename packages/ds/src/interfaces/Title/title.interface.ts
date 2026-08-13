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

/** Slot signatures for `<OrigamTitle>`. The `default` slot wins over
 *  the `text` prop. */
export interface ITitleSlots {
    default?: () => any
}
