import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { TSkeletonVariant } from '../../types/Skeleton/skeleton.type'

export interface ISkeletonProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IRoundedProps {
    variant?: TSkeletonVariant
    width?: string | number
    height?: string | number
    loading?: boolean
    pulse?: boolean
}

/** Emits fired by `<OrigamSkeleton>` — none. `loading` drives whether
 *  the placeholder or the `#default` slot renders; no state is
 *  reported back. */
export interface ISkeletonEmits {}
