import type { ICommonsComponentProps } from '../Commons/commons.interface'

/**
 * Props for `<OrigamAudioWaveform>` — the peak bars painted behind an
 * audio scrubber.
 *
 * Extracted from `OrigamSliderField` on 2026-09-02 (remarque utilisateur,
 * ligne L169 du classeur d'inspection). It was the ONLY markup the
 * component's second HTML branch owned that the first did not, and it is
 * audio-specific by nature: a form slider has no waveform. Keeping it
 * inside `OrigamSliderField` was what forced that component to carry two
 * whole template branches instead of one.
 *
 * The component is deliberately dumb: it owns no audio state, reads no
 * media element, and does not know what a "current time" is. It draws
 * bars and colours them against a percentage its parent computes.
 */
export interface IAudioWaveformProps extends ICommonsComponentProps {
    /**
     * Peak amplitudes, each expected in `[0..1]`. Values outside that
     * range are clamped, non-finite values become `0` — a waveform is
     * decorative and must never throw on malformed input.
     *
     * An empty array renders nothing at all (no empty `<svg>` left in
     * the DOM).
     */
    peaks?: readonly number[]
    /**
     * Playback position as a percentage in `[0..100]`. Bars at or before
     * it are painted `--active`, the rest `--inactive`.
     *
     * @default 0
     */
    progress?: number
}
