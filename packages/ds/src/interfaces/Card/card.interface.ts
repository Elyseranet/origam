import type {
    IActiveEmits,
    IActiveProps
} from '../Commons/active.interface'
import type {
    IAdjacentEmits,
    IAdjacentProps
} from '../Commons/adjacent.interface'
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
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverEmits } from '../Commons/hover.interface'
import type { ILinkProps } from '../Commons/router.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TCardType } from '../../types/Card/card.type'

// `IColorProps` exposes `color` / `bgColor` / hover / active colour
// hooks. Pre-fix `ICardProps` did NOT extend it, so a consumer
// `<origam-card color="primary">` was silently a no-op despite Card's
// SCSS reading `var(--origam-card---color)` / `--background`.
// Reported by the user in the audit pass that surfaced the Switch
// `color` regression.
//
// `IActiveProps` adds `active?: boolean` / `activeClass?: string` so
// `useActive` (wired since the hoverColor / activeColor support) can
// vmodel the pressed state and `useColorEffect` resolves `activeColor`
// / `activeBgColor`. The `hover` boolean already lives locally on the
// component (legacy — used as a force-hover flag by `useHover`).
export interface ICardProps extends ICommonsComponentProps, ITagProps, IBorderProps, IColorProps, IBgColorProps, IDensityProps, IDimensionProps, IElevationProps, ILoaderProps, ILocationProps, IPositionProps, IRoundedProps, IMarginProps, IPaddingProps, ILinkProps, IRippleProps, IAdjacentProps, IActiveProps {
    disabled?: boolean
    flat?: boolean
    hover?: boolean
    image?: string
    link?: boolean
    subtitle?: string | number
    text?: string | number
    title?: string | number
    type?: TCardType
}

/** Emits fired by `<OrigamCard>` — prepend/append clicks + active/hover
 *  state propagation. */
export interface ICardEmits extends IAdjacentEmits, IActiveEmits, IHoverEmits {}

/** Slot signatures for `<OrigamCard>`. The `header.*` slots forward into
 *  the nested `<OrigamCardHeader>`'s own named slots. */
export interface ICardSlots {
    /** Overrides the whole loader/header/asset/text/footer layout. */
    wrapper?: () => any
    loader?: () => any
    header?: () => any
    'header.append'?: () => any
    'header.prepend'?: () => any
    'header.title'?: () => any
    'header.subtitle'?: () => any
    'header.content'?: () => any
    asset?: () => any
    text?: () => any
    default?: () => any
    footer?: () => any
}
