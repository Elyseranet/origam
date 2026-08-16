import type { THistoireManifestSource, THistoireStoryDriftKind } from './histoire-manifest.type'

/** One `<Variant>` as the running Histoire server reports it. */
export interface IHistoireServedVariant {
    /** Positional id: `${story.id}-${index}` — what `?variantId=` targets. */
    id: string
    title: string
}

/** One story as the running Histoire server reports it. */
export interface IHistoireServedStory {
    /** Histoire's auto story id — the `/stories/story/<id>` slug. */
    id: string
    title?: string
    variants: IHistoireServedVariant[]
}

/** The whole catalogue served by whatever process answers the Histoire port. */
export interface IHistoireServedManifest {
    /** Which endpoint the catalogue was read from — named in diagnostics. */
    source: THistoireManifestSource
    stories: IHistoireServedStory[]
}

/** One `*.story.vue` as it exists in the current worktree. */
export interface IHistoireLocalStory {
    /** Histoire's auto story id, recomputed from the file's relative path. */
    id: string
    /** Path relative to `packages/stories`, for human-readable diagnostics. */
    relativePath: string
    /** `<Variant title="…">` literals, in source order. */
    staticTitles: string[]
    /**
     * True when every `<Variant>` tag in the file carries a static `title="…"`.
     *
     * When false the file builds at least one Variant dynamically (`:title`,
     * `v-for`, `v-if`), so its runtime list cannot be predicted from source
     * and only a subset check is enforced for that story.
     */
    fullyStatic: boolean
}

/** A single mismatch between the local sources and the served catalogue. */
export interface IHistoireStoryDrift {
    kind: THistoireStoryDriftKind
    storyId: string
    /** Empty for a story the server serves but the worktree does not have. */
    relativePath: string
    /** Variant titles declared locally and absent from the served catalogue. */
    missingTitles: string[]
    /** Variant titles served but absent from the local sources. */
    extraTitles: string[]
}
