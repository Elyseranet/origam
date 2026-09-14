import type {
    IActiveEmits,
    IActiveProps
} from '../Commons/active.interface'
import type { IAvatarProps } from './avatar.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IHoverEmits,
    IHoverProps
} from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'

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
