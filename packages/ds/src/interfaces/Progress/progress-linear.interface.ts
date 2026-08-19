import type { ILocationProps } from '../Commons/location.interface'
import type { IProgressTypeProps } from './progress.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IProgressLinearProps extends IProgressTypeProps, IRoundedProps, ILocationProps {
    bufferValue?: number | string
    clickable?: boolean
    reverse?: boolean
    stream?: boolean
}

/** Slot signatures for `<OrigamProgressLinear>`. */
export interface IProgressLinearSlots {
    default?: (data: { value: number, buffer: number }) => any
}
