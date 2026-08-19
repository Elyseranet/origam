import type { IProgressTypeProps } from './progress.interface'
import type { ISizeProps } from '../Commons/size.interface'

export interface IProgressCircularProps extends IProgressTypeProps, ISizeProps {
    rotate?: string | number
}

/** Slot signatures for `<OrigamProgressCircular>`. */
export interface IProgressCircularSlots {
    default?: (data: { value: number }) => any
}
