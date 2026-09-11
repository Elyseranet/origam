import { AUDIO_VARIANT, COVER_POSITION, POSITION } from '../../enums'

/**
 * Default number of waveform peaks (`bins`) produced by `useWaveform`.
 * 200 is the sweet spot between visual density (one pixel per peak on
 * a 200 px-wide waveform) and decode cost (~5 ms on a 30 s mp3).
 */
export const WAVEFORM_DEFAULT_BINS = 200

/**
 * Canonical defaults for `<OrigamAudio>` — exported for story-side
 * iteration and consumer reference. **Never** referenced from
 * `withDefaults()` itself (the Vue SFC compiler only resolves inline
 * literals there, cf. CLAUDE.md rule).
 */
export const AUDIO_DEFAULTS = {
    tag: 'div',
    variant: AUDIO_VARIANT.EXPANDED,
    coverPosition: COVER_POSITION.LEFT,
    position: POSITION.RELATIVE,
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    controls: 'custom',
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2] as ReadonlyArray<number>,
    playbackRate: 1,
    allowRemotePlayback: false,
    downloadable: false,
    waveform: false,
    waveformColor: 'currentColor'
} as const
