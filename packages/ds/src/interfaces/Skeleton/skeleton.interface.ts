import type {
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IRoundedProps,
    ISizeProps
} from '../../interfaces'
import type { TSkeletonVariant } from '../../types'

export interface ISkeletonProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IRoundedProps {
    variant?: TSkeletonVariant
    width?: string | number
    height?: string | number
    loading?: boolean
    pulse?: boolean
}
