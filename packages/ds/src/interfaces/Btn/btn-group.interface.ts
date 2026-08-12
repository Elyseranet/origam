import type {
    IActiveProps,
    IBackdropProps,
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

/** `IBackdropProps` (ADR-005 Q1) — the group's `ghost` variant preset needs
 *  `backdropBlur` on the group root, mirroring `OrigamBtn`. */
export interface IBtnGroupProps extends ITagProps, ICommonsComponentProps, IRoundedProps, IBorderProps, IDensityProps, IElevationProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IHoverProps, IActiveProps, IVariantProps, ISizeProps, IBackdropProps {
    divided?: boolean
    items?: Array<IBtnProps>
}
