import type { InjectionKey } from 'vue'
import type { ISkeletonGroupProvide } from '../../interfaces/Skeleton/skeleton-group.interface'

/*********************************************************
 * ORIGAM_SKELETON_GROUP_KEY
 *
 * @description
 * Provided by `<OrigamSkeletonGroup>`; read by every `<OrigamSkeleton>` below
 * it, which then follows the group's animation and stays out of the
 * accessibility tree (the group announces the loading ONCE).
 ********************************************************/
export const ORIGAM_SKELETON_GROUP_KEY: InjectionKey<ISkeletonGroupProvide> = Symbol.for('origam:skeleton-group')
