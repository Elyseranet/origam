import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { TSkeletonAnimation, TSkeletonVariant } from '../../types/Skeleton/skeleton.type'

export interface ISkeletonProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IRoundedProps, IDimensionProps {
    variant?: TSkeletonVariant
    loading?: boolean
    /*********************************************************
     * animation
     *
     * @description
     * How the placeholder moves: `pulse` (default — an opacity breath),
     * `wave` (a shimmer sweeping across) or `none`. Left unset, a block
     * follows the `<OrigamSkeletonGroup>` it sits in, and falls back to
     * `pulse` outside any group.
     *
     * @description
     * Every animation stops after a finite number of loops
     * (`--origam-skeleton---animation-iterations`, ~10 s) and is switched
     * off under `prefers-reduced-motion: reduce` (WCAG 2.2.2).
     ********************************************************/
    animation?: TSkeletonAnimation
    /*********************************************************
     * label
     *
     * @description
     * Accessible label announced on a STANDALONE placeholder
     * (`role="status"` + `aria-label`). Carries a LOCALE KEY, not final
     * text — it is resolved through the DS `t()` mechanism, so it follows
     * the active locale out of the box. Defaults to `'origam.loading'`, the
     * shared key also used by Progress / Video / Audio / Switch for this
     * same announcement.
     * @description
     * A raw string that matches no key is returned unchanged, so
     * `label="Loading your invoices"` still works for consumers who prefer
     * to translate on their side.
     * @description
     * Ignored inside an `<OrigamSkeletonGroup>`: the group owns the one
     * announcement and its blocks are `aria-hidden`.
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
