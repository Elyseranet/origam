import type {
    IActiveEmits,
    IActiveProps
} from '../Commons/active.interface'
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
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IHoverEmits,
    IHoverProps
} from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ISrcObject } from '../Img/img.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IAvatarProps extends ICommonsComponentProps, IDensityProps, IRoundedProps, ISizeProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
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

/** Slot signatures for `<OrigamAvatar>`. Each overrides the matching
 *  auto-rendered content (image / icon / text), `default` overrides the
 *  whole image/icon/text switch. */
export interface IAvatarSlots {
    default?: () => any
    avatar?: () => any
    icon?: () => any
    text?: () => any
}
