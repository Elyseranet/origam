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
