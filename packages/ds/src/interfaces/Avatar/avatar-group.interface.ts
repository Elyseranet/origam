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

/** Slot signatures for `<OrigamAvatarGroup>`. */
export interface IAvatarGroupSlots {
    /** One call per displayed item — overrides the default `<origam-avatar>`. */
    avatar?: (data: { item: IAvatarProps, index: number }) => any
    /** Overrides the "+N" overflow chip. */
    rest?: (data: { rest: Array<IAvatarProps>, length: number }) => any
    /** Overrides the "+N" label rendered inside the overflow chip. */
    default?: () => any
}
