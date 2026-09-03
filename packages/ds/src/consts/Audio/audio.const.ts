import { AUDIO_VARIANT, COVER_POSITION, POSITION } from '../../enums'

/*********************************************************
 * WAVEFORM_DEFAULT_BINS
 *
 * @description
 * Default number of waveform peaks (`bins`) produced by `useWaveform`.
 * 200 is the sweet spot between visual density (one pixel per peak on
 * a 200 px-wide waveform) and decode cost (~5 ms on a 30 s mp3).
 ********************************************************/
export const WAVEFORM_DEFAULT_BINS = 200

/*********************************************************
 * AUDIO_ANALYSER_FFT_SIZE
 *
 * @description
 * FFT window size handed to the `AnalyserNode` built by `useAudio`.
 *
 * @description
 * Must be a power of two between 32 and 32768 (Web Audio spec). 256
 * yields `frequencyBinCount === 128` usable bins — enough resolution for
 * the visualiser bars while keeping one `getByteFrequencyData` call per
 * animation frame cheap.
 ********************************************************/
export const AUDIO_ANALYSER_FFT_SIZE = 256

/*********************************************************
 * AUDIO_DEFAULTS
 *
 * @description
 * Canonical defaults for `<OrigamAudio>` — exported for story-side
 * iteration and consumer reference. **Never** referenced from
 * `withDefaults()` itself (the Vue SFC compiler only resolves inline
 * literals there, cf. CLAUDE.md rule).
 ********************************************************/
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
