import type {
    IActiveProps,
    IBorderProps,
    IBtnProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ITagProps,
    IVariantProps
} from '../../interfaces'

export interface IBtnGroupProps extends ITagProps, ICommonsComponentProps, IRoundedProps, IBorderProps, IDensityProps, IElevationProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IHoverProps, IActiveProps, IVariantProps, ISizeProps {
    divided?: boolean
    items?: Array<IBtnProps>
}

/** Slot signatures for `<OrigamBtnGroup>`. */
export interface IBtnGroupSlots {
    /** Overrides the whole auto-generated `<origam-btn>` list. */
    default?: () => any
    /** One call per item — overrides a single button. */
    item?: (data: { item: IBtnProps, index: number }) => any
}
