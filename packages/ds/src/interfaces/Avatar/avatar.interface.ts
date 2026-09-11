import type {
    IActiveEmits,
    IActiveProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IHoverEmits,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ISrcObject,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IAvatarProps extends ICommonsComponentProps, IDensityProps, IRoundedProps, ISizeProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps, ITypographyProps {
    /**
     * Renders an icon inside the avatar (centered). Mutually exclusive
     * with `image` and `text`: image wins, then icon, then text.
     */
    icon?: TIcon,
    image?: string | ISrcObject,
    text?: string
}

/** Emits fired by `<OrigamAvatar>` — active + hover state propagation. */
export interface IAvatarEmits extends IActiveEmits, IHoverEmits {}
