import OrigamSkeleton from '../../components/Skeleton/OrigamSkeleton.vue'
import { SKELETON_VARIANT } from '../../enums/Skeleton/skeleton.enum'

export type TOrigamSkeleton = InstanceType<typeof OrigamSkeleton>

export type TSkeletonVariant = `${SKELETON_VARIANT}`
