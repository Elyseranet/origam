import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots,
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

/** Slot signatures for `<OrigamCardHeader>`. */
export interface ICardHeaderSlots extends IAdjacentSlots {
    /** Overrides the whole prepend/content/append layout. */
    wrapper?: () => any
    title?: (data: { title: string | number | undefined }) => any
    subtitle?: (data: { subtitle: string | number | undefined }) => any
    default?: () => any
}
