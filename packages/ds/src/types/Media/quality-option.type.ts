/**
 * Single entry of the quality drill-down inside the
 * `<OrigamMediaController>` config menu.
 *
 * Shared shape between `<OrigamVideo>` (which derives it from its
 * `<source>` array) and `<OrigamAudio>` (step 4 — will derive it from
 * its own source array). The `quality` field is the stable identifier
 * passed back via `quality-change`; `label` is the human-readable text
 * shown in the menu.
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
