/**
 * Single entry of the quality drill-down inside the
 * `<OrigamMediaController>` config menu.
 *
 * Shared shape, actually consumed by two components: `<OrigamVideo>`
 * (derives it from its `<source>` array) and `<OrigamMediaController>`
 * (`qualityOptions` prop). `<OrigamAudio>` will derive it too (step 4 —
 * from its own source array). The `quality` field is the stable
 * identifier passed back via `quality-change`; `label` is the
 * human-readable text shown in the menu.
 *
 * Deliberately filed under `types/Media/` rather than under a single
 * component's folder — a symbol with more than one consumer has no
 * business living under one component's directory (the next consumer
 * wouldn't find it there). `Media` is the DS's assumed shared family
 * for the media-player building blocks (`MediaController`,
 * `MediaScrubber`, `MediaVolumeControl` — no single owning component),
 * the same role `Commons/` plays for the whole DS. Not promoted to
 * `Commons/` itself because the shape (`quality`/`label`/`src`/`type`)
 * is media-source-specific, not a DS-wide generic concept.
 *
 * Lives in `types/` rather than `interfaces/` because the shape is a
 * plain data record — `T`-prefix per project convention.
 */
export type TQualityOption = {
    /** Stable identifier exposed via `quality-change` (e.g. `"1080p"`). */
    quality: string
    /** Human-readable label shown in the menu. */
    label: string
    /** Optional source URL — only used when the parent wants to embed
     *  it inside the option for a one-shot swap. The Controller never
     *  reads this field; consumers do. */
    src?: string
    /** Optional MIME type — same rationale as `src`. */
    type?: string
}
