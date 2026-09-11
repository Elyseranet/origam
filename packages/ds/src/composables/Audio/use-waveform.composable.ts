import {
    ref,
    type Ref,
    watch
} from 'vue'

import { WAVEFORM_DEFAULT_BINS } from '../../consts/Audio/audio.const'

import type { IUseWaveformOptions } from '../../interfaces'

/**
 * Headless waveform composable. Decodes the audio referenced by
 * `srcRef`, downsamples it to `bins` peaks (default 200), and exposes
 * the resulting array as a reactive ref. The composable is SSR-safe
 * (every `window` / `AudioContext` access is guarded) and recomputes
 * automatically whenever the source URL changes.
 *
 * Algorithm:
 * 1. `fetch(src)` → `ArrayBuffer`.
 * 2. `OfflineAudioContext.decodeAudioData(buffer)` → `AudioBuffer`.
 * 3. Read channel 0 samples via `buffer.getChannelData(0)`.
 * 4. Walk the samples in `bins` buckets; for each bucket, keep the
 *    maximum absolute amplitude and normalise to `[0, 1]`.
 *
 * Channel 0 is enough for a thumbnail-grade visual — combining left
 * and right channels (RMS / max) would cost twice the memory for a
 * difference invisible at 200-bin resolution.
 *
 * @example
 * ```ts
 * const src = ref('/track.mp3')
 * const { peaks, isComputing, error } = useWaveform(src, { bins: 200 })
 * ```
 */
export function useWaveform (
    srcRef: Ref<string | undefined | null>,
    options: IUseWaveformOptions = {}
): {
    peaks: Ref<Array<number>>
    isComputing: Ref<boolean>
    error: Ref<Error | null>
    compute: () => Promise<void>
} {
    const bins = options.bins ?? WAVEFORM_DEFAULT_BINS

    const peaks: Ref<Array<number>> = ref([])
    const isComputing: Ref<boolean> = ref(false)
    const error: Ref<Error | null> = ref(null)

    /**
     * Feature detection — Web Audio is available in every modern
     * browser, but jsdom (Vitest) does not implement it, and older
     * Edge/Safari versions used to expose only the prefixed
     * `webkitAudioContext`. We resolve the actual constructor here
     * (rather than at module load) so the composable can be imported
     * during SSR without throwing.
     */
    function resolveOfflineCtor (): typeof OfflineAudioContext | null {
        if (typeof window === 'undefined') return null
        const win = window as unknown as {
            OfflineAudioContext?: typeof OfflineAudioContext
            webkitOfflineAudioContext?: typeof OfflineAudioContext
        }
        return win.OfflineAudioContext ?? win.webkitOfflineAudioContext ?? null
    }

    /**
     * Single compute pass. Awaits the network + decode round-trip,
     * downsamples the channel into `bins` buckets, and exposes the
     * resulting array. Errors are captured into `error.value` instead
     * of bubbling — the consumer can branch on `error.value !== null`
     * to render a fallback UI (e.g. skip the waveform and show only
     * the scrubber).
     */
    async function compute (): Promise<void> {
        const src = srcRef.value
        peaks.value = []
        error.value = null
        if (!src) return
        if (typeof fetch === 'undefined') return

        const Ctor = resolveOfflineCtor()
        if (!Ctor) {
            error.value = new Error('OfflineAudioContext is not supported in this environment.')
            return
        }

        isComputing.value = true
        try {
            const response = await fetch(src, {
                credentials: options.crossOrigin === 'use-credentials' ? 'include' : 'same-origin',
                // Hint the network stack: we want the bytes, not the
                // decoded media. The browser may still cache the
                // response in the media cache, which is fine — both
                // the player and the waveform decoder end up reading
                // the same entry.
                cache: 'force-cache'
            })
            if (!response.ok) {
                throw new Error(`Failed to fetch audio (HTTP ${response.status}).`)
            }
            const buffer = await response.arrayBuffer()

            // `decodeAudioData` requires an OfflineAudioContext to
            // know the target sample rate up front. Picking 44_100 Hz
            // matches typical MP3 / AAC streams; the actual decoded
            // buffer keeps its own sample rate, but the instance must
            // be valid for the API to accept the call.
            const ctx = new Ctor(1, 44_100, 44_100)
            // Safari (< 14.1) does NOT return a Promise from
            // `decodeAudioData` — it accepts callback arguments
            // instead. Wrap the call so both signatures resolve to
            // the same AudioBuffer.
            const audio = await decodeWithFallback(ctx, buffer)

            const channel = audio.getChannelData(0)
            const samplesPerBin = Math.max(1, Math.floor(channel.length / bins))
            const out: Array<number> = new Array(bins)
            // Single pass through the channel: per bucket, keep the
            // largest absolute amplitude. We do NOT compute RMS here
            // — visually `max` gives a punchier waveform that matches
            // the user's mental model of "loudness".
            for (let bin = 0; bin < bins; bin++) {
                const start = bin * samplesPerBin
                const end = Math.min(start + samplesPerBin, channel.length)
                let peak = 0
                for (let i = start; i < end; i++) {
                    const value = Math.abs(channel[i] ?? 0)
                    if (value > peak) peak = value
                }
                out[bin] = peak
            }

            // Normalise so the loudest bucket is 1. This makes the
            // visual independent from the master volume of the
            // recording — a softly-mastered track and a loudness-war
            // banger render at the same height.
            let maxPeak = 0
            for (const value of out) if (value > maxPeak) maxPeak = value
            if (maxPeak > 0) {
                for (let i = 0; i < out.length; i++) out[i] = out[i] / maxPeak
            }

            peaks.value = out
        } catch (err) {
            error.value = err instanceof Error ? err : new Error(String(err))
        } finally {
            isComputing.value = false
        }
    }

    /**
     * Auto-recompute on src change. The watcher uses `immediate: true`
     * so the first paint already triggers the computation. We deliberately
     * do NOT debounce — the consumer typically passes a stable URL and
     * the cost of a wasted decode on rapid changes is bounded by the
     * `cache: 'force-cache'` hint above.
     */
    watch(srcRef, () => { void compute() }, { immediate: true })

    return { peaks, isComputing, error, compute }
}

/**
 * Wrapper for `decodeAudioData` that accepts the legacy Safari callback
 * signature. Returns a Promise either way.
 */
function decodeWithFallback (
    ctx: OfflineAudioContext,
    buffer: ArrayBuffer
): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
        // The modern signature returns a Promise; if we get one, we
        // chain through it. If we don't (the call returns undefined),
        // the callback form has already been used and the promise
        // settles via the callbacks instead.
        const maybePromise = ctx.decodeAudioData(buffer, resolve, reject) as unknown as Promise<AudioBuffer> | undefined
        if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.then(resolve, reject)
        }
    })
}
