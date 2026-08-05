# OrigamMediaController

`<OrigamMediaController>` is the universal media-controls shell shared
by `<OrigamVideo>` and `<OrigamAudio>` — it does not own an `<audio>` /
`<video>` element itself. It is purely presentational: the parent binds
the native element via `useMediaPlayer()` (or a specialisation —
`useVideoPlayer` / `useAudioPlayer`) and passes the resulting reactive
`state` and imperative `methods` down as required props. The shell
renders the scrubber row, the play/pause/prev/next transport, the
volume control, the time label, and a config (cog) menu for playback
speed / quality / download — and emits intents (`quality-change`,
`download`, `previous`, `next`, loop/shuffle updates) that only the
parent has enough context to fulfil.

Audio-specific affordances (playlist previous/next, tri-state loop,
shuffle) are opt-in via `show*` props so `<OrigamVideo>` sees zero
behavioural change by default.

The transport row is a `<nav aria-label="…">` landmark. Every icon-only
button (`<origam-btn>`) carries a translated `aria-label`; toggle
buttons (loop, shuffle, cast) also expose `aria-pressed`.

## Basic usage

```vue
<template>
    <audio ref="audioEl" src="/track.mp3" preload="metadata" />

    <origam-media-controller
        :state="state"
        :methods="methods"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OrigamMediaController } from '@origam/components'
import { useMediaPlayer } from '@origam/composables'

const audioEl = ref<HTMLAudioElement | null>(null)
const { state, methods } = useMediaPlayer({ mediaRef: audioEl })
</script>
```

## Real-world integration: OrigamAudio

`<OrigamAudio>` is the reference integration of this shell — it's a
worked example of every surface described on this page: the media
binding, the audio-specific opt-in props, three of the slots, and the
`previous` / `next` / `download` emits.

```vue
<origam-media-controller
    v-model:loop-mode="internalLoopMode"
    v-model:shuffle="internalShuffle"
    :state="state"
    :methods="methods"
    :playback-rates="playbackRates"
    :allow-remote-playback="allowRemotePlayback"
    :downloadable="downloadable"
    :download-url="downloadUrl"
    :download-filename="downloadFilename"
    :show-previous="hasPlaylist"
    :show-next="hasPlaylist"
    :show-loop="true"
    :show-shuffle="hasPlaylist"
    @previous="onPrevious"
    @next="onNext"
    @download="onDownloadClick"
>
    <template #header>
        <!-- cover art + title / artist / album strip -->
    </template>
    <template #waveform>
        <!-- <OrigamSliderField variant="audio"> bound to state.currentTime -->
    </template>
    <template
        v-if="hasPlaylist"
        #footer
    >
        <!-- <OrigamList> of playlist tracks -->
    </template>
</origam-media-controller>
```

(`OrigamAudio.vue:44-193`.) `state` / `methods` come from
`useAudioPlayer()`, a specialisation of `useMediaPlayer()`. Play,
pause, seek, volume, mute, playback-rate, and cast are all resolved by
the shell itself through `methods.*`; `OrigamAudio` only has to
implement `previous` / `next` (playlist navigation vs. ±10 s skip) and
`download` (its own URL-resolution policy), which is exactly the set
of emits this shell doesn't own enough context to resolve on its own
(see [Emits](#emits) below).

## When to use

- You are composing your own media surface (a bespoke `<video>` /
  `<audio>` wrapper) and want the DS transport bar without
  re-implementing play/pause/seek/volume/cast/quality controls.
- You need to inject custom content around the transport (a header,
  a footer, extra buttons) via the component's slots.

When NOT to use:

- Consuming a full player is usually simpler — reach for
  `<OrigamAudio>` or `<OrigamVideo>` directly. `<OrigamMediaController>`
  is the shell THEY compose internally: `<OrigamVideo>` always mounts
  it as its transport bar, and so does `<OrigamAudio>` — by default.
  `<OrigamAudio>`'s `controls` prop defaults to `'custom'`
  (`OrigamAudio.vue:321`), and `isCustomControls` (`OrigamAudio.vue:376`)
  gates a `<origam-media-controller>` mount (`OrigamAudio.vue:44-193`)
  wired to the `state` / `methods` pair from `useAudioPlayer()`. Only
  `controls="native"` opts back out to a bare `<audio controls>`
  element. See [Real-world integration: OrigamAudio](#real-world-integration-origamaudio)
  below.

## Props

`IMediaControllerProps` extends `ICommonsComponentProps` (`id`,
`class`, `style`) — no dimension, spacing, or color Commons interface
is mixed in.

### Required media binding

| Prop | Type | Default | Description |
|---|---|---|---|
| `state` | `IMediaPlayerState` | **required** | Reactive state from `useMediaPlayer()` (or `useVideoPlayer` / `useAudioPlayer`) — `playing`, `paused`, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `ready`, `loading`, `error`, `playbackRate`, `remoteAvailable`, `remoteState`. |
| `methods` | `IMediaPlayerMethods` | **required** | Imperative methods from `useMediaPlayer()` — `play`, `pause`, `toggle`, `seek`, `setVolume`, `toggleMute`, `load`, `skipBackward`, `skipForward`, `setPlaybackRate`, `requestRemotePlayback`, `stopRemotePlayback`. |

### Layout / visibility

| Prop | Type | Default | Description |
|---|---|---|---|
| `inset` | `boolean` | `false` | YouTube-style overlay mode: the shell sits on top of the media surface with a dark gradient and auto-hides on `visible=false`. When `false`, renders as a regular always-on toolbar. |
| `visible` | `boolean` | `true` | Visibility flag driven by the parent's autohide logic — only meaningful when `inset` is `true`. |

### Config menu

| Prop | Type | Default | Description |
|---|---|---|---|
| `playbackRates` | `ReadonlyArray<number>` | `[0.5, 0.75, 1, 1.25, 1.5, 2]` | Rates listed in the Speed drill-down of the cog menu. |
| `allowRemotePlayback` | `boolean` | `false` | Shows the cast button when the Remote Playback API reports an available device (`state.remoteAvailable`). |
| `downloadable` | `boolean` | `false` | Adds a "Download" row to the cog menu. |
| `downloadUrl` | `string \| null` | `null` | URL used by the Download row. Same-origin / `data:` / `blob:` URLs use a native `<a download>`; cross-origin URLs are fetched and routed through a blob URL (the `download` attribute is otherwise ignored cross-origin per spec). |
| `downloadFilename` | `string \| undefined` | `undefined` | Suggested filename for the downloaded file. Falls back to the trailing URL segment. |
| `qualityOptions` | `ReadonlyArray<TQualityOption>` | `[]` | Quality variants (`{ quality, label, src?, type? }`). A "Quality" drill-down appears once the array has ≥ 2 entries. |
| `currentQuality` | `string \| null` | `null` | Currently-active quality identifier, matched against `qualityOptions` to render the appended value in the menu row. |

### Audio-specific transport (opt-in)

| Prop | Type | Default | Description |
|---|---|---|---|
| `showPrevious` | `boolean` | `false` | Shows the "previous" transport button. The component emits `previous`; the parent decides whether that means skip -10 s or jump to a playlist track. |
| `showNext` | `boolean` | `false` | Shows the "next" transport button. Same emit-only contract via `next`. |
| `showLoop` | `boolean` | `false` | Shows the tri-state loop button (cycles `none → all → one → none`). |
| `showShuffle` | `boolean` | `false` | Shows the shuffle toggle button. |
| `loopMode` | `TAudioLoopMode` (`'none' \| 'all' \| 'one'`) | `'none'` | Current loop mode. Supports `v-model:loopMode` — the component cycles it on click and emits `update:loopMode`. |
| `shuffle` | `boolean` | `false` | Current shuffle state. Supports `v-model:shuffle`. |

## Emits

The component calls `methods.*` directly for the operations it can
fully resolve itself (toggle play, seek, set volume, mute, set rate,
request cast) — those do **not** bubble as emits. The events below are
the ones the parent must handle because the shell doesn't own enough
context:

| Event | Payload | Fires |
|---|---|---|
| `quality-change` | `string` (quality id) | User picked a quality from the config menu. The parent owns the `<source>` swap. |
| `download` | — | User clicked the Download row (fired regardless of same-origin/cross-origin routing). |
| `previous` | — | User clicked the "previous" button. |
| `next` | — | User clicked the "next" button. |
| `update:loopMode` | `TAudioLoopMode` | Two-way binding — the internal loop-mode cycle advanced. |
| `update:shuffle` | `boolean` | Two-way binding — the shuffle toggle flipped. |

## Slots

| Slot | Bindings | Default content |
|---|---|---|
| `header` | — | Empty. Rendered above the scrubber row — `<OrigamAudio>` fills it with its cover/metadata strip (see [Real-world integration: OrigamAudio](#real-world-integration-origamaudio)). |
| `waveform` | `{ state: IMediaPlayerState, methods: IMediaPlayerMethods }` | `<origam-media-scrubber>` bound to `state.currentTime` / duration / buffered, wired to `seek` on drag and commit. |
| `footer` | — | Empty. Rendered below the transport row. |
| `prepend-transport` | — | Empty. Rendered at the very start of the transport row's left side, before the previous/play/next buttons. |
| `append-transport` | — | Empty. Rendered at the very end of the transport row's right side, after the config menu. |
| `extraControlsLeft` | — | Empty. Legacy slot rendered on the left side, after the time label — prefer `prepend-transport`. |
| `extraControlsRight` | — | Empty. Rendered on the right side, before the config menu (`<OrigamVideo>` injects captions / PiP / fullscreen buttons here). |
| `configExtra` | `{ closeMenu: () => void }` (typed only — never constructed, see note below) | **Not rendered.** No `<slot name="configExtra">` exists anywhere in the template — the slot has no render site. |

> ⚠️ **`configExtra` doesn't do what it's typed to do.** It's declared
> in `IMediaControllerSlots` (`media-controller.interface.ts:161`) and
> the component even checks `Boolean(slots.configExtra)` inside
> `hasConfigContent` (`OrigamMediaController.vue:426-431`) — so passing
> this slot **can** make the cog button appear when no other config
> content (playback rates / quality options / download) is present.
> But once the menu opens, the slot's content is never inserted: the
> config menu is a single `<origam-menu :items="configMenuItems">`
> (`OrigamMediaController.vue:134-153`) with no default-slot content
> and no `<slot name="configExtra">` anywhere in the template. The
> `closeMenu` binding promised by the type is likewise never
> constructed (no `closeMenu` identifier exists in the component). Net
> effect: a consumer can get an empty/misleading cog button, but
> anything they put in `#configExtra` is silently dropped. This looks
> like a DS bug, not documented behaviour — flagged, not fixed here
> (out of this doc's scope).

## Exposed

`defineExpose` surfaces three internal refs for parent/test access:
`configMenuOpen` (`Ref<boolean>`), `resolvedLoopMode`
(`ComputedRef<TAudioLoopMode>` — read-only; it derives from the
internal `internalLoopMode` ref rather than being that ref itself,
`OrigamMediaController.vue:370`), and `internalShuffle` (`Ref<boolean>`).

## CSS variables

Confirmed against `packages/ds/tokens/component/media-controller.json`
and the generated token sheets (`packages/ds/src/assets/css/tokens/light.css`).
Two variables are seeded by the token build; the others are local SCSS
override hooks with no token entry (their "Default" below is the SCSS
fallback literal).

| Variable | Default (light theme) | Notes |
|---|---|---|
| `--origam-media-controller---color` | `var(--origam-color__text---primary)` | Root foreground color. Token-backed. |
| `--origam-media-controller__scrubber---color` | `var(--origam-color__action--primary---bg)` | Forwarded to the inner `<OrigamMediaScrubber>`'s own `--origam-media-scrubber---color`. Token-backed. |
| `--origam-media-controller---accent-color` | `var(--origam-color__action--primary---bg)` (SCSS fallback, no token entry) | Colors the active state of loop/shuffle/cast buttons (background via `color-mix`). |
| `--origam-media-controller__time---color` | `inherit` (SCSS fallback, no token entry) | Time-label (`mm:ss / mm:ss`) foreground color. |

The scrubber's track/buffer colors
(`--origam-media-scrubber---track-background-color` /
`--origam-media-scrubber---buffer-background-color`) are set
unconditionally from `currentColor` inside the controller's `<style>`
block — they are not exposed as independently-overridable
controller-level variables.

## Accessibility

- The transport row is `<nav aria-label="Transport controls">` (label
  translated via `origam.media.transport`), so it is reachable as a
  landmark.
- Every icon-only button has a translated `aria-label` (play/pause,
  mute/unmute, previous/next, shuffle, loop, cast, settings).
- Toggle-style buttons (shuffle, loop, cast) additionally set
  `aria-pressed` to reflect their boolean state.
- The scrubber exposes `aria-label` (seek) and a live
  `aria-value-text` (formatted current time) via
  `<OrigamMediaScrubber>`.

## Notes

- I was not able to verify runtime interaction behaviour (drag-seek,
  hover tooltip, keyboard activation of the transport buttons, cast
  device negotiation) from a CLI environment — this documents what the
  component and its interfaces establish in code, not an observed
  browser session.
- The download flow's cross-origin fetch→blob routing is exercised by
  `handleDownloadClick` in `OrigamMediaController.vue`; only the
  same-origin/`data:`/`blob:` path is a plain anchor click.
