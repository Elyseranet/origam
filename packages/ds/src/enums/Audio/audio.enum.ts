import { INLINE } from '../Commons/anchor.enum'

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

/**
 * Loop strategy for `<OrigamAudio>` when a playlist is active.
 *
 * - `NONE` — no loop. Playback stops when the last track ends.
 * - `ALL`  — loop the whole playlist. After the last track, wrap to
 *            the first one and keep going.
 * - `ONE`  — loop the current track. The same track restarts at 0
 *            when it ends. Prev / next still navigate the playlist
 *            (loop scope is the track ending, not the user action).
 *
 * The loop button cycles through `NONE → ALL → ONE → NONE …`.
 */
export enum AUDIO_LOOP_MODE {
    NONE = 'none',
    ALL = 'all',
    ONE = 'one'
}

/**
 * Side of the audio surface where the album cover is painted relative
 * to the controller / metadata column. Consumed by `<OrigamAudio>` to
 * flip the flex direction of the layout row.
 *
 * Mirrors `INLINE` (see `Commons/anchor.enum.ts`) 1:1 — both name the
 * same physical inline-axis pair (`left` / `right`). Kept as its own
 * exported symbol for backward compatibility with the public API
 * (`COVER_POSITION.LEFT`), but re-exports `INLINE` rather than
 * redeclaring its values.
 */
export { INLINE as COVER_POSITION }
