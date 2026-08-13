import type { OrigamStepper, OrigamStepperItem } from '../../components'
import type { TDirection } from '../Commons/direction.type'

export type TOrigamStepper = InstanceType<typeof OrigamStepper>
export type TOrigamStepperItem = InstanceType<typeof OrigamStepperItem>

/**
 * Layout axis of `<OrigamStepper>`. Mirrors the global `TDirection` so
 * the stepper plays nicely with the rest of the design system's
 * direction props.
 */
export type TStepperOrientation = TDirection

export type TStepperItemStatus = 'pending' | 'active' | 'done' | 'error'
