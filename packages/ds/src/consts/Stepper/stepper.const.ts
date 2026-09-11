import type { InjectionKey } from 'vue'
import type { IStepperProvide } from '../../interfaces'

export const ORIGAM_STEPPER_KEY: InjectionKey<IStepperProvide> = Symbol.for('origam:stepper')
