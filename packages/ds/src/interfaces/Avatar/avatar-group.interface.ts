import type {
    IActiveEmits,
    IActiveProps,
    IAvatarProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDirectionProps,
    IElevationProps,
    IHoverEmits,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ITagProps
} from "../../interfaces"

export interface IAvatarGroupProps extends ICommonsComponentProps, IDirectionProps, IDensityProps, IRoundedProps, ISizeProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps {
    items?: Array<IAvatarProps>
    max?: number
    expandOnHover?: boolean
    expandOnClick?: boolean
}

/** Emits fired by `<OrigamAvatarGroup>` — propagates active + hover from
 *  the underlying avatars. */
export interface IAvatarGroupEmits extends IActiveEmits, IHoverEmits {}
