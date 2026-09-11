import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    ICommonsComponentSlots,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

export interface ILabelProps extends ICommonsComponentProps, IMarginProps, IPaddingProps, IBorderProps, IRoundedProps, IColorProps, IBgColorProps, ITagProps, ITypographyProps {
    text?: string
    floating?: boolean
    required?: boolean
    name?: string
}

export interface ILabelEmits {
    (e: 'click', event: MouseEvent): void
}

export interface ILabelSlots extends ICommonsComponentSlots {
}
