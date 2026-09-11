# OrigamParallax

`<OrigamParallax>` is the host that drives a parallax effect across one
or more `<OrigamParallaxLayer>` (or legacy `<OrigamParallaxElement>`)
children. It tracks scroll progress, mouse-ratio (for the 2D mode) and
device orientation; the layers register themselves against the host and
their `transform` is mutated outside Vue reactivity for performance.

CSS-first: when the browser supports `animation-timeline: scroll()`
(Chrome 115+, Edge 115+, Safari TP) AND `easing="linear"`, the runtime
delegates the per-frame work to the CSS scroll-driven animation. On
older browsers, or when easing is `ease-out` / `spring`, a
`requestAnimationFrame` fallback takes over. `prefers-reduced-motion:
reduce` keeps every layer at its static `offsetX` / `offsetY` regardless
of scroll.

## Quick start — single layer (legacy API, backward-compatible)

```vue
<template>
    <OrigamParallax style="height: 320px; width: 100%;">
        <OrigamParallaxElement :strength="20">
            <img src="/img/cover.jpg" alt="" />
        </OrigamParallaxElement>
    </OrigamParallax>
</template>
```

## Quick start — multi-layer (enriched)

```vue
<template>
    <OrigamParallax direction="vertical" easing="spring">
        <OrigamParallaxLayer :speed="0.2">
            <img src="/bg.jpg" alt="" />
        </OrigamParallaxLayer>
        <OrigamParallaxLayer :speed="0.5">
            <img src="/midground.png" alt="" />
        </OrigamParallaxLayer>
        <OrigamParallaxLayer :speed="0.8">
            <img src="/foreground.png" alt="" />
        </OrigamParallaxLayer>
    </OrigamParallax>
</template>
```

> `<OrigamParallaxLayer>` (new) and `<OrigamParallaxElement>` (legacy)
> live in two independent injection contexts. Both can coexist inside
> the same `<OrigamParallax>`.

## Props (table)

| Prop | Type | Default | Description |
|---|---|---|---|
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Axis of the parallax translation. `both` mixes scroll-progress (Y) and mouse-ratio (X). |
| `easing` | `'linear' \| 'ease-out' \| 'spring' \| string` | `'linear'` | Easing keyword or raw CSS timing-function. Only `linear` activates the CSS-first path. |
| `speed` | `number` | `0.5` | Default speed multiplier when the host has no `<OrigamParallaxLayer>` children. |
| `disabled` | `boolean` | `false` | Force OFF — layers stay at offset 0 regardless of scroll. |
| `threshold` | `number` | `0` | Proportion of the host (0 → 1) that must enter the viewport before the effect activates. |
| `duration` | `number` | `1000` | Legacy transition duration (ms) for `<OrigamParallaxElement>`. |
| `perspective` | `number` | `1000` | Host CSS `perspective` (px). |
| `event` | `'move' \| 'scroll' \| 'orientation'` | `'move'` | Legacy event source for `<OrigamParallaxElement>`. |
| `active` | `boolean` | `true` | Legacy kill-switch — only freezes the mouse path. |
| `animationDuration` | `number` | `undefined` | **Deprecated** — alias for `duration`, removed in v3.0.0. |

Plus all the standard chrome props: `tag`, `color`, `bgColor`,
`padding`, `margin`, `border`, `rounded`, `elevation`, `dimension`,
`audio`, `class`, `style`.

## Events

| Event | Payload | Fires |
|---|---|---|
| `enter` | — | The host enters the viewport (IntersectionObserver). |
| `leave` | — | The host leaves the viewport. |
| `scroll-progress` | `progress: number` (0 → 1) | On every rAF tick while the host is visible. `0` = just entered, `1` = just left. |

```vue
<template>
    <OrigamParallax
        @enter="onEnter"
        @leave="onLeave"
        @scroll-progress="onProgress"
    >…</OrigamParallax>
</template>
```

## IParallaxLayerProps

```ts
interface IParallaxLayerProps {
    speed?: number     // 0 = fixed, 0.5 = half speed, 1 = neutral, >1 = faster, <0 = reversed
    offsetX?: number   // static X offset (px) on top of the parallax translation
    offsetY?: number   // static Y offset (px)
    zIndex?: number    // optional stacking override
}
```

## CSS-first vs JS fallback

| Condition | Path |
|---|---|
| `CSS.supports('animation-timeline: scroll()')` is `true` AND `easing === 'linear'` | **CSS** — `animation-timeline: view()` keyframe animation on each layer. Zero JS work per frame. |
| Either condition above is false | **JS fallback** — `IntersectionObserver` + `requestAnimationFrame` mutate `transform` directly. Spring easing uses a damped lerp. |

The runtime exposes the active path via `cssScrollDriven` (a reactive
ref on the component instance) — useful for storybook diagnostics or
custom debug overlays. The branch is computed at mount and re-evaluated
when the `easing` prop changes.

## `prefers-reduced-motion` behavior

When `(prefers-reduced-motion: reduce)` matches, every layer:
- Snaps to `translate3d(offsetX, offsetY, 0)` and never moves.
- The CSS keyframe animation is disabled via `animation: none !important`.
- The rAF loop short-circuits before mutating the DOM.

The runtime watches the media-query and reacts live to OS-level changes
without a page reload.

## Performance tips

- Layers carry `will-change: transform` via the
  `--origam-parallax__layer---will-change` token. Avoid stacking too many
  layers (>5) on a single host — every one is a promoted compositing
  layer in the GPU.
- The runtime mutates `transform` directly (not via a Vue render), so a
  parallax page should not trigger any extra component re-renders on
  scroll.
- Prefer `easing="linear"` when targeting recent Chromium — the CSS-first
  path is the cheapest by an order of magnitude.

## Anatomy

```html
<div class="origam-parallax origam-parallax--vertical">
    <!-- <OrigamParallaxLayer> children -->
    <div class="origam-parallax__layer" style="transform: translate3d(…)"></div>
    <!-- <OrigamParallaxElement> legacy children -->
    <div class="origam-parallax-element" style="transform: …"></div>
    <audio v-if="audio" />
</div>
```

## Design tokens consumed

`<OrigamParallax>` reads from `tokens/component/parallax.json`. The
relevant additions for the multi-layer path are:

| CSS variable | Token |
|---|---|
| `--origam-parallax---transition-duration-spring` | `{motion.duration.xslow}` |
| `--origam-parallax---transition-easing-default` | `{motion.easing.standard}` |
| `--origam-parallax---transition-easing-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--origam-parallax__layer---will-change` | `transform` |
| `--origam-parallax__layer---transform-origin` | `center center` |

## Accessibility

- Layers are decorative; no ARIA attributes are needed on the parallax
  host. Content (text, images) inside the slots remains lisible by
  screen readers — the runtime only modifies `transform`.
- `prefers-reduced-motion` is honoured by default; consumers do NOT need
  to bind anything to `disabled`.
- The legacy `event="orientation"` mode requires explicit user
  permission on iOS (`DeviceOrientationEvent.requestPermission()`) —
  gate it behind a user gesture.
- Audio reactivity (`audio` prop) starts only after a user gesture in
  most browsers.

## Related

- `OrigamParallaxLayer` — new layer primitive consumed by the multi-layer
  runtime.
- `OrigamParallaxElement` — legacy primitive for mouse-driven /
  audio-reactive effects (`type="rotate"`, `type="depth"`, …).
