import type {
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IHoverProps,
    ILinkProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

export interface IBreadcrumbItemProps extends ICommonsComponentProps, ITagProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, ILinkProps, IColorProps, IBgColorProps, IDensityProps, IAdjacentProps, IHoverProps, IActiveProps {
    title: string
    disabled?: boolean
}

/** Emits fired by `<OrigamBreadcrumbItem>` — clicks on prepend/append icons. */
export interface IBreadcrumbItemEmits extends IAdjacentEmits {}

/** Slot signatures for `<OrigamBreadcrumbItem>`. */
export interface IBreadcrumbItemSlots extends IAdjacentSlots {
    /** Overrides the item's title label. */
    default?: () => any
}
