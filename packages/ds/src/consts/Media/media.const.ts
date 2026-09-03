/**
 * Default `<audio>`/`<video preload>` hint forwarded to the native
 * element when no consumer override is provided. `'metadata'` loads
 * just enough to compute the duration without auto-buffering, which
 * is the lightest sane default for the Media composables.
 */
export const MEDIA_DEFAULT_PRELOAD: 'none' | 'metadata' | 'auto' = 'metadata'

/**
 * Default `<audio>`/`<video volume>` (0..1). Full volume — matches the
 * native default but materialised here so `useMediaPlayer`,
 * `<OrigamAudio>` and `<OrigamVideo>` can agree on a single source of
 * truth instead of re-typing the literal.
 */
export const MEDIA_DEFAULT_VOLUME = 1

/*********************************************************
 * MEDIA_MIN_VOLUME / MEDIA_MAX_VOLUME
 *
 * @description
 * Bounds of the `HTMLMediaElement.volume` scale, which `setVolume`
 * clamps to.
 * @description
 * The native setter throws `IndexSizeError` on anything outside the
 * range, so a consumer binding a slider to an unvalidated input would
 * otherwise crash the player.
 * @description
 * `MEDIA_MIN_VOLUME` doubles as the "is the player audible?" threshold
 * used to auto-unmute when the volume is raised from zero.
 ********************************************************/
export const MEDIA_MIN_VOLUME = 0
export const MEDIA_MAX_VOLUME = 1

/*********************************************************
 * MEDIA_DEFAULT_PLAYBACK_RATE
 *
 * @description
 * Default `HTMLMediaElement.playbackRate` — `1` is normal speed.
 ********************************************************/
export const MEDIA_DEFAULT_PLAYBACK_RATE = 1

/*********************************************************
 * MEDIA_MIN_PLAYBACK_RATE / MEDIA_MAX_PLAYBACK_RATE
 *
 * @description
 * Bounds `setPlaybackRate` clamps to.
 * @description
 * Negative rates reverse-play in some engines but are unsupported
 * across the board, and rates above `4` are typically inaudible —
 * neither is a state a consumer benefits from reaching by accident.
 ********************************************************/
export const MEDIA_MIN_PLAYBACK_RATE = 0.25
export const MEDIA_MAX_PLAYBACK_RATE = 4

/*********************************************************
 * MEDIA_UNKNOWN_ERROR_MESSAGE
 *
 * @description
 * Fallback message used when the element fires `error` but exposes no
 * `MediaError` to explain it — some engines null the property on a
 * torn-down source.
 ********************************************************/
export const MEDIA_UNKNOWN_ERROR_MESSAGE = 'Unknown media error'

/*********************************************************
 * MEDIA_AUTOPLAY_SUPPRESSED_WARNING
 *
 * @description
 * Console warning emitted when the consumer asked for `autoplay` but
 * the OS reports `prefers-reduced-motion: reduce`.
 * @description
 * Autoplay is the worst offender for users with vestibular
 * sensitivity, so the accessibility setting wins — the warning exists
 * so the override is not silent.
 ********************************************************/
export const MEDIA_AUTOPLAY_SUPPRESSED_WARNING = '[origam:media] `autoplay` requested but the user prefers reduced motion; autoplay was suppressed.'

/**
 * Smallest span `<OrigamMediaScrubber>` will divide by when converting a
 * value into a track percentage.
 *
 * A media scrubber spends the whole window between mount and
 * `loadedmetadata` on an EMPTY range: `OrigamMediaController` feeds
 * `:max="scrubberMax"`, which stays `0` until `state.duration` becomes
 * finite. Without a floor, `(value - min) / (max - min)` divides by zero
 * and paints `NaN%` offsets on the progress bar and the thumb.
 *
 * This floor guards the DENOMINATOR only. It must never be substituted
 * for the declared maximum itself — doing so leaked `aria-valuemax="1e-7"`
 * into the accessibility tree, a value no consumer ever passed, announced
 * in exponent notation, and contradicting the `aria-valuetext` the
 * controller supplies alongside it.
 */
export const MEDIA_SCRUBBER_MIN_RANGE = 0.0000001
