import type {
    IAdjacentEmits,
    IAdjacentProps,
    IBorderProps,
    ICommonsComponentProps,
    IDensityProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

export interface ICardHeaderProps extends ITagProps, ICommonsComponentProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, IAdjacentProps, ITypographyProps {
    subtitle?: string | number
    title?: string | number
}

/** Emits fired by `<OrigamCardHeader>` — clicks on prepend/append slots. */
export interface ICardHeaderEmits extends IAdjacentEmits {}
