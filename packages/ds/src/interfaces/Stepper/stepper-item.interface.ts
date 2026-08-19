import type { ICommonsComponentProps } from '../../interfaces'
import type { TIcon, TStepperItemStatus } from '../../types'

/*********************************************************
 * IStepperItemProps / IStepperItemEmits
 *
 * @description
 * Props/emits for `<OrigamStepperItem>` — the only consumer. Split out
 * of `interfaces/Stepper/stepper.interface.ts` under issue #364, which
 * used to hold two distinct component surfaces (Stepper / StepperItem)
 * in one file.
 ********************************************************/
export interface IStepperItemProps extends ICommonsComponentProps {
    index?: number
    title?: string
    subtitle?: string
    icon?: TIcon
    status?: TStepperItemStatus
    clickable?: boolean
}

/** Emits fired by `<OrigamStepperItem>` — click on a clickable step. */
export interface IStepperItemEmits {
    (e: 'click', index: number): void
}
