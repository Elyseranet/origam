# OrigamAudio

Stemtracks-inspired studio strip — **not** a clone of `<OrigamVideo>` and
**not** a thin wrapper over `<OrigamMediaController>`. It paints an album
cover on either side of the surface (configurable via `coverPosition`)
and a body column with three rows: a metadata header, a waveform mini
scrubber, and a transport `<nav>` composed entirely of the atomic
media sub-components (`<OrigamMediaPlayBtn>`, `<OrigamMediaVolumeControl>`,
`<OrigamMediaTimeLabel>`, `<OrigamMediaCastBtn>`, `<OrigamMediaConfigMenu>`,
plus two `<OrigamSliderField>` scrubbers — `variant="audio"` for the
waveform and `variant="timer"` for the inline scrubber).

Ships in two visual variants — `'expanded'` for full hero strips and
`'compact'` for slim docks — and extends the canonical `IPositionProps`
so the wrapper can be `static`, `relative`, `absolute`, `fixed`, or
`sticky` with the standard `top` / `bottom` / `left` / `right` anchors.

The root element is `<article>` (the surface is self-contained); the
cover lives in a `<figure>`, the metadata header in a `<header>`, and
the transport row in a `<nav>` — no `<div>` soup, no `role` overrides.

It is SSR-safe — no `window` / `document` / `canvas` API is touched
outside `onMounted`.

## Quick start

```vue
<template>
    <origam-audio
        :src="src"
        title="Episode 42 — How Vue 3 SFC compiler resolves withDefaults"
        artist="origam podcast"
        cover="https://picsum.photos/seed/audio/256"
        :waveform="true"
        :downloadable="true"
    />
</template>

<script setup lang="ts">
import { OrigamAudio } from '@origam/components'

const src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
</script>
```

## When to use

- Podcasts, music players, single audio tracks with rich custom controls.
- Anywhere you would otherwise mount `<audio controls>` and want the DS
  look + a waveform + a config menu + cast + remote playback.
- When you need to swap the metadata header out for a custom block (album
  art, chapter markers, ratings) via the `#metadata` slot.
- Sticky bottom-of-screen mini-players, sidebar players, "Now playing"
  hero cards.

When NOT to use:

- One-shot SFX (button clicks, notification chimes, game effects) — reach
  for `<OrigamSound>` (or its successor) which has no UI and a
  fire-and-forget API.
- A bare `<audio>` is enough when you want the platform's accessibility
  shortcuts and no custom skin — pass `controls="native"` instead.

## Anatomy

```
variant="expanded", coverPosition="left"
┌──────────────────────────────────────────────────────────────────────┐
│  ┌────┐                                                              │
│  │ 96 │   Track Title (18 px Bold)                                   │
│  │ px │   Artist · Album · 03:14                                     │
│  │ cov│                                                              │
│  └────┘   ░░▒▒▓▓██▒░░  ← <OrigamSliderField variant="audio">         │
│                                                                      │
│  ⏮  ⬤PLAY⬤  ⏭   00:42 / 03:14  ─━━━━●──── 🔊 ⚙ ↺ ⋯               │
│      48 px                          ← <OrigamSliderField variant=    │
│                                       "timer"> hairline 2 px → 4 px  │
│                                       on hover                       │
└──────────────────────────────────────────────────────────────────────┘

variant="expanded", coverPosition="right"  — swaps the grid columns

variant="compact"
┌──────────────────────────────────────────────────────────────────────┐
│ [48px] Title · Artist     ⏮ ⬤ ⏭  00:42 / 03:14  ━━●━━ 🔊 ⚙ ↺ ⋯    │
└──────────────────────────────────────────────────────────────────────┘
```

The `compact` variant hides the waveform mini scrubber and inlines the
metadata next to a 48 px cover to keep the dock height tight. The
`expanded` variant ships a 96 px cover, the metadata header, and the
waveform when `waveform="true"` (or `"auto"` with `OfflineAudioContext`
support).

The metadata header is optional — when `title`, `artist`, and `album`
are all unset (and no `#metadata` slot is provided), only the cover
+ body render. The cover figure is omitted when no `cover` is provided.

## Props

### Layout & variants

| Prop            | Type                                                             | Default       | Description                                                                                                                                            |
|-----------------|------------------------------------------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `variant`       | `'expanded' \| 'compact' \| 'normal' \| 'minimal'`                | `'expanded'`  | `expanded` = full Stemtracks strip. `compact` = slim transport-only dock. Legacy `'normal'` / `'minimal'` aliases resolve to `expanded` / `compact`.   |
| `coverPosition` | `'left' \| 'right'`                                              | `'left'`      | Side of the surface where the album cover is painted. The body column sits on the opposite side.                                                       |
| `position`      | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky'`     | `'relative'`  | Inherited from `IPositionProps`. Drives the wrapper's CSS `position` so the player can be docked / floated.                                            |
| `top`           | `number \| string`                                               | `undefined`   | Inherited from `IPositionProps`. CSS `top` offset.                                                                                                     |
| `bottom`        | `number \| string`                                               | `undefined`   | Inherited from `IPositionProps`. CSS `bottom` offset.                                                                                                  |
| `left`          | `number \| string`                                               | `undefined`   | Inherited from `IPositionProps`. CSS `left` offset.                                                                                                    |
| `right`         | `number \| string`                                               | `undefined`   | Inherited from `IPositionProps`. CSS `right` offset.                                                                                                   |
| `color`         | `TColor`                                                         | `undefined`   | Foreground colour — accepts an intent (`'primary'`, `'success'`, …) or a raw CSS color.                                                                |
| `bgColor`       | `TColor`                                                         | `undefined`   | Surface background — overrides the default dark studio backdrop (`rgba(14, 14, 16, 0.92)`).                                                            |
| `elevation`     | `string \| number`                                               | `undefined`   | Picks a shadow token rung (`'xs'…'2xl'`) or a Material 0..24 level.                                                                                    |
| `rounded`       | `string \| number \| boolean`                                    | `undefined`   | Picks a radius token (`'sm'…'xl'`) or a numeric pixel value.                                                                                           |
| `border`        | `IBorderProps['border']`                                         | `undefined`   | Picks a border token.                                                                                                                                  |
| `padding`       | `IPaddingProps['padding']`                                       | `undefined`   | Padding tokens (axis or per-side).                                                                                                                     |
| `margin`        | `IMarginProps['margin']`                                         | `undefined`   | Margin tokens (axis or per-side).                                                                                                                      |
| `tag`           | `string`                                                         | `'article'`   | `IAudioProps` extends `ITagProps`. The root is always rendered as `<article>` for HTML semantics; the prop is preserved for typed consumers.            |

### Typography props (`ITypographyProps`) — per-surface

A single set of `ITypographyProps` drives all four text surfaces. Each surface reads only the variables its SCSS declares; unset props emit nothing.

| Prop            | Type          | Default     | Surfaces with visual effect                                                                      |
|-----------------|---------------|-------------|--------------------------------------------------------------------------------------------------|
| `fontSize`      | `TFontSize`   | `undefined` | `audio__title` (font-size), `audio__meta` (font-size), `audio__loading` (font-size), `audio--error` (font-size) |
| `fontWeight`    | `TFontWeight` | `undefined` | `audio__title` (font-weight) only                                                                |
| `lineHeight`    | `TLineHeight` | `undefined` | `audio__title` (line-height) only                                                                |
| `letterSpacing` | `TLetterSpacing` | `undefined` | No SCSS rule in current surfaces — prop accepted, var emitted, no visible effect               |
| `fontFamily`    | `TFontFamily` | `undefined` | No SCSS rule in current surfaces — prop accepted, var emitted, no visible effect               |

> `audio__loading` and `audio--error` are state overlays — only visible when the player is loading or in error state. The CSS var is always set via inline `:style`; the rendered effect requires triggering the matching player state.

### Media

| Prop                  | Type                                              | Default                          | Description                                                                                                              |
|-----------------------|---------------------------------------------------|----------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `src`                 | `string \| IAudioSource \| Array<IAudioSource>`    | **required**                     | Single URL, source descriptor, or array of descriptors for codec fallback.                                               |
| `tracks`              | `Array<IVideoTrack>`                              | `[]`                             | Captions / chapters tracks attached to the `<audio>`. Reuses the video track shape.                                       |
| `title`               | `string`                                          | `undefined`                      | Track title (18 px bold).                                                                                                |
| `artist`              | `string`                                          | `undefined`                      | Artist / author. Painted next to the album with a `·` separator.                                                          |
| `album`               | `string`                                          | `undefined`                      | Album name. Painted in the meta line.                                                                                    |
| `cover`               | `string \| ISrcObject`                            | `undefined`                      | Album cover. Accepts a URL or an `ISrcObject` for srcset support.                                                        |
| `autoplay`            | `boolean`                                         | `false`                          | Suppressed when the user prefers reduced motion. Implies `muted="true"`.                                                  |
| `muted`               | `boolean`                                         | `false`                          | Starts the player muted.                                                                                                 |
| `loop`                | `boolean`                                         | `false`                          | Loops playback. The transport `↺` button reflects + toggles this.                                                         |
| `preload`             | `'none' \| 'metadata' \| 'auto'`                   | `'metadata'`                     | Buffering hint.                                                                                                          |
| `crossorigin`         | `'anonymous' \| 'use-credentials'`                 | `undefined`                      | Native `crossorigin` attribute. Required for WebAudio access on CORS-enabled CDNs.                                       |
| `controls`            | `'custom' \| 'native'`                            | `'custom'`                       | `'custom'` renders the Stemtracks transport `<nav>`. `'native'` falls back to the browser's built-in audio bar.           |
| `playbackRates`       | `ReadonlyArray<number>`                           | `[0.5, 0.75, 1, 1.25, 1.5, 2]`   | Available rates in the Speed drill-down.                                                                                 |
| `playbackRate`        | `number`                                          | `1`                              | Initial playback rate.                                                                                                   |
| `allowRemotePlayback` | `boolean`                                         | `false`                          | Enable the cast / AirPlay button (Remote Playback API).                                                                  |
| `downloadable`        | `boolean`                                         | `false`                          | Adds a Download row to the cog menu.                                                                                     |
| `downloadFilename`    | `string`                                          | `undefined`                      | Override the downloaded file name. Defaults to the trailing URL segment.                                                  |
| `waveform`            | `boolean \| 'auto'`                                | `false`                          | Decode and paint the waveform mini scrubber. `'auto'` falls back to `false` on SSR / no-OfflineAudioContext browsers.    |
| `waveformColor`       | `string`                                          | `'currentColor'`                 | Played-bars colour for the waveform.                                                                                     |

## Emits

| Event                    | Payload                                | Fires                                                                                                                  |
|--------------------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `play`                   | —                                      | Underlying `<audio>` started playback.                                                                                 |
| `pause`                  | —                                      | Underlying `<audio>` paused.                                                                                           |
| `ended`                  | —                                      | Underlying `<audio>` reached the end of the track.                                                                     |
| `timeupdate`             | `Event`                                | Native DOM event forwarded.                                                                                            |
| `volumechange`           | `Event`                                | Native DOM event forwarded.                                                                                            |
| `loadedmetadata`         | `Event`                                | Fires once metadata has loaded and `duration` is finite.                                                               |
| `error`                  | `Event \| MediaError \| Error`         | Wraps the native `<audio>` `error` event with the resolved `MediaError` when available.                                |
| `update:playbackRate`    | `number`                               | Listener picked a rate from the cog menu.                                                                              |
| `download`               | `string` (URL)                         | Listener clicked the Download row. Payload is the file URL.                                                            |
| `waveform`               | `Array<number>` (200 0..1 amplitudes)   | Fires once per recomputation (typically on `src` change).                                                              |
| `previous`               | —                                      | Listener clicked the `⏮` button. The component ALSO skips -10 s internally so isolated players keep working.            |
| `next`                   | —                                      | Listener clicked the `⏭` button. The component ALSO skips +10 s internally.                                             |

## Slots

| Slot         | Bindings                                                          | Default content                                                                                          |
|--------------|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `cover`      | —                                                                 | `<origam-img>` of the resolved `cover`.                                                                  |
| `metadata`   | —                                                                 | Title + artist · album · duration meta line.                                                             |
| `title`      | —                                                                 | `<strong>` with the `title` prop.                                                                        |
| `waveform`   | `{ peaks: Array<number>, currentTime: number, duration: number }`  | `<origam-slider-field variant="audio">`.                                                                 |
| `controls`   | `IAudioScopedSlotBindings`                                        | Transport `<nav>` composed of the atomic media sub-components.                                            |
| `loading`    | —                                                                 | `<origam-icon icon="LOADING">`.                                                                          |
| `error`      | `{ error: MediaError \| Error }`                                  | `<origam-icon>` + `<span>` with the error message.                                                       |

## CSS variables

Components expose their internals as CSS variables under
`--origam-audio---*` (root) and `--origam-audio__*---*` (BEM children).
State variants use the double-tiret separator
(`--origam-audio--{state}---*`).

| Variable                                                | Default                                        | Notes                                                                  |
|---------------------------------------------------------|------------------------------------------------|------------------------------------------------------------------------|
| `--origam-audio---background-color`                     | `rgba(14, 14, 16, 0.92)`                        | Default studio backdrop. Overridden by `bgColor` prop.                |
| `--origam-audio---color`                                | `var(--origam-color__text--inverse---fg)`       | Foreground colour. Overridden by `color` prop.                        |
| `--origam-audio---accent-color`                         | `var(--origam-color__accent---base)`            | Drives both scrubbers' fill + the active loop pill via `accent-color`. |
| `--origam-audio---gap`                                  | `16px`                                          | Grid gap between cover and body.                                       |
| `--origam-audio---padding`                              | `16px`                                          | Surface padding.                                                       |
| `--origam-audio---border-radius`                        | `var(--origam-radius---lg, 12px)`               | Surface radius.                                                        |
| `--origam-audio__cover---size`                          | `96px`                                          | Expanded variant cover size.                                           |
| `--origam-audio--compact__cover---size`                 | `48px`                                          | Compact variant cover size.                                            |
| `--origam-audio__title---font-size`                     | `18px`                                          | Title size (expanded). Overridden in compact.                          |
| `--origam-audio__meta---color`                          | `color-mix(in srgb, currentColor 60%, transparent)` | Subtle meta line colour.                                            |
| `--origam-audio__transport---gap`                       | `8px`                                           | Spacing between transport-row controls.                                |
| `--origam-audio__transport---min-height`                | `48px`                                          | Transport row min-height.                                              |
| `--origam-audio__nav-btn---size`                        | `32px`                                          | Prev / next / loop nav buttons.                                        |
| `--origam-audio__play-btn---size`                       | `48px`                                          | Forwarded to the atomic `<OrigamMediaPlayBtn>` via its public var.      |

## Composables exposed

| Ref         | Type                              | Notes                                                                  |
|-------------|-----------------------------------|------------------------------------------------------------------------|
| `audioRef`  | `Ref<HTMLAudioElement \| null>`   | The native element. `null` until mount.                                |
| `state`    | `IAudioPlayerState`               | Reactive state surface — `playing`, `paused`, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `ready`, `loading`, `error`, `playbackRate`, `remoteAvailable`, `remoteState`. |
| `methods`  | `IAudioPlayerMethods`             | Imperative methods — `play`, `pause`, `toggle`, `seek`, `setVolume`, `toggleMute`, `load`, `skipBackward`, `skipForward`, `setPlaybackRate`, `requestRemotePlayback`, `stopRemotePlayback`. |

## Examples

### Expanded with waveform

```vue
<origam-audio
    :src="src"
    title="Daydream"
    artist="Origam DS Cast"
    album="Season 3"
    cover="https://picsum.photos/seed/audio/256"
    variant="expanded"
    :waveform="true"
/>
```

### Compact dock pinned to the bottom

```vue
<origam-audio
    :src="src"
    variant="compact"
    position="sticky"
    bottom="0"
    title="Pinned"
    artist="Origam"
    :cover="cover"
/>
```

### Branded surface

```vue
<origam-audio
    :src="src"
    bg-color="primary"
    color="surface"
    title="Branded"
    artist="Origam DS"
    album="Tokens"
    :cover="cover"
/>
```

### Playlist controller (consuming `previous` / `next`)

```vue
<origam-audio
    :src="currentTrack.src"
    :title="currentTrack.title"
    :artist="currentTrack.artist"
    :cover="currentTrack.cover"
    @previous="playlist.previous()"
    @next="playlist.next()"
    @ended="playlist.next()"
/>
```

When a `previous` / `next` listener is bound, the component still falls
back to skipping ±10 s on the current track internally — the consumer
gets the emit AND the user gets a useful default in isolation.

### Native fallback

```vue
<origam-audio :src="src" controls="native" />
```

Renders the browser's built-in audio bar. The transport `<nav>` is not
mounted.

## Accessibility

- Root is `<article>` so screen readers announce the player as a
  self-contained region.
- Cover lives in a `<figure>` (no `<figcaption>` by default because the
  cover is decorative when the metadata header carries the same info).
- Transport row is `<nav aria-label="Transport controls">` so users can
  jump to it via the rotor / landmark menu.
- Every button carries a translated `aria-label`. The loop button also
  exposes `aria-pressed`.
- `accent-color: var(--origam-audio---accent-color)` on the root paints
  both scrubbers via the platform's native tint (no JS, no canvas).
- `autoplay` is suppressed when the user has requested reduced motion.

## Notes

- The component does NOT mount `<OrigamMediaController>` — the
  Stemtracks transport is composed directly from the atomic media
  sub-components so the `expanded` layout can ship its bespoke spacing
  + the waveform mini scrubber.
- The `accent-color` CSS property on the root means both scrubbers
  inherit the audio's accent without manual wiring. To override per
  player, set `--origam-audio---accent-color` on the instance.
- The default background (`rgba(14, 14, 16, 0.92)`) is intentionally
  near-black to evoke a studio strip. Pass `bgColor` (intent or hex)
  to override.
