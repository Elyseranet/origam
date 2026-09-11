import type {
    ICommonsComponentProps,
    IMediaPlayerMethods,
    IMediaPlayerState
} from '../../interfaces'

import type { TAudioLoopMode, TQualityOption } from '../../types'

/**
 * Props for `<OrigamMediaController>` — the universal media-controls
 * shell consumed by `<OrigamVideo>` and `<OrigamAudio>`. Both parents
 * own the `<video>` / `<audio>` element AND the playlist (when one);
 * the Controller is purely presentational and emits intents the
 * parent acts on.
 *
 * The audio-specific contracts (playlist navigation, tri-state loop,
 * shuffle) ship as opt-in props so video consumers see zero
 * regression — pass `:show-loop="false"` etc to keep the legacy
 * video toolbar unchanged.
 *
 * Defaults are inlined inside `withDefaults` (cf. CLAUDE.md
 * `withDefaults` rule) — this interface only types the public API.
 */
export interface IMediaControllerProps extends ICommonsComponentProps {
    /** Reactive media state from `useMediaPlayer()` (or any
     *  specialisation: `useVideoPlayer`, `useAudioPlayer`). Required. */
    state: IMediaPlayerState
    /** Imperative methods from `useMediaPlayer()`. Required. */
    methods: IMediaPlayerMethods
    /** YouTube-style overlay mode: the shell sits on top of the media
     *  surface with a dark gradient and auto-hides on `visible=false`.
     *  When `false`, the shell renders as a regular always-on toolbar.
     *
     *  @default false */
    inset?: boolean
    /** Visibility flag driven by the parent's autohide logic.
     *
     *  @default true */
    visible?: boolean
    /** Available playback rates exposed via the config menu.
     *
     *  @default [0.5, 0.75, 1, 1.25, 1.5, 2] */
    playbackRates?: ReadonlyArray<number>
    /** Enable the cast / AirPlay button (Remote Playback API).
     *
     *  @default false */
    allowRemotePlayback?: boolean
    /** Adds a "Download" row to the config menu.
     *
     *  @default false */
    downloadable?: boolean
    /** URL surfaced to the consumer when "Download" is clicked.
     *
     *  @default null */
    downloadUrl?: string | null
    /** Suggested filename written to the `<a download="…">` attribute.
     *
     *  @default undefined */
    downloadFilename?: string
    /** Optional list of quality variants. When the array exposes ≥ 2
     *  entries, a "Quality" drill-down appears in the config menu.
     *
     *  @default [] */
    qualityOptions?: ReadonlyArray<TQualityOption>
    /** Currently-active quality identifier.
     *
     *  @default null */
    currentQuality?: string | null
    /** Show the "previous" transport button. The parent listens to
     *  the `previous` emit and decides whether to skip back 10s
     *  (single-track) or jump to the previous playlist track.
     *
     *  @default false */
    showPrevious?: boolean
    /** Show the "next" transport button. Parent owns the action.
     *
     *  @default false */
    showNext?: boolean
    /** Show the tri-state loop button (none → all → one → none).
     *
     *  @default false */
    showLoop?: boolean
    /** Show the shuffle toggle button.
     *
     *  @default false */
    showShuffle?: boolean
    /** Current loop mode. Supports `v-model:loopMode`. The Controller
     *  cycles this on click; the parent observes and applies its
     *  playlist / `<audio loop>` policy.
     *
     *  @default 'none' */
    loopMode?: TAudioLoopMode
    /** Current shuffle state. Supports `v-model:shuffle`. The
     *  Controller toggles on click; the parent reads and switches its
     *  next-track resolution accordingly.
     *
     *  @default false */
    shuffle?: boolean
}

/**
 * Emits surfaced by `<OrigamMediaController>`. The shell calls
 * `methods.*` directly for the basic ops (toggle play, seek, set
 * volume, set rate, toggle mute, request cast) — those don't bubble.
 *
 * The emits below are the ones the PARENT must handle because the
 * Controller doesn't own enough context:
 *   - `quality-change` — parent owns the `<source>` swap logic.
 *   - `download`       — parent owns the URL fetch / anchor click.
 *   - `previous` / `next` — parent owns the playlist or skip-time
 *                            policy.
 *   - `update:loopMode` / `update:shuffle` — two-way binding for the
 *                                            transport toggles.
 */
export interface IMediaControllerEmits {
    (e: 'quality-change', quality: string): void
    (e: 'download'): void
    (e: 'previous'): void
    (e: 'next'): void
    (e: 'update:loopMode', mode: TAudioLoopMode): void
    (e: 'update:shuffle', shuffle: boolean): void
}

/**
 * Scoped slots exposed by `<OrigamMediaController>`. Consumers
 * inject media-specific blocks (`<OrigamAudio>` injects header +
 * waveform + footer; `<OrigamVideo>` injects captions/PiP/fullscreen
 * through `extraControlsRight`).
 */
export interface IMediaControllerSlots {
    /** Block rendered ABOVE the scrubber row. `<OrigamAudio>` injects
     *  the cover + metadata strip here; `<OrigamVideo>` typically
     *  leaves it empty. */
    header?: () => any
    /** Replaces the default `<OrigamMediaScrubber>` scrubber row.
     *  Receives `{ state, methods }` so the consumer can paint a
     *  custom scrubber (audio waveform via SliderField variant=audio,
     *  for example) while still routing seeks through `methods.seek`. */
    waveform?: (bindings: { state: IMediaPlayerState; methods: IMediaPlayerMethods }) => any
    /** Block rendered BELOW the transport row. `<OrigamAudio>` injects
     *  the playlist list here. */
    footer?: () => any
    /** Buttons rendered at the start of the transport row, before the
     *  play button. `<OrigamAudio>` can inject custom shuffle / queue
     *  buttons here when the default `showShuffle` placement doesn't
     *  fit. */
    'prepend-transport'?: () => any
    /** Buttons rendered at the end of the transport row, after the
     *  config menu. Consumers add custom buttons (favourite, queue,
     *  …) here. */
    'append-transport'?: () => any
    /** Additional buttons rendered on the left side of the toolbar,
     *  AFTER the time display. Legacy slot — prefer `prepend-transport`. */
    extraControlsLeft?: () => any
    /** Additional buttons rendered on the right side of the toolbar,
     *  BEFORE the config menu. `<OrigamVideo>` injects its captions /
     *  PiP / fullscreen buttons here. */
    extraControlsRight?: () => any
    /** Extra rows in the config menu (audio output device, subtitle
     *  track selector, …). Receives `{ closeMenu }`. */
    configExtra?: (bindings: { closeMenu: () => void }) => any
}
