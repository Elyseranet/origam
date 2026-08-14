import type {
    IActivatorProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDimensionProps,
    ILazyProps,
    ILocationStrategyProps,
    IOverlayProps,
    IScrimProps,
    IScrollStrategyProps,
    ITransitionComponentProps,
    ITypographyProps
} from '../../interfaces'

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
