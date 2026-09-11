# OrigamVideo

Lightweight in-house video player. Wraps the native `<video>` element
with a custom toolbar (play/pause, scrubber, volume, captions, PIP,
fullscreen) and exposes a fully-featured headless composable
(`useVideoPlayer`) for consumers who want the state machine without
the default skin.

Zero external dependency — no `plyr`, no `video.js`, no `hls.js`. If
HLS or DASH playback is required for a specific project, plug in
`hls.js` / `dash.js` as a peer dependency from outside the
composable; the underlying `<video>` element accepts whatever the
peer extension attaches to it.

## Quick start

```vue
<template>
    <origam-video
        :src="videoUrl"
        :poster="thumbnailUrl"
        :tracks="[
            { kind: 'captions', src: '/cc-en.vtt', srclang: 'en', label: 'English', default: true },
            { kind: 'captions', src: '/cc-fr.vtt', srclang: 'fr', label: 'Français' }
        ]"
        aspect-ratio="16/9"
        @play="onPlay"
        @ended="onEnded"
    />
</template>
```

## Architecture

`<OrigamVideo>` is **not** a monolith — it composes three building blocks:

```
┌─────────────────────────────────────────────────────────────┐
│  <OrigamVideo>                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ native <video> element                                │  │
│  │   + poster overlay                                    │  │
│  │   + state-pulse / skip-ripple / center-controls       │  │
│  │   + double-tap touch handler                          │  │
│  │   + ResizeObserver-driven autohide                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ <OrigamMediaController>  (shared with <OrigamAudio>)  │  │
│  │   ┌─ scrubber row (using <OrigamMediaScrubber>)       │  │
│  │   ├─ play / volume / time on the left                 │  │
│  │   └─ #extraControlsRight slot (← Video injects here:  │  │
│  │        captions, PiP, fullscreen)                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              │
              └─── powered by useVideoPlayer()
                    └─── extends useMediaPlayer()
```

Key consequences for advanced consumers :

- The custom controls bar comes from
  `<OrigamMediaController>`.
  Captions / PiP / fullscreen buttons are video-specific — `<OrigamVideo>`
  injects them via the controller's `#extraControlsRight` slot. To replace
  the entire bar (e.g. brand-themed skin), use the `#controls` slot below.
- The scrubber and the volume slider both run on
  `<OrigamMediaScrubber>` — same
  pointer-events + keyboard + ARIA contract, no two different drag pipes.
- Reactive state + imperative methods come from `useVideoPlayer({ videoRef })`,
  which extends the media-agnostic `useMediaPlayer` with fullscreen / PiP
  state (`state.fullscreen`, `state.pip`) and methods
  (`enterFullscreen`, `requestPip`, …).

You only need to know this when you want to mount the chrome on top of
your own `<video>` element or compose the same surface from scratch — for
the 99% case, `<OrigamVideo>` Just Works as a drop-in.

## Props

### Source & playback

| Prop                       | Type                                                                       | Default      | Notes                                                                                                  |
|----------------------------|----------------------------------------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------|
| `src`                      | `string \| Array<{ src, type?, quality?, label? }>`                        | —            | Single URL or multi-source list. When ≥ 2 sources expose a `quality` field, the quality switcher renders in the cog menu. Required. |
| `poster`                   | `string`                                                                   | —            | Image rendered before playback starts.                                                                 |
| `tracks`                   | `Array<IVideoTrack>`                                                       | `[]`         | Captions / subtitles / chapter tracks.                                                                 |
| `autoplay`                 | `boolean`                                                                  | `false`      | Suppressed when `prefers-reduced-motion: reduce`.                                                      |
| `muted`                    | `boolean`                                                                  | `false`      | Forced to `true` when `autoplay` is enabled (browser policy).                                          |
| `loop`                     | `boolean`                                                                  | `false`      | Restart at `0` on `ended`.                                                                             |
| `playsInline`              | `boolean`                                                                  | `true`       | Required for in-page playback on iOS.                                                                  |
| `preload`                  | `'none' \| 'metadata' \| 'auto'`                                           | `'metadata'` | Buffering hint passed to the native `preload` attribute.                                               |
| `crossorigin`              | `'anonymous' \| 'use-credentials'`                                         | —            | Mirrors the native `crossorigin` attribute.                                                            |
| `playbackRates`            | `ReadonlyArray<number>`                                                    | `[0.25, …, 2]` | Available speeds in the cog menu drill-down.                                                         |
| `playbackRate`             | `number`                                                                   | `1`          | Initial playback speed; two-way bind via `update:playbackRate`.                                        |

### Layout & chrome

| Prop                       | Type                                          | Default      | Notes                                                                  |
|----------------------------|-----------------------------------------------|--------------|------------------------------------------------------------------------|
| `controls`                 | `'custom' \| 'native' \| 'none'`              | `'custom'`   | Toolbar rendering strategy. `custom` = YouTube-style two-row chrome.   |
| `aspectRatio`              | `string`                                      | `'16/9'`     | CSS `aspect-ratio` value — `'16/9'`, `'4/3'`, raw `'2 / 1'`, …         |
| `inset`                    | `boolean`                                     | `true`       | Auto-hide toolbar while playing once the cursor leaves the player.     |
| `showCenterControls`       | `boolean`                                     | `true`       | Show the centred play/pause + skip-backward + skip-forward overlay on hover and while paused. Set to `false` to keep only the chrome bar at the bottom. |
| `skipSeconds`              | `number`                                      | `30`         | Seconds the double-tap skip jumps; also the value shown in the ripple. |

### Interactions

| Prop                       | Type                                          | Default      | Notes                                                                                                  |
|----------------------------|-----------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------|
| `doubleTapToSkip`          | `boolean`                                     | `true`       | Two clicks within 300 ms on the same side trigger a `skipSeconds` jump. When off, every tap is a plain toggle. |
| `disablePictureInPicture`  | `boolean`                                     | `false`      | Disables the PIP button and the matching shortcut.                                                     |
| `allowRemotePlayback`      | `boolean`                                     | `true`       | Show the cast / AirPlay button when the browser exposes the Remote Playback API.                       |

### Download

| Prop                       | Type                                          | Default      | Notes                                                                                                  |
|----------------------------|-----------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------|
| `downloadable`             | `boolean`                                     | `false`      | Adds a "Download" row to the cog menu; triggers a native browser download via a hidden `<a download>`. |
| `downloadFilename`         | `string`                                      | —            | Overrides the basename derived from the URL. Useful for signed S3 URLs.                                |

### Typography props (`ITypographyProps`) — state-overlay surfaces

| Prop            | Type          | Default     | Surfaces with visual effect                                          |
|-----------------|---------------|-------------|----------------------------------------------------------------------|
| `fontSize`      | `TFontSize`   | `undefined` | `video__loading` (font-size), `video--error` (font-size)             |
| `fontWeight`    | `TFontWeight` | `undefined` | No SCSS rule in current surfaces — prop accepted, var emitted, no visible effect |
| `lineHeight`    | `TLineHeight` | `undefined` | No SCSS rule in current surfaces — prop accepted, var emitted, no visible effect |
| `letterSpacing` | `TLetterSpacing` | `undefined` | No SCSS rule in current surfaces — prop accepted, var emitted, no visible effect |
| `fontFamily`    | `TFontFamily` | `undefined` | No SCSS rule in current surfaces — prop accepted, var emitted, no visible effect |

> Both surfaces are state-conditional overlays. `video__loading` appears while the player is fetching media; `video--error` appears when playback fails. The CSS var is always emitted via inline `:style`; the rendered effect requires the player to be in the matching state.

## Emits

| Event                | Payload                  | Notes                                                                                              |
|----------------------|--------------------------|----------------------------------------------------------------------------------------------------|
| `play`               | —                        | Fired on the native `play` event.                                                                  |
| `pause`              | —                        | Fired on the native `pause` event.                                                                 |
| `ended`              | —                        | Fired on the native `ended` event.                                                                 |
| `timeupdate`         | `currentTime: number`    | Approximately every 250ms during playback.                                                         |
| `volumechange`       | `volume: number`         | Fires for both volume slides and mute toggles.                                                     |
| `enterfullscreen`    | —                        | Fired after the wrapper enters fullscreen.                                                         |
| `exitfullscreen`     | —                        | Fired after the wrapper leaves fullscreen.                                                         |
| `enterpip`           | —                        | Fired on `enterpictureinpicture`.                                                                  |
| `exitpip`            | —                        | Fired on `leavepictureinpicture`.                                                                  |
| `loadedmetadata`     | `{ duration: number }`   | Fired once metadata is ready.                                                                      |
| `error`              | `MediaError \| Error`    | Surfaces the native `videoEl.error` payload.                                                       |
| `skip`               | `seconds: number`        | Positive = forward, negative = backward. Fired by the double-tap gesture.                          |
| `update:playbackRate`| `rate: number`           | Two-way bind for the playback rate. Only emitted on user-driven changes from the cog menu.         |
| `quality-change`     | `quality: string`        | Fired when the viewer picks a new quality. Persist in `localStorage` if you want it to stick.      |
| `download`           | `url: string`            | Fired when the "Download" row is clicked. Payload is the URL of the file being downloaded.         |

## Click & double-click — YouTube parity

- **Single click on the video surface** → toggles play/pause after a 280 ms deferral. The delay lets the second click of a potential double-tap arrive in time to cancel the toggle.
- **Double click on the SAME side within 300 ms** (when `doubleTapToSkip` is on) → cancels the pending toggle and skips by `skipSeconds`. A YouTube-style half-disk ripple appears on the corresponding side with the chevrons + `{N} seconds` label.
- **Double click on DIFFERENT sides** → falls through; the first tap's pending toggle eventually fires.

A 600 ms **state pulse** (purely cosmetic, `pointer-events: none`) flashes the play or pause icon at the centre of the video whenever the state toggles, matching YouTube's visual confirmation.

## Quality switcher

```vue
<origam-video
    :src="[
        { src: '/movie-1080.mp4', type: 'video/mp4', quality: '1080p' },
        { src: '/movie-720.mp4',  type: 'video/mp4', quality: '720p'  },
        { src: '/movie-480.mp4',  type: 'video/mp4', quality: '480p'  }
    ]"
    @quality-change="(q) => localStorage.setItem('preferredQuality', q)"
/>
```

When ≥ 2 sources expose distinct `quality` values, the cog menu shows a "Quality" drill-down. Selecting a quality captures the `currentTime` + paused state, swaps `video.src`, then restores playback position once `loadedmetadata` re-fires. Sources without a `quality` field are kept as codec siblings of every quality (useful for `mp4 + webm` pairs under each resolution).

## Download

```vue
<origam-video :src="videoUrl" :downloadable="true" />

<!-- Custom filename (e.g. signed S3 URL with opaque basename) -->
<origam-video
    :src="signedS3Url"
    :downloadable="true"
    download-filename="my-presentation-2026.mp4"
/>
```

Adds a "Download" row to the cog menu. Clicking it triggers the browser's native download dialog via a hidden `<a download>` element — no XHR, no server call. Emits `@download(url)` so consumers can log analytics.

## Slots

| Slot       | Bindings                                                                                                                                              | Notes                                                          |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `controls` | `{ playing, paused, currentTime, duration, buffered, volume, muted, fullscreen, pip, loading, error, methods }`                                       | Full toolbar replacement.                                      |
| `poster`   | —                                                                                                                                                     | Custom overlay before playback starts.                         |
| `loading`  | —                                                                                                                                                     | Custom loading spinner.                                        |
| `error`    | `{ error }`                                                                                                                                           | Custom error overlay.                                          |

`methods` exposes the imperative driver:

```ts
{
    play: () => Promise<void>
    pause: () => void
    seek: (seconds: number) => void
    setVolume: (value: number) => void
    toggleMute: () => void
    toggleFullscreen: () => Promise<void>
    togglePip: () => Promise<void>
}
```

## Tracks (WebVTT)

Tracks are declared via the `tracks` prop and rendered as native
`<track>` children of the `<video>`. The WebVTT format is required:

```text
WEBVTT

00:00:00.000 --> 00:00:04.000
The big buck bunny prepares for its enemies.

00:00:04.000 --> 00:00:08.000
English caption track.
```

The toolbar exposes a captions toggle when at least one `captions` or
`subtitles` track is declared. Clicking it cycles the active track
through the list of declared kinds (`'showing'` ↔ `'disabled'`). The
first track with `default: true` is the one enabled on load.

## Fullscreen / PIP support matrix

| Browser            | Fullscreen                            | Picture-in-picture                |
|--------------------|----------------------------------------|------------------------------------|
| Chromium 120+      | `requestFullscreen()` on the wrapper. | `requestPictureInPicture()`.       |
| Firefox 121+       | `requestFullscreen()` on the wrapper. | `requestPictureInPicture()`.       |
| Safari (desktop)   | `requestFullscreen()` on the wrapper. | `requestPictureInPicture()`.       |
| Safari iOS         | `webkitEnterFullscreen()` on `<video>` (system viewer). | Not supported.            |

The PIP button is hidden when `document.pictureInPictureEnabled` is
falsy. The fullscreen button is always visible — Safari iOS falls
back to `webkitEnterFullscreen` on the element itself.

## Accessibility

- The `<video>` element carries native semantics (already
  recognised by every modern screen reader).
- Custom toolbar buttons are `<button>` elements with dynamic
  `aria-label` (e.g. *"Play"* → *"Pause"*, *"Mute"* → *"Unmute"*).
- The scrubber is exposed as `role="slider"` with `aria-valuemin`,
  `aria-valuemax`, `aria-valuenow` and a human-readable `aria-valuetext`
  (`"01:23"`).
- The loading overlay carries `role="status"` with `aria-label="Loading"`.
- The error overlay carries `role="alert"`.

### Keyboard shortcuts

The default browser shortcuts are honoured (the `<video>` element
receives them when it is focused — the toolbar buttons relay focus
back via the standard `tabindex` flow):

| Key            | Action                  |
|----------------|-------------------------|
| `Space`        | Play / pause            |
| `←` / `→`      | Seek backward / forward |
| `↑` / `↓`      | Volume up / down        |
| `m`            | Toggle mute             |
| `f`            | Toggle fullscreen       |

## `prefers-reduced-motion`

When the OS-level *reduced motion* preference is set, the component
suppresses `autoplay` and logs a one-time `console.warn`. The
playback only starts after a user gesture (click on the play button,
or `methods.play()`). This is non-negotiable: autoplay is the single
worst offender for users with vestibular sensitivity, and the policy
defaults to *off* in any modern browser anyway when the OS reports
the preference.

## Composable — `useVideoPlayer`

```ts
import { useVideoPlayer } from '@origam/composables'

const { videoRef, state, methods } = useVideoPlayer({
    autoplay: false,
    muted: false,
    preload: 'metadata'
})

// in the template:
// <video ref="videoRef" :src="videoUrl" />
```

- `videoRef: Ref<HTMLVideoElement | null>` — bind on the `<video>`
  element. Pass your own ref through `options.videoRef` if you need
  external control.
- `state` — reactive refs: `playing`, `paused`, `currentTime`,
  `duration`, `buffered`, `volume`, `muted`, `fullscreen`, `pip`,
  `ready`, `loading`, `error`.
- `methods` — imperative actions: `play`, `pause`, `seek`,
  `setVolume`, `toggleMute`, `toggleFullscreen`, `togglePip`, `load`.

Listeners are attached on `onMounted` and torn down on
`onBeforeUnmount` so the composable is safe to use inside any
`<script setup>` consumer.

## SSR

The `<video>` markup is fully SSR-friendly — the same attributes
encode on both server and client. The composable's listener
attachment lives inside `onMounted`, so no `window` / `document`
access happens during render. Posters and captions ship in the
initial HTML payload, preserving the LCP-friendly behaviour of
SSR-rendered video.

## What this player is not

- A HLS / DASH client. The `<video>` element accepts HLS on Safari
  natively; on every other browser, the consumer needs to plug in
  `hls.js` (or `dash.js`) and attach it to `videoRef.value` from
  outside. We deliberately did NOT bundle one — most projects don't
  need streaming, and the few that do have specific opinions about
  which fork / version to use.
- A DRM-capable player (no Encrypted Media Extensions glue beyond
  what the native element does on its own).
- An analytics-collecting player. Wire your own `@timeupdate` /
  `@play` handlers from the host page — keeping the player free of
  tracking is intentional.

## Related

- `<OrigamMediaController>` — the controls shell composed inside `<OrigamVideo>`. Captions, PiP, and fullscreen buttons are injected by `<OrigamVideo>` via the `#extraControlsRight` slot.
- `<OrigamMediaScrubber>` — the slider used inside the shell for the timeline scrubber and the volume cluster.
- `<OrigamAudio>` — the audio sibling that composes the same shell with an `<audio>` element + optional metadata strip.
- `useVideoPlayer()` — composable layered on top of `useMediaPlayer` with video-specific state (fullscreen, PiP).
- `useMediaPlayer()` — the shared base composable.
