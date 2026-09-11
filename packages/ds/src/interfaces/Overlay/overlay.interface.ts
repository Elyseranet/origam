import type {
    IActivatorProps,
    IClickOutsideEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDimensionProps,
    ILazyProps,
    ILocationStrategyProps,
    IScrimProps,
    IScrollStrategyProps,
    ITransitionComponentProps
} from '../../interfaces'

export interface IOverlayProps extends ICommonsComponentProps, IDimensionProps, IActivatorProps, ILocationStrategyProps, IScrollStrategyProps, ILazyProps, ITransitionComponentProps, IScrimProps {
    absolute?: boolean
    attach?: boolean | string | Element
    closeOnBack?: boolean
    contentClass?: string | Array<string>,
    contentProps?: any
    disabled?: boolean
    noClickAnimation?: boolean
    modelValue?: boolean
    zIndex?: number | string
    disableGlobalStack?: boolean
    persistent?: boolean
}

/** Emits fired by `<OrigamOverlay>` — v-model on the open state, outside
 *  click, transition lifecycle hooks, and keyboard bubble. */
export interface IOverlayEmits extends ICommonsComponentEmits, IClickOutsideEmits {
    (e: 'afterEnter'): void
    (e: 'afterLeave'): void
    (e: 'keydown', event: KeyboardEvent): void
}
