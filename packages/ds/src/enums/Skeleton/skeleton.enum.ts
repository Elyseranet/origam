/*********************************************************
 * SKELETON_VARIANT
 *
 * @description
 * Shape presets for `<OrigamSkeleton>`. `text`, `rectangular`, `circular`
 * and `pill` are the PRIMITIVES — the bricks a component assembles to mimic
 * its own anatomy, inside an `<OrigamSkeletonGroup>`.
 ********************************************************/
export enum SKELETON_VARIANT {
    TEXT = 'text',
    RECTANGULAR = 'rectangular',
    CIRCULAR = 'circular',
    PILL = 'pill'
}

/*********************************************************
 * SKELETON_ANIMATION
 *
 * @description
 * How a placeholder moves while content is loading. `pulse` is the default:
 * a calm opacity breath. `wave` adds a shimmer that sweeps across the block.
 * `none` is static.
 *
 * @description
 * There is deliberately no spin — a rotating placeholder reads as a spinner,
 * which is `<OrigamLoader>`'s job.
 ********************************************************/
export enum SKELETON_ANIMATION {
    PULSE = 'pulse',
    WAVE = 'wave',
    NONE = 'none'
}
