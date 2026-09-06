# Composables — Audio

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `useAudioPlayer`

```ts
export function useAudioPlayer (options: IUseOrigamAudioPlayerOptions =
```

Headless audio player composable. Today this is a trivial wrapper
around `useMediaPlayer` — `HTMLAudioElement` does not expose any
extra state or method beyond the media-shared baseline (no
fullscreen, no picture-in-picture). The wrapper exists so:

 - Consumers get a typed `audioRef` (instead of the generic
   `mediaRef: HTMLMediaElement`) at the call site.
 - Future audio-specific extensions (waveform analysis,
   frequency-domain visualisations, Web Audio AnalyserNode wiring,
   AudioWorklet pipes) have a stable home that can grow without
   breaking consumer imports.

**Exemple**

```ts
const audioRef = ref<HTMLAudioElement | null>(null)
const { state, methods } = useAudioPlayer({ audioRef })

// template:
// <audio ref="audioRef" src="…" />
```

**Source** : `packages/ds/src/composables/Audio/use-audio-player.composable.ts`

**Consommateurs** (4) : `components/Audio/OrigamAudio.vue`, `interfaces/Audio/audio-player.interface.ts`, `interfaces/Media/media-controller.interface.ts`, `interfaces/Media/media-player.interface.ts`

## `useWaveform`

```ts
export function useWaveform ( srcRef: Ref<string | undefined | null>, options: IUseWaveformOptions =
```

Headless waveform composable. Decodes the audio referenced by
`srcRef`, downsamples it to `bins` peaks (default 200), and exposes
the resulting array as a reactive ref. The composable is SSR-safe
(every `window` / `AudioContext` access is guarded) and recomputes
automatically whenever the source URL changes.

Algorithm:
1. `fetch(src)` → `ArrayBuffer`.
2. `OfflineAudioContext.decodeAudioData(buffer)` → `AudioBuffer`.
3. Read channel 0 samples via `buffer.getChannelData(0)`.
4. Walk the samples in `bins` buckets; for each bucket, keep the
   maximum absolute amplitude and normalise to `[0, 1]`.

Channel 0 is enough for a thumbnail-grade visual — combining left
and right channels (RMS / max) would cost twice the memory for a
difference invisible at 200-bin resolution.

**Exemple**

```ts
const src = ref('/track.mp3')
const { peaks, isComputing, error } = useWaveform(src, { bins: 200 })
```

**Source** : `packages/ds/src/composables/Audio/use-waveform.composable.ts`

**Consommateurs** (3) : `components/Audio/OrigamAudio.vue`, `consts/Audio/audio.const.ts`, `interfaces/Audio/audio-player.interface.ts`

