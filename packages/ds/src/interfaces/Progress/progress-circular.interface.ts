import type { IProgressTypeProps, ISizeProps } from '../../interfaces'

export interface IProgressCircularProps extends IProgressTypeProps, ISizeProps {
    rotate?: string | number
}

/** Slot signatures for `<OrigamProgressCircular>`. */
export interface IProgressCircularSlots {
    default?: (data: { value: number }) => any
}
