import OrigamSkeleton from '../../components/Skeleton/OrigamSkeleton.vue'
import OrigamSkeletonGroup from '../../components/Skeleton/OrigamSkeletonGroup.vue'
import { SKELETON_ANIMATION, SKELETON_VARIANT } from '../../enums/Skeleton/skeleton.enum'

export type TOrigamSkeleton = InstanceType<typeof OrigamSkeleton>

export type TOrigamSkeletonGroup = InstanceType<typeof OrigamSkeletonGroup>

export type TSkeletonVariant = `${SKELETON_VARIANT}`

export type TSkeletonAnimation = `${SKELETON_ANIMATION}`
