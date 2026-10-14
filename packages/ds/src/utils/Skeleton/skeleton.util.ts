import { SKELETON_ANIMATION } from '../../enums/Skeleton/skeleton.enum'
import type { TSkeletonAnimation } from '../../types/Skeleton/skeleton.type'
import type { ISkeletonGroupProps } from '../../interfaces/Skeleton/skeleton-group.interface'
import type { ISkeletonOverrides, ISkeletonProps } from '../../interfaces/Skeleton/skeleton.interface'

/*********************************************************
 * getSkeletonHostClasses
 *
 * @description
 * The classes that turn ANY element into a placeholder (`.origam--skeleton`
 * and its animation modifier, see `origam-utilities.css`). Shared by
 * `<OrigamSkeleton>` and by the hosts that paint themselves without adding
 * a node (the placeholder `<td>` of `<OrigamDataTableRows>`), so the
 * mapping animation -> class exists once.
 ********************************************************/
export function getSkeletonHostClasses (animation: TSkeletonAnimation | undefined): Array<string | Record<string, boolean>> {
    return [
        'origam--skeleton',
        {
            'origam--skeleton-wave': animation === SKELETON_ANIMATION.WAVE,
            'origam--skeleton-none': animation === SKELETON_ANIMATION.NONE
        }
    ]
}

/*********************************************************
 * splitSkeletonOverrides
 *
 * @description
 * `loading="{ type: 'skeleton', ... }"` carries ONE bag of
 * `Partial<ISkeletonProps>`. A container that composes several primitives
 * inside an `<OrigamSkeletonGroup>` has two targets for it, and the
 * boundary is the same everywhere:
 *
 * - the GROUP owns what is per zone: `animation` (one clock) and `label`
 *   (the one announcement). `loadingText` is the default label, an explicit
 *   `label` in the bag wins.
 * - every PRIMITIVE owns what is per block: `color`, `bgColor`, `rounded`.
 *
 * @description
 * `variant`, `loading`, the dimension props and `size` are deliberately
 * dropped: they describe ONE block's silhouette, and applying one value to
 * every primitive of a composed silhouette would flatten it.
 ********************************************************/
export function splitSkeletonOverrides (
    overrides: unknown,
    loadingText?: string
): ISkeletonOverrides {
    const o = (overrides ?? {}) as Partial<ISkeletonProps>

    const group: ISkeletonGroupProps = {
        animation: o.animation,
        label: o.label ?? loadingText
    }

    const block: Pick<ISkeletonProps, 'color' | 'bgColor' | 'rounded'> = {
        color: o.color,
        bgColor: o.bgColor,
        rounded: o.rounded
    }

    return { group, block }
}
