import type { OrigamStepper, OrigamStepperItem } from '../../components'

export type TOrigamStepper = InstanceType<typeof OrigamStepper>
export type TOrigamStepperItem = InstanceType<typeof OrigamStepperItem>

export type TStepperOrientation = 'horizontal' | 'vertical'

export type TStepperItemStatus = 'pending' | 'active' | 'done' | 'error'
