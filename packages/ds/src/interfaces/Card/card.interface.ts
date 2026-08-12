import type {
    IActiveEmits,
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
    IBackdropProps,
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
//
// `IBackdropProps` (`backdropBlur`) — demo wiring for ADR-005 ticket #21
// (the `IBackdropProps` / `useBackdrop` surface, added to give `ghost`,
// and 15 other existing `backdrop-filter` call sites, a props path instead
// of shipped CSS). Card is the pilot: it already owns
// `--origam-card---backdrop-filter` (default `none`,
// `tokens/component/card.json`), so the prop composes with the EXISTING
// scoped SCSS declaration instead of fighting it — no token default was
// changed, so a Card that doesn't pass `backdropBlur` renders byte-identical
// to before. This is NOT a variant-preset conversion (out of scope for
// ticket #21); it only proves the props → class/style plumbing paints.
export interface ICardProps extends ICommonsComponentProps, ITagProps, IBackdropProps, IBorderProps, IColorProps, IBgColorProps, IDensityProps, IDimensionProps, IElevationProps, ILoaderProps, ILocationProps, IPositionProps, IRoundedProps, IMarginProps, IPaddingProps, ILinkProps, IRippleProps, IAdjacentProps, IActiveProps {
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
