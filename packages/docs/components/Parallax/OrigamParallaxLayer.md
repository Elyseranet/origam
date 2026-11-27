# OrigamParallaxLayer

`<OrigamParallaxLayer>` registers a layer into the enriched, multi-layer
runtime owned by an enclosing `<OrigamParallax>` (`direction` / `easing`
/ `disabled` props on the host). Each layer declares its own `speed`
multiplier and static `offsetX` / `offsetY`, so a single scroll or mouse
gesture can move several layers at different amplitudes — the classic
background / midground / foreground composition.

The layer **must** be nested inside an `<OrigamParallax>` — it throws on
mount otherwise (the runtime context is `inject`-ed via
`ORIGAM_PARALLAX_LAYER_KEY`). This is a distinct injection context from
the legacy `<OrigamParallaxElement>` path — the two can coexist but don't
interoperate.

## Basic usage

```vue
<template>
    <OrigamParallax event="scroll">
        <OrigamParallaxLayer :speed="0.2">
            <img src="/img/sky.jpg" alt="" />
        </OrigamParallaxLayer>
        <OrigamParallaxLayer :speed="0.8">
            <img src="/img/foreground.png" alt="" />
        </OrigamParallaxLayer>
    </OrigamParallax>
</template>
```

## Speed

`speed` is the parallax multiplier for this layer:

| Value | Effect |
|---|---|
| `0` | Fixed — sticks to the host, no movement. |
| `0.5` | Half the scroll speed (background — far). |
| `1` (default) | Moves at the same rate as the scroll (neutral). |
| `> 1` | Faster than the scroll (foreground — near). |
| negative | Reverses the direction. |

`speed`, `offsetX` and `offsetY` are all **reactive** — changing any of
them after mount updates the running animation immediately, whether the
host is on the JS `requestAnimationFrame` path or the CSS
`animation-timeline: scroll()` path.

```vue
<template>
    <OrigamParallaxLayer :speed="dynamicSpeed">…</OrigamParallaxLayer>
</template>
```

## Static offset

`offsetX` / `offsetY` (px) nudge a layer on top of its parallax
translation — useful for fine positioning without touching `speed`.

```vue
<template>
    <OrigamParallaxLayer :speed="0.5" :offset-x="20" :offset-y="-10">…</OrigamParallaxLayer>
</template>
```

## Pointer amplitude — `mouseX` / `mouseY`

`speed` drives the **scroll** only. The pointer has its own amplitudes, in
px, per layer and per axis: `mouseX` / `mouseY` are how far the layer
slides when the pointer goes from the host centre to its edge. A distant
layer gets a small value, a near one a large value.

```vue
<template>
    <OrigamParallax direction="both">
        <OrigamParallaxLayer :speed="0.1" :mouse-x="10" :mouse-y="6">…</OrigamParallaxLayer>
        <OrigamParallaxLayer :speed="0.3" :mouse-x="40" :mouse-y="24">…</OrigamParallaxLayer>
    </OrigamParallax>
</template>
```

- Works on both paths, **including `easing="linear"`** (the default): the
  pointer drives the CSS `translate` property, which composes with the
  scroll `transform`.
- Smoothed by a 400 ms CSS `transition` on `translate`.
- Wired only with a fine pointer (`(hover: hover) and (pointer: fine)`).
  On touch devices only the scroll moves the layers; there is no
  gyroscope on this path.
- Under `prefers-reduced-motion: reduce` (or `disabled`) the host installs
  **no** `mousemove` listener and the layers stay still.
- Left unset, the legacy rule applies: with `direction="both"` the X
  amplitude is `host width × 0.5 × speed` and Y does not move; with any
  other direction the pointer is ignored.

## Stacking order

`zIndex` overrides the default document-order stacking, when layers need
to cross over each other.

```vue
<template>
    <OrigamParallaxLayer :speed="0.3" :z-index="1">…</OrigamParallaxLayer>
    <OrigamParallaxLayer :speed="0.9" :z-index="2">…</OrigamParallaxLayer>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamParallaxLayer tag="figure" :speed="0.5">…</OrigamParallaxLayer>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The layer's content (image, text, …). |

## Props (interface)

```ts
interface IParallaxLayerProps extends ICommonsComponentProps, ITagProps {
    speed?: number    // default 1
    offsetX?: number  // default 0, px
    offsetY?: number  // default 0, px
    mouseX?: number   // unset = legacy; px at the host edge
    mouseY?: number   // unset = no vertical pointer movement
    zIndex?: number   // unset = document order
}
```

## Anatomy

```html
<div class="origam-parallax__layer" style="transform: …; z-index: …;">
    <!-- default slot -->
</div>
```

## Behaviour notes

- **Registration contract.** On mount, the layer registers a
  `{ id, speed, offsetX, offsetY, mouseX, mouseY, target }` descriptor with the parent
  runtime (`useParallaxRuntime`). The parent's `rAF` loop and CSS
  scroll-driven path both read `speed` / `offsetX` / `offsetY` straight
  off that descriptor on every frame / re-publish — outside Vue
  reactivity, by design, so per-frame work never triggers a Vue render.
  A `watch()` on these props calls the runtime's `update()` to patch
  the SAME descriptor in place whenever they change reactively after
  mount, keeping the object/`target` identity the spring-easing state
  keys off.
- **CSS-driven vs JS fallback.** When the browser supports
  `animation-timeline: scroll()` and the host's `easing` is `'linear'`,
  the layer's own `@keyframes` (scoped `<style>`) reads
  `--origam-parallax__layer---speed` / `---offset-x` / `---offset-y`
  directly — no JS per frame at all. Otherwise the host's `rAF` loop
  computes and writes the layer's `transform` directly.
- **`prefers-reduced-motion`.** When honoured (by the OS or the host's
  own detection), the layer snaps to its static offset
  (`translate3d(offsetX, offsetY, 0)`) and stays there — no animation,
  no scroll listener work for this layer.
- **SSR / first paint.** The layer's own `layerStyles` computed paints
  the static `translate3d(offsetX, offsetY, 0)` before the runtime's
  first frame runs, so there's no flash of an untransformed layer.

## Design tokens consumed

`<OrigamParallaxLayer>` shares the `--origam-parallax---*` /
`--origam-parallax__layer---*` variables declared in
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` with its
host.

| CSS variable | Token reference |
|---|---|
| `--origam-parallax__layer---will-change` | `{motion.will-change.transform}` |
| `--origam-parallax__layer---transform-origin` | `{motion.transform-origin.center}` |
| `--origam-parallax__layer---speed` | published by `useParallaxRuntime` (CSS-driven path only) |
| `--origam-parallax__layer---offset-x` | published by `useParallaxRuntime` (CSS-driven path only) |
| `--origam-parallax__layer---offset-y` | published by `useParallaxRuntime` (CSS-driven path only) |

The full list lives in `packages/ds/src/assets/css/tokens/light.css` and
`dark.css` — grep for `--origam-parallax`.

## Accessibility

- Layers driven by parallax should never carry essential information —
  the effect is purely decorative.
- The component honours `prefers-reduced-motion: reduce` — both via the
  runtime's own detection (freezing the JS/CSS animation) and a
  `@media (prefers-reduced-motion: reduce)` rule that forces `animation:
  none` as a belt-and-braces fallback.

## Theming notes

- The layer ships no color tokens. Style its inner content (image, div,
  …) with the standard origam tokens (`--origam-color-*`) for theme
  awareness.

## Related

- `OrigamParallax` — the host that owns the multi-layer runtime this
  component registers into.
- `OrigamParallaxElement` — the legacy, single-vector mouse/scroll/
  device-orientation layer primitive (separate injection context).
