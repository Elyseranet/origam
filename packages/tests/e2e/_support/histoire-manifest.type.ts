/** Which endpoint a served catalogue was read from. */
export type THistoireManifestSource = 'static' | 'dev'

/**
 * Why a story is reported as drifting.
 *
 * - `missing-story`   — declared in the worktree, unknown to the server.
 * - `variant-drift`   — same story id, different Variant list. The failure
 *                       mode that motivated this guard: variant ids are
 *                       positional (`${storyId}-${index}`), so a Variant
 *                       added, removed or reordered since the server built
 *                       its manifest makes `?variantId=…` resolve to the
 *                       wrong Variant, or to nothing at all.
 * - `foreign-story`   — served by the server, absent from the worktree.
 */
export type THistoireStoryDriftKind = 'missing-story' | 'variant-drift' | 'foreign-story'
