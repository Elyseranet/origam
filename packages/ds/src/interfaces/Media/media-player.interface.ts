import type { MaybeRefOrGetter, Ref } from 'vue'

/**
 * Reactive state surface returned by `useMediaPlayer` — the
 * media-agnostic base shared between `useVideoPlayer` and
 * `useAudioPlayer`. Fields below describe state that applies to both
 * `HTMLVideoElement` and `HTMLAudioElement`; video-specific extensions
 * (`fullscreen`, `pip`) live in `IVideoPlayerState`.
 */
export interface IMediaPlayerState {
    /** True while the element is decoding frames / producing audio. */
    playing: Ref<boolean>
    /** True when playback is paused (or has not started yet). */
    paused: Ref<boolean>
    /** Current playhead position in seconds. */
    currentTime: Ref<number>
    /**
     * Total duration in seconds. `NaN` until metadata loads. Can be
     * `Infinity` for live streams — consumers must guard `max` UI
     * bindings with `Number.isFinite()`.
     */
    duration: Ref<number>
    /**
     * End of the buffered range in seconds (the right edge of the last
     * contiguous chunk the browser can play without stalling).
     */
    buffered: Ref<number>
    /** Volume between 0 and 1 — independent from `muted`. */
    volume: Ref<number>
    /** True when the output is muted. Independent from `volume`. */
    muted: Ref<boolean>
    /** True once metadata has loaded and `duration` is finite. */
    ready: Ref<boolean>
    /** True between `loadstart` and `loadedmetadata` (or `waiting`). */
    loading: Ref<boolean>
    /** Last media error captured by the composable, if any. */
    error: Ref<MediaError | Error | null>
    /** Current playback rate. `1` = normal speed. */
    playbackRate: Ref<number>
    /** True when at least one Remote Playback device is reachable. */
    remoteAvailable: Ref<boolean>
    /** Connection state of the Remote Playback session. */
    remoteState: Ref<'disconnected' | 'connecting' | 'connected'>
}

/**
 * Imperative methods returned by `useMediaPlayer`. Media-agnostic
 * subset — every method maps 1:1 to the standard `HTMLMediaElement`
 * API. Video-specific commands (`toggleFullscreen`, `togglePip`,
 * `enterFullscreen`, …) live in `IVideoPlayerMethods`.
 */
export interface IMediaPlayerMethods {
    /** Resolve once `el.play()` has settled (or the call has been
     *  swallowed into `state.error`). */
    play: () => Promise<void>
    /** Pause playback. Returns synchronously. */
    pause: () => void
    /** Toggle between play and pause based on the current `playing`
     *  state. Convenience over `if (playing) pause() else play()`. */
    toggle: () => Promise<void>
    /** Seek to `seconds`, clamped to `[0, duration]`. */
    seek: (seconds: number) => void
    /** Set the volume, clamped to `[0, 1]`. Un-mutes when raising
     *  the volume from zero. */
    setVolume: (value: number) => void
    /** Flip the muted flag on the element. */
    toggleMute: () => void
    /** Force a reload of the underlying media element. */
    load: () => void
    /** Jump backward by `seconds`, clamped to [0, duration]. */
    skipBackward: (seconds: number) => void
    /** Jump forward by `seconds`, clamped to [0, duration]. */
    skipForward: (seconds: number) => void
    /** Set the playback rate, clamped to `[0.25, 4]`. */
    setPlaybackRate: (rate: number) => void
    /** Open the native cast / AirPlay device picker. No-op when the
     *  Remote Playback API is unavailable. */
    requestRemotePlayback: () => Promise<void>
    /** Force-disconnect any active Remote Playback session. No-op
     *  when no session is active or the API is unavailable. */
    stopRemotePlayback: () => Promise<void>
}

/**
 * Shared media event signatures. Composables themselves do NOT emit —
 * consumers wire their own emits from the state refs. This interface
 * is kept for documentation + for components that want to surface
 * the same shape on their public emit contract.
 */
export interface IMediaPlayerEmits {
    (e: 'play'): void
    (e: 'pause'): void
    (e: 'ended'): void
    (e: 'timeupdate', currentTime: number): void
    (e: 'volumechange', volume: number): void
    (e: 'loadedmetadata', payload: { duration: number }): void
    (e: 'error', err: MediaError | Error): void
    /** Two-way binding for the playback rate. The component DOES NOT
     *  set this in response to the consumer's prop changes — only when
     *  the user picks a rate from the config menu. */
    (e: 'update:playbackRate', rate: number): void
}

/**
 * Options accepted by `useMediaPlayer`. The composable is media-agnostic
 * — `mediaRef` accepts any `HTMLMediaElement` (audio OR video).
 */
export interface IUseMediaPlayerOptions {
    /**
     * Suppress autoplay when the user has requested reduced motion.
     *
     * @description
     * Accepts a plain `boolean`, a `Ref<boolean>`, or a getter
     * (`() => boolean`) in addition to a literal. `useMediaPlayer` only
     * reads this value LAZILY, inside `bind()` (`onMounted`) — never at
     * the composable's own setup time. A caller building this option
     * from a component prop (e.g. `OrigamAudio`/`OrigamVideo`) MUST pass
     * a getter (`() => props.autoplay`), not `props.autoplay` itself:
     * the latter snapshots the value once, before the ADR-005 theme
     * resolver has had a chance to write a theme default onto
     * `props.autoplay` (see `theme-props-resolver.composable.ts`) — see
     * issue #661.
     */
    autoplay?: MaybeRefOrGetter<boolean>
    /**
     * Initial muted state.
     *
     * @description
     * Same lazy-read contract as `autoplay` above — pass a getter when
     * the value is sourced from a component prop.
     */
    muted?: MaybeRefOrGetter<boolean>
    /** Loop on `ended`. */
    loop?: boolean
    /** Buffering hint. */
    preload?: 'none' | 'metadata' | 'auto'
    /**
     * Resolves to the `HTMLMediaElement` to drive. When omitted, the
     * composable creates an empty ref and expects the consumer to
     * `bind` it on a `<video ref>` / `<audio ref>` themselves.
     */
    mediaRef?: Ref<HTMLMediaElement | null>
}
