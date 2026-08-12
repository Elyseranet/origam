import { OrigamSkeleton } from '../../components'

export type TOrigamSkeleton = InstanceType<typeof OrigamSkeleton>

/**
 * Primitive shape of a single skeleton block.
 *
 * Renamed from the former overloaded `variant` (ADR-005, Q4) — this axis
 * only ever changed how ONE block is painted (line, box, dot), never
 * which DOM tree renders. See `TSkeletonComposition` for the other axis
 * that `variant` used to conflate.
 */
export type TSkeletonShape = 'text' | 'rectangular' | 'circular'

/**
 * Composite layout assembled from several primitive shapes.
 *
 * Renamed from the former overloaded `variant` (ADR-005, Q4). Unlike
 * `TSkeletonShape`, setting a composition selects an entirely different
 * template branch (`OrigamSkeleton.vue`'s `v-else-if`) — it is a
 * structural discriminant, not a style preset, so it never joined the
 * props-preset conversion (family B).
 */
export type TSkeletonComposition = 'card' | 'list-item'
