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
