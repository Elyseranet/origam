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
