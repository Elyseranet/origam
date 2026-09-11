/**
 * Visual variant of `<OrigamAudio>`.
 *
 * - `EXPANDED` — full Stemtracks studio strip: 96 px album cover,
 *                title / artist / album metadata header, mini waveform
 *                scrubber (variant=audio SliderField) above the
 *                transport row. Use as the primary surface on a
 *                "Now playing" page or a podcast hero.
 * - `COMPACT`  — slim transport-only dock: 48 px cover, single inline
 *                metadata strip, no waveform, just the transport row.
 *                Use for sticky bottom-of-screen players or sidebar
 *                mini-players.
 *
 * Legacy alias members (`NORMAL` / `MINIMAL`) are retained for
 * backward compatibility with v0.x consumers — they resolve to the
 * same runtime values as `EXPANDED` / `COMPACT` so the brief swap is
 * a pure additive change.
 */
export enum AUDIO_VARIANT {
    EXPANDED = 'expanded',
    COMPACT = 'compact',
    /** @deprecated Use `EXPANDED` — same runtime value. */
    NORMAL = 'normal',
    /** @deprecated Use `COMPACT` — same runtime value. */
    MINIMAL = 'minimal'
}
