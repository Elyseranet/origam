import type { ComputedRef } from 'vue'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { TSkeletonAnimation } from '../../types/Skeleton/skeleton.type'

export interface ISkeletonGroupProps extends ICommonsComponentProps {
    /*********************************************************
     * animation
     *
     * @description
     * One animation clock for the whole group. `pulse` (default) animates
     * the group container itself, so blocks that mount at different moments
     * still breathe together. `wave` lets each block sweep its own shimmer.
     * `none` is static. Blocks inherit it unless they set their own.
     ********************************************************/
    animation?: TSkeletonAnimation
    /*********************************************************
     * label
     *
     * @description
     * Locale key of the ONE announcement made for the whole zone
     * (`role="status"`, `aria-busy="true"`). Defaults to `'origam.loading'`.
     ********************************************************/
    label?: string
}

/*********************************************************
 * ISkeletonGroupProvide
 *
 * @description
 * Shape provided to the blocks of a group.
 ********************************************************/
export interface ISkeletonGroupProvide {
    animation: ComputedRef<TSkeletonAnimation>
}

export interface ISkeletonGroupEmits {}
