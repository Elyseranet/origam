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
    /*********************************************************
     * label
     *
     * @description
     * Accessible label announced on the `role="status"` placeholder
     * (aria-label). Carries a LOCALE KEY, not final text — it is resolved
     * through the DS `t()` mechanism, so it follows the active locale out
     * of the box. Defaults to `'origam.loading'`, the shared key also used
     * by Progress / Video / Audio / Switch for this same announcement.
     * @description
     * A raw string that matches no key is returned unchanged, so
     * `label="Loading your invoices"` still works for consumers who prefer
     * to translate on their side.
     ********************************************************/
    label?: string
}

/*********************************************************
 * ISkeletonEmits
 *
 * @description
 * Emits fired by `<OrigamSkeleton>` — none. `loading` drives whether
 * the placeholder or the `#default` slot renders; no state is
 * reported back.
 ********************************************************/
export interface ISkeletonEmits {}
