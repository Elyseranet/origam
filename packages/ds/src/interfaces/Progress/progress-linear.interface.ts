import type { ILocationProps, IProgressTypeProps, IRoundedProps } from '../../interfaces'

export interface IProgressLinearProps extends IProgressTypeProps, IRoundedProps, ILocationProps {
    bufferValue?: number | string
    clickable?: boolean
    reverse?: boolean
    stream?: boolean
}
