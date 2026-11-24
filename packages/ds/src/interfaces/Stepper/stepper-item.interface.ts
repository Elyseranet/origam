import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { TIcon } from '../../types/Icon/icon.type'
import type { TStepperItemStatus } from '../../types/Stepper/stepper.type'

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

/*********************************************************
 * IStepperItemSlots
 *
 * @description
 * Slot signatures for `<OrigamStepperItem>`. Indicator icon, title and
 * subtitle stay derived from props; `prepend` / `append` add rich content
 * around them (a status pill, a counter, an action): `prepend` renders
 * before the indicator, `append` after the label. `<OrigamStepper>` forwards
 * them in `items` mode as `item-prepend` / `item-append` (connectors kept).
 ********************************************************/
export interface IStepperItemSlotProps {
    index: number
    status: TStepperItemStatus
}

export interface IStepperItemSlots {
    prepend?: (props: IStepperItemSlotProps) => any
    append?: (props: IStepperItemSlotProps) => any
}
