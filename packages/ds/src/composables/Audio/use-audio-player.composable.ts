import { ref, type Ref } from 'vue'

import { useMediaPlayer } from '../Media/use-media-player.composable'

import type {
    IAudioPlayerMethods,
    IAudioPlayerState,
    IUseOrigamAudioPlayerOptions
} from '../../interfaces'

/**
 * Headless audio player composable. Today this is a trivial wrapper
 * around `useMediaPlayer` — `HTMLAudioElement` does not expose any
 * extra state or method beyond the media-shared baseline (no
 * fullscreen, no picture-in-picture). The wrapper exists so:
 *
 *  - Consumers get a typed `audioRef` (instead of the generic
 *    `mediaRef: HTMLMediaElement`) at the call site.
 *  - Future audio-specific extensions (waveform analysis,
 *    frequency-domain visualisations, Web Audio AnalyserNode wiring,
 *    AudioWorklet pipes) have a stable home that can grow without
 *    breaking consumer imports.
 *
 * @example
 * ```ts
 * const audioRef = ref<HTMLAudioElement | null>(null)
 * const { state, methods } = useAudioPlayer({ audioRef })
 *
 * // template:
 * // <audio ref="audioRef" src="…" />
 * ```
 */
export function useAudioPlayer (options: IUseOrigamAudioPlayerOptions = {}): {
    audioRef: Ref<HTMLAudioElement | null>
    state: IAudioPlayerState
    methods: IAudioPlayerMethods
} {
    const audioRef: Ref<HTMLAudioElement | null> = options.audioRef ?? ref(null)

    const { state, methods } = useMediaPlayer({
        autoplay: options.autoplay,
        muted: options.muted,
        loop: options.loop,
        preload: options.preload,
        mediaRef: audioRef as unknown as Ref<HTMLMediaElement | null>
    })

    return {
        audioRef,
        state,
        methods
    }
}
