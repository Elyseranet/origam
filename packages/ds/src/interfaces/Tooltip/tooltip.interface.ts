import type { IActivatorProps } from '../Commons/activator.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { ILocationStrategyProps } from '../Commons/location.interface'
import type { IOverlayProps } from '../Overlay/overlay.interface'
import type { IScrimProps } from '../Overlay/overlay-scrim.interface'
import type { IScrollStrategyProps } from '../Commons/scroll.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ITooltipProps extends ICommonsComponentProps, IOverlayProps, IColorProps, IBgColorProps, IDimensionProps, IActivatorProps, ILocationStrategyProps, IScrollStrategyProps, ILazyProps, ITransitionComponentProps, IScrimProps, ITypographyProps {
    id?: string
    text?: string
}

/** Emits fired by `<OrigamTooltip>` — v-model on the open state. */
export interface ITooltipEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamTooltip>`. */
export interface ITooltipSlots {
    /** Overrides the activator element. Receives the props the overlay
     *  wants bound onto it (`aria-describedby`, event listeners, …) —
     *  mirrors `IMenuSlots.activator`, minus the `isActive` flag that
     *  `<OrigamOverlay>` exposes but `<OrigamTooltip>` doesn't forward. */
    activator?: (data: { props: Record<string, unknown> }) => any
    /** Tooltip body. Falls back to the `text` prop when omitted. */
    default?: () => any
}
