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
