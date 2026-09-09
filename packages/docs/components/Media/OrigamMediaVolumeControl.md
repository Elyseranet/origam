# OrigamMediaVolumeControl

`<OrigamMediaVolumeControl>` is the mute / unmute button **and** the
YouTube-style vertical volume scrubber that opens in a tooltip above it.
It is the volume atom used by `<OrigamMediaController>`, which is in turn
the shared transport row of `<OrigamAudio>` and `<OrigamVideo>`.

It owns three things and nothing else:

- the **icon rung** — `mdi-volume-off` / `-low` / `-medium` / `-high`,
  derived from `volume` + `muted`;
- the **resolved volume collapse** — while `muted` is `true` the slider
  sits at `0`, so a single drag-up gesture both unmutes and sets a level;
- the **tooltip percentage formatter** (`73 %`).

It is fully controlled: it never calls `methods.toggleMute()` /
`methods.setVolume()` itself. Every change leaves as `update:muted` or
`update:volume`, so the parent stays the single source of truth for
media-side mutations.

## Basic usage

```vue
<template>
    <origam-media-volume-control
        :volume="state.volume.value"
        :muted="state.muted.value"
        :mute-label="t('media_mute', 'Mute')"
        :unmute-label="t('media_unmute', 'Unmute')"
        :volume-label="t('media_volume', 'Volume')"
        @update:muted="methods.toggleMute"
        @update:volume="onVolumeChange"
    />
</template>

<script setup lang="ts">
import { OrigamMediaVolumeControl } from '@origam/components'
import { useMediaPlayer } from '@origam/composables'

const { state, methods } = useMediaPlayer({ mediaRef: audioEl })

function onVolumeChange (volume: number) {
    methods.setVolume(volume)
    // rising from 0 → unmute, falling to 0 → mute
    if (volume > 0 && state.muted.value) methods.toggleMute()
    if (volume === 0 && !state.muted.value) methods.toggleMute()
}
</script>
```

## Props

### Content — required

| Prop | Type | Default | Description |
|---|---|---|---|
| `volume` | `number` | — | Linear volume in `[0, 1]`. Typically `state.volume.value`. |
| `muted` | `boolean` | — | Whether the media is muted. Collapses the slider to `0` and forces the `volume-off` icon. |
| `muteLabel` | `string` | — | `aria-label` on the toggle button while **not** muted (clicking will mute). Already translated. |
| `unmuteLabel` | `string` | — | `aria-label` on the toggle button while muted (clicking will unmute). Already translated. |
| `volumeLabel` | `string` | — | `aria-label` on the vertical scrubber inside the tooltip. Already translated. |

### Design

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground channel (`useTextColor`). Repaints the icon **and**, through `currentColor`, the hover wash, the scrubber track and its thumb. This widget paints no surface of its own, so there is deliberately **no `bgColor`**. |
| `size` | `TSize \| number \| string` | `undefined` (`36px`) | Button box. The five rungs (`x-small` → `x-large`) map to `24 / 30 / 36 / 44 / 52 px` and move the icon with them. A number or CSS length (`28`, `'28px'`) is applied verbatim as `width` / `height` — see the caveat below. |
| `density` | `TDensity` | `undefined` (`0px`) | `compact` = −8 px, `default` = 0, `comfortable` = +8 px, applied **on top of** the size rung. Same grammar as `OrigamBtn` / `OrigamSelectionControl`, so a controller row can tighten every control at once. |
| `rounded` | `boolean \| number \| string \| TRounded` | `undefined` (`radius.full`) | Corner radius. Accepts the utility rungs (`xs`…`xl`, `none`, `full`), the named variants (`small`, `large`, …), a raw CSS value (`'8px'`, `'8px 0 8px 0'`) or the legacy boolean. |
| `roundedTopLeft` / `roundedTopRight` / `roundedBottomLeft` / `roundedBottomRight` | `boolean \| number \| string` | `undefined` | Per-corner override. Beats `rounded` for the corner it targets only. |

::: warning `size` as a raw length bypasses `density`
For one of the five enum rungs, `useSize` emits a class and the SCSS
composes `calc(rung + density)`. For a free-form value (`size="28px"`,
`:size="28"`) `useSize` emits `width` / `height` **inline**, which wins
over that `calc()` — the density offset is then ignored. This is the
shared `useSize` contract, not a local quirk.
:::

### Commons

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `undefined` | Forwarded to the toggle button. |
| `class` | `string \| string[] \| object` | `undefined` | Merged onto the toggle button. |
| `style` | `StyleValue` | `undefined` | Merged onto the toggle button **first**, so the design channels above (`color`, `rounded`, `size`) win over it when both target the same declaration. To force a value past a prop, set the matching token instead (see *Theming*). |
| `dataCy` | `string` | `'origam-media-volume-control'` | Prefix for the test selectors: `${dataCy}-mute` on the button, `${dataCy}-wrapper` on the tooltip body, `${dataCy}` on the scrubber. |

## Emits

| Emit | Payload | Fired when |
|---|---|---|
| `update:muted` | `boolean` — the **proposed** new state (`!muted`) | The toggle button is clicked. |
| `update:volume` | `number` — the new linear volume in `[0, 1]` | The vertical scrubber moves. The parent must call `setVolume()` **and** toggle mute as appropriate (rising from 0 → unmute, falling to 0 → mute). |

## Slots

None. The button icon, the tooltip and the scrubber are entirely driven
by props — `IMediaVolumeControlSlots` is deliberately empty.

## Behaviour notes

### Accessibility

- The toggle is a real `<button type="button">`, so Enter / Space and the
  tab order come from the platform — no `role`, no key handler.
- Its accessible name flips with the state: `muteLabel` while audible,
  `unmuteLabel` while muted. Both are **already-translated strings**; the
  component never calls `t()` itself.
- The icon is `aria-hidden="true"` — the button's label carries the whole
  meaning.
- The scrubber is an `<OrigamMediaScrubber>` with
  `role="slider"`, `aria-orientation="vertical"`, `aria-valuemin/max/now`
  and an `aria-valuetext` of the form `73 %`. Arrow keys move it by the
  `0.05` step.

### SSR

Nothing here touches `window` / `document` at setup time. The tooltip
body is teleported and only rendered once opened, so the server output is
the button alone — no hydration mismatch.

### Icon rungs

| Condition | Icon |
|---|---|
| `muted === true` or `volume === 0` | `mdi-volume-off` |
| `volume < 0.34` | `mdi-volume-low` |
| `volume < 0.67` | `mdi-volume-medium` |
| otherwise | `mdi-volume-high` |

## Theming

Props first, tokens second — the component declares its own token block,
so a theme reaches it through `IOrigamTheme.components['origam-media-volume-control']`
for the four design props above, and through `IOrigamTheme.vars` for
everything below.

| Token | Default (light & dark) |
|---|---|
| `--origam-media-volume-control---density` | `var(--origam-media-volume-control--default---density)` |
| `--origam-media-volume-control--default---density` | `0px` |
| `--origam-media-volume-control--compact---density` | `-8px` |
| `--origam-media-volume-control--comfortable---density` | `8px` |
| `--origam-media-volume-control__btn---size` | `var(--…__btn---size-md)` |
| `--origam-media-volume-control__btn---size-xs` … `-xl` | `24px` / `30px` / `36px` / `44px` / `52px` |
| `--origam-media-volume-control__btn---border-radius` | `var(--origam-radius---full)` |
| `--origam-media-volume-control__btn---color` | `currentColor` |
| `--origam-media-volume-control__btn---background-color` | `transparent` |
| `--origam-media-volume-control__btn---opacity` | `0.95` |
| `--origam-media-volume-control__btn---transition-duration` | `120ms` |
| `--origam-media-volume-control__btn--hover---background-color` | `color-mix(in srgb, currentColor 12%, transparent)` |
| `--origam-media-volume-control__btn--hover---opacity` | `1` |
| `--origam-media-volume-control__btn--active---scale` | `0.92` |
| `--origam-media-volume-control__icon---font-size` | `var(--…__icon---font-size-md)` |
| `--origam-media-volume-control__icon---font-size-xs` … `-xl` | `14px` / `17px` / `20px` / `24px` / `28px` |
| `--origam-media-volume-control__tooltip---background-color` | `var(--origam-color__neutral---900)` |
| `--origam-media-volume-control__tooltip---color` | `var(--origam-color__neutral---0)` |
| `--origam-media-volume-control__tooltip---padding` | `10px 8px` |
| `--origam-media-volume-control__wrapper---width` | `14px` |
| `--origam-media-volume-control__wrapper---height` | `80px` |
| `--origam-media-volume-control__scrubber---track-background-color` | `color-mix(in srgb, currentColor 30%, transparent)` |
| `--origam-media-volume-control__scrubber---track-size` | `4px` |
| `--origam-media-volume-control__scrubber---thumb-diameter` | `10px` |

## Examples

### Themed via props (the DS way)

```ts
import { createOrigam } from 'origam'

createOrigam({
    theme: {
        name: 'compact-player',
        components: {
            'origam-media-volume-control': {
                color: 'primary',
                size: 'small',
                density: 'compact',
                rounded: 'md'
            }
        }
    }
})
```

### One-off override, no theme

```vue
<origam-media-volume-control
    :volume="volume"
    :muted="muted"
    color="#ff0080"
    size="x-large"
    rounded="sm"
    mute-label="Mute"
    unmute-label="Unmute"
    volume-label="Volume"
    @update:muted="muted = $event"
    @update:volume="volume = $event"
/>
```

### Taller scrubber, via tokens

::: warning The tooltip is teleported — scope the override globally
Measured in Chromium: the tooltip body lives at
`body > .origam-overlay-container > … > .origam-media-volume-control__wrapper`,
outside the component's own subtree. A custom property set on the component
(`class="player-volume"` lands on the toggle **button**) therefore never
reaches the wrapper, the tooltip or the scrubber. Those three token groups
must be overridden at a scope the teleported node inherits from — `:root`,
`[data-theme="…"]`, or an `IOrigamTheme.vars` entry.

The button-side tokens (`__btn---*`, `__icon---*`, `---density`) have no such
constraint: a per-instance `class` / `:style` override works on those.
:::

```css
/* global stylesheet, or IOrigamTheme.vars */
:root {
    --origam-media-volume-control__wrapper---height: 120px;
    --origam-media-volume-control__scrubber---thumb-diameter: 14px;
    --origam-media-volume-control__tooltip---background-color: #101010;
}
```

```vue
<!-- per-instance, button side only — this scope DOES work -->
<origam-media-volume-control
    :volume="volume"
    :muted="muted"
    :style="{ '--origam-media-volume-control__btn---opacity': '1' }"
    mute-label="Mute"
    unmute-label="Unmute"
    volume-label="Volume"
/>
```
