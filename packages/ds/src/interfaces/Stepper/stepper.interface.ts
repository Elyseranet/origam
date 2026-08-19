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

/*********************************************************
 * IStepperItem / IStepperProps / IStepperProvide
 *
 * @description
 * `IStepperItemProps` / `IStepperItemEmits` (the actual
 * `<OrigamStepperItem>` component surface) moved out to
 * `interfaces/Stepper/stepper-item.interface.ts` under issue #364 —
 * this file used to hold both distinct component surfaces
 * (Stepper / StepperItem).
 ********************************************************/
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

/** Emits fired by `<OrigamStepper>` — v-model echo for the active step. */
export interface IStepperEmits {
    (e: 'update:modelValue', value: number): void
}

/** Slot signatures for `<OrigamStepper>`. */
export interface IStepperSlots {
    /** Overrides the whole auto-generated item list. */
    default?: () => any
}
