import type { Ref } from 'vue'

import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IMediaPlayerEmits,
    IMediaPlayerMethods,
    IMediaPlayerState,
    IPaddingProps,
    IRoundedProps,
    ITypographyProps,
    IUseMediaPlayerOptions,
    IVideoSource,
    IVideoTrack
} from '../../interfaces'

import type { TVideoControls } from '../../types'

/**
 * Bindings passed to the `#controls` scoped slot of `<OrigamVideo>`.
 *
 * The default toolbar is built on top of the exact same surface, so a
 * consumer who replaces the slot has access to the full state machine
 * without re-implementing event listeners. State is exposed as plain
 * unwrapped values (snapshot at render time) — Vue's render-driven
 * reactivity re-invokes the slot on every meaningful change.
 */
export interface IVideoScopedSlotBindings {
    /** True while the `<video>` is decoding frames and producing audio. */
    playing: boolean
    /** True when playback is paused (or has not started yet). */
    paused: boolean
    /** Current playhead position in seconds. */
    currentTime: number
    /** Total duration in seconds. `NaN` until metadata is loaded. */
    duration: number
    /** End of the buffered range in seconds (= last byte the browser can play without stalling). */
    buffered: number
    /** Volume between 0 and 1 — independent from `muted`. */
    volume: number
    /** True when the output is muted. Independent from `volume`. */
    muted: boolean
    /** True when the element (or wrapper) is in fullscreen. */
    fullscreen: boolean
    /** True when the video is in picture-in-picture. */
    pip: boolean
    /** True between `loadstart` and `loadedmetadata` — used by the loader overlay. */
    loading: boolean
    /** Set to the most recent media error (if any), else null. */
    error: MediaError | Error | null
    /** Current playback rate (1 = normal). Mirrors the `update:playbackRate` v-model. */
    playbackRate: number
    /** True when at least one Remote Playback target is available on the network. */
    remoteAvailable: boolean
    /** Connection lifecycle from the Remote Playback API:
     *  `'disconnected' | 'connecting' | 'connected'`. */
    remoteState: 'disconnected' | 'connecting' | 'connected'
    /** Imperative actions — wired to the underlying `<video>` element. */
    methods: IVideoPlayerMethods
}

/**
 * Slot signatures for `<OrigamVideo>`.
 */
export interface IVideoSlots {
    /**
     * Full toolbar replacement. Receives the runtime state + the
     * imperative methods. When omitted, the component renders its
     * built-in toolbar (play/pause + scrubber + time + volume +
     * captions + PIP + fullscreen).
     */
    controls?: (bindings: IVideoScopedSlotBindings) => any
    /**
     * Overlay rendered while playback has not yet started
     * (`currentTime === 0 && paused`). When omitted, the component
     * paints the `poster` image as a `background-image` on the
     * `<video>` element via the native attribute.
     */
    poster?: () => any
    /** Overlay rendered while the media is loading. */
    loading?: () => any
    /** Overlay rendered when an error occurred. */
    error?: (bindings: { error: MediaError | Error }) => any
}

/**
 * Props for `<OrigamVideo>`.
 */
export interface IVideoProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IDimensionProps, IRoundedProps, IBorderProps, IMarginProps, IPaddingProps, IElevationProps, ITypographyProps {
    /**
     * Media URL — either a single string for `<video src>`, or an array
     * of `<source>` descriptors when multiple formats are provided. The
     * browser walks the list top-down and picks the first source whose
     * `type` it can decode; pass the most preferred codec first.
     */
    src: string | Array<IVideoSource>
    /**
     * Image rendered before playback starts. Maps to the native
     * `poster` attribute when the `#poster` slot is not used.
     */
    poster?: string
    /**
     * Captions / subtitles / chapter tracks attached to the player.
     * Empty array (the default) renders no `<track>` element.
     *
     * @default []
     */
    tracks?: Array<IVideoTrack>
    /**
     * Starts playback as soon as `loadedmetadata` fires. Browsers
     * usually require `muted` to be true alongside `autoplay`; the
     * component forces `muted=true` when the user passes `autoplay`
     * without an explicit `muted` value.
     *
     * **Accessibility:** `autoplay` is suppressed when the user has
     * requested reduced motion (`prefers-reduced-motion: reduce`).
     *
     * @default false
     */
    autoplay?: boolean
    /**
     * Starts the player muted. Setting `muted=true` together with
     * `autoplay=true` is required for most browsers to allow
     * unattended playback.
     *
     * @default false
     */
    muted?: boolean
    /**
     * Loops playback. The player restarts at `0` when `ended` fires.
     *
     * @default false
     */
    loop?: boolean
    /**
     * Which control surface to render. `'custom'` paints the in-house
     * toolbar; `'native'` exposes the browser's built-in `controls`
     * attribute; `'none'` renders neither so the consumer can drive
     * playback through the `#controls` slot or programmatically.
     *
     * @default 'custom'
     */
    controls?: TVideoControls
    /**
     * Mirrors the native `playsinline` attribute. Required on iOS to
     * keep the player inside the page (otherwise iOS hijacks the
     * playback into the system video viewer). Defaults to `true`
     * because that's the in-page UX we want 99 % of the time.
     *
     * @default true
     */
    playsInline?: boolean
    /**
     * Buffering hint. `'metadata'` (default) loads just enough to
     * compute the duration; `'none'` defers everything until the user
     * presses play; `'auto'` lets the browser pre-buffer as much as it
     * wants.
     *
     * @default 'metadata'
     */
    preload?: 'none' | 'metadata' | 'auto'
    /**
     * CSS `aspect-ratio` value applied to the wrapper. Accepts the
     * presets (`'16/9'`, `'4/3'`, `'1/1'`, `'21/9'`, `'9/16'`) or any
     * raw value (`'2 / 1'`, `'1.85'`, …). The wrapper enforces the
     * ratio via `aspect-ratio` so the player never re-flows the page
     * after metadata loads.
     *
     * @default '16/9'
     */
    aspectRatio?: string
    /**
     * Mirrors the native `crossorigin` attribute. Required when the
     * media or its tracks are served from a CORS-enabled origin and
     * the consumer needs canvas / WebAudio access to the decoded
     * frames. Affects how cookies are sent on the request.
     */
    crossorigin?: 'anonymous' | 'use-credentials'
    /**
     * Disables the picture-in-picture button (and the matching
     * keyboard shortcut). Useful for content where PIP would defeat
     * the experience (e.g. a synced multi-player layout).
     *
     * @default false
     */
    disablePictureInPicture?: boolean
    /**
     * Seconds skipped by the ±skip buttons and by the double-tap
     * gesture on touch devices. Pass `0` to hide the skip buttons.
     *
     * @default 30
     */
    skipSeconds?: number
    /**
     * Show the centered ±skip buttons + play/pause overlay on hover
     * (and always while paused). When `false`, only the bottom
     * toolbar handles play/pause.
     *
     * @default true
     */
    showCenterControls?: boolean
    /**
     * Available playback rates exposed via the config menu.
     *
     * @default [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
     */
    playbackRates?: ReadonlyArray<number>
    /**
     * Initial playback rate. The runtime value is exposed via the
     * `update:playbackRate` emit and the `playbackRate` scoped-slot
     * binding.
     *
     * @default 1
     */
    playbackRate?: number
    /**
     * Layout mode for the bottom toolbar :
     *   - `true` — controls overlaid on the video bottom edge,
     *     auto-hide while playing once the cursor leaves.
     *   - `false` — controls always painted, no auto-hide.
     *
     * @default true
     */
    inset?: boolean
    /**
     * Enable the cast / AirPlay button (Remote Playback API). The
     * button only renders when the browser exposes the API AND at
     * least one cast-capable device is detected. No 3rd-party plugin.
     *
     * @default true
     */
    allowRemotePlayback?: boolean
    /**
     * Enable double-tap gestures on touch devices: tap-tap on the
     * left half = skip backward by `skipSeconds`, on the right half =
     * skip forward.
     *
     * @default true
     */
    doubleTapToSkip?: boolean
    /**
     * Adds a "Download" row to the settings (cog) menu that lets the
     * viewer download the currently-playing video file. The browser's
     * standard download dialog opens — no analytics, no XHR, no server
     * call. Works on every modern browser (uses the native `download`
     * attribute on a hidden `<a>` element).
     *
     * Set to `false` (default) to hide the row, e.g. for licensed
     * content that must stay streamed.
     *
     * @default false
     */
    downloadable?: boolean
    /**
     * Override the downloaded file name. Defaults to the trailing
     * segment of the source URL. Useful when the URL is opaque
     * (e.g. signed-S3 with a hash basename) and you want the file
     * to land in the user's Downloads folder with a clean name.
     */
    downloadFilename?: string
}

/**
 * Emits surfaced by `<OrigamVideo>`. The event names mirror the native
 * DOM events one-to-one so consumers can move between the wrapper and
 * a vanilla `<video>` without re-wiring listeners.
 */
export interface IVideoEmits extends IMediaPlayerEmits {
    (e: 'enterfullscreen'): void
    (e: 'exitfullscreen'): void
    (e: 'enterpip'): void
    (e: 'exitpip'): void
    /** Skip event — positive seconds = forward, negative = backward.
     *  Fired by the centered skip buttons and by the double-tap gesture. */
    (e: 'skip', seconds: number): void
    /** Fired when the viewer picks a different quality from the
     *  settings menu. Payload is the new `quality` identifier (e.g.
     *  "1080p"). Consumers can persist this in localStorage to remember
     *  the choice across sessions. */
    (e: 'quality-change', quality: string): void
    /** Fired when the viewer clicks the "Download" row in the settings
     *  menu. Payload is the URL of the file being downloaded so the
     *  consumer can log analytics or block the download by listening
     *  with `.prevent` if needed. */
    (e: 'download', url: string): void
}

/**
 * Options accepted by `useVideoPlayer`. A subset of the public props
 * (no wrapper concerns like `class`, `aspectRatio`, …) plus a
 * `videoRef` getter so the composable can be wired from outside an
 * `<OrigamVideo>` host.
 *
 * Extends the media-agnostic `IUseMediaPlayerOptions` shape — the
 * video composable composes the media base internally.
 */
export interface IUseVideoPlayerOptions extends Omit<IUseMediaPlayerOptions, 'mediaRef'> {
    /**
     * Resolves to the `HTMLVideoElement` to drive. When omitted, the
     * composable creates an empty ref and expects the consumer to
     * `bind` it on a `<video ref>` themselves.
     */
    videoRef?: Ref<HTMLVideoElement | null>
}

/**
 * Reactive state surface returned by `useVideoPlayer`. Extends the
 * media-shared baseline with video-specific fields (`fullscreen`,
 * `pip`).
 */
export interface IVideoPlayerState extends IMediaPlayerState {
    /** True when the element (or wrapper) is in fullscreen. */
    fullscreen: Ref<boolean>
    /** True when the video is in picture-in-picture. */
    pip: Ref<boolean>
}

/**
 * Imperative methods returned by `useVideoPlayer`. Extends the
 * media-shared baseline with video-specific commands
 * (`toggleFullscreen`, `togglePip`, …).
 */
export interface IVideoPlayerMethods extends IMediaPlayerMethods {
    /** Enter fullscreen (or noop if already in). */
    enterFullscreen: () => Promise<void>
    /** Exit fullscreen (or noop if not in). */
    exitFullscreen: () => Promise<void>
    /** Convenience: enter or exit based on current state. */
    toggleFullscreen: () => Promise<void>
    /** Enter picture-in-picture (or noop if unsupported). */
    requestPip: () => Promise<void>
    /** Exit picture-in-picture (or noop if not in). */
    exitPip: () => Promise<void>
    /** Convenience: enter or exit PIP based on current state. */
    togglePip: () => Promise<void>
}
