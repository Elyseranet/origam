import type {
    IActiveEmits,
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IHoverEmits,
    ILinkProps,
    ILoaderProps,
    ILocationProps,
    IMarginProps,
    IPaddingProps,
    IPositionProps,
    IRippleProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TCardType } from '../../types'

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
