import type { ComputedRef, Ref } from 'vue'
import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps
} from '../../interfaces'
import type { TIcon } from '../../types'
import type { TStepperItemStatus, TStepperOrientation } from '../../types'

export interface IStepperItem {
    title: string
    subtitle?: string
    icon?: TIcon
    status?: TStepperItemStatus
}

export interface IStepperProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IDensityProps, IDimensionProps, IElevationProps, IMarginProps, IPaddingProps, IRoundedProps, IBorderProps {
    items?: IStepperItem[]
    modelValue?: number
    orientation?: 'horizontal' | 'vertical'
    clickable?: boolean
    showConnectors?: boolean
}

export interface IStepperProvide {
    modelValue: Ref<number>
    orientation: ComputedRef<TStepperOrientation>
    clickable: ComputedRef<boolean>
    color: ComputedRef<string | undefined>
}

export interface IStepperItemProps extends ICommonsComponentProps {
    index?: number
    title?: string
    subtitle?: string
    icon?: TIcon
    status?: TStepperItemStatus
    clickable?: boolean
}

/** Emits fired by `<OrigamStepper>` — v-model echo for the active step. */
export interface IStepperEmits {
    (e: 'update:modelValue', value: number): void
}

/** Slot signatures for `<OrigamStepper>`. */
export interface IStepperSlots {
    /** Overrides the whole auto-generated item list. */
    default?: () => any
}

/** Emits fired by `<OrigamStepperItem>` — click on a clickable step. */
export interface IStepperItemEmits {
    (e: 'click', index: number): void
}
