# OrigamParallaxElement

`<OrigamParallaxElement>` is the layer primitive that consumes the
movement vector emitted by an enclosing `<OrigamParallax>` and applies
it as a CSS `transform` on its host element. Each element picks its own
transform `type` (translate / rotate / scale / depth) and `strength`,
so a single parallax host can compose foreground, midground and
background layers with different feels.

The element **must** be nested inside an `<OrigamParallax>` — it
throws on mount otherwise (the movement context is `inject`-ed via
`ORIGAM_PARALLAX_KEY`).

## Basic usage

```vue
<template>
    <OrigamParallax>
        <OrigamParallaxElement :strength="20" type="translate">
            <img src="/img/cover.jpg" alt="" />
        </OrigamParallaxElement>
    </OrigamParallax>
</template>
```

## Transform type

`type` selects which CSS transform the element applies. Values come from
the `PARALLAX_ELEMENT_TYPE` enum.

| Value | Effect |
|---|---|
| `translate` (default) | 2D translation — classic parallax. |
| `rotate` | Rotation in degrees. |
| `scale` | Uniform scale (both axes). |
| `scaleX` | Horizontal-only scale. |
| `scaleY` | Vertical-only scale. |
| `depth` | Z-translation in 3D space (requires the host's `perspective`). |
| `depth_inv` | Inverse Z-translation — pushes layers backward. |
| `custom` | Reserved hatch for consumer-supplied transforms. |

```vue
<template>
    <OrigamParallax>
        <OrigamParallaxElement type="translate" :strength="30">…</OrigamParallaxElement>
        <OrigamParallaxElement type="rotate"    :strength="6">…</OrigamParallaxElement>
        <OrigamParallaxElement type="scale"     :strength="0.05">…</OrigamParallaxElement>
        <OrigamParallaxElement type="depth"     :strength="60">…</OrigamParallaxElement>
    </OrigamParallax>
</template>
```

## Strength & axis

`strength` is the multiplier applied to the normalised movement vector
(higher = more dramatic). `axis` constrains the movement to a single
axis (`x` or `y`); leave it unset for full 2D motion.

```vue
<template>
    <OrigamParallaxElement :strength="40" axis="y">…</OrigamParallaxElement>
</template>
```

## Origin

`transformOrigin` accepts any CSS `transform-origin` value (default
`'center'`). `originX` / `originY` (`0`–`100`, percent) parametrise the
elementMovement utility — the layer reacts more strongly the further
the cursor moves from this point.

```vue
<template>
    <OrigamParallaxElement
        transform-origin="top left"
        :origin-x="0"
        :origin-y="0"
        :strength="20"
    >…</OrigamParallaxElement>
</template>
```

## Clamping (min / max)

Cap the movement on either axis to keep the layer inside its frame.

```vue
<template>
    <OrigamParallaxElement
        :min-x="-20"
        :max-x="20"
        :min-y="-10"
        :max-y="10"
        :strength="30"
    >…</OrigamParallaxElement>
</template>
```

## Cyclic mode

Set `cycle > 0` to switch from "follow the cursor" to a sinusoidal
oscillation (number of cycles per pass). Useful for ambient
backgrounds.

```vue
<template>
    <OrigamParallaxElement :cycle="2" :strength="20">…</OrigamParallaxElement>
</template>
```

## Audio mode

When the host streams audio data, `audioIndex` (`0`–`100`+) selects
the FFT bucket the element listens to. Mouse / scroll movement is
ignored while audio data is being read.

```vue
<template>
    <OrigamParallax audio="/sound/loop.mp3">
        <OrigamParallaxElement :audio-index="32" type="scale" :strength="0.4">…</OrigamParallaxElement>
    </OrigamParallax>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamParallaxElement tag="figure">…</OrigamParallaxElement>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The actual layer content (image, text, …). |

## Props (interface)

```ts
interface IParallaxElementProps extends ICommonsComponentProps,
    ITagProps, IPaddingProps, IMarginProps, IBorderProps,
    IRoundedProps, IElevationProps, IParallaxElementTypeProps {
    type?: TParallaxElementType  // default 'translate'
    transformOrigin?: TAnchor    // default 'center'
    originX?: number             // default 50
    originY?: number             // default 50
    strength?: number            // default 10
    axis?: TAxis                 // 'x' | 'y' (unset = both)
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
    cycle?: number               // default 0 (linear). >0 switches to cyclic mode
    audioIndex?: number          // default 50
}
```

## Anatomy

```html
<div class="origam-parallax-element" style="transform: …; transition: …;">
    <!-- default slot -->
</div>
```

## Design tokens consumed

`<OrigamParallaxElement>` shares the `tokens/component/parallax.json`
file with its host.

| CSS variable | Token reference |
|---|---|
| `--origam-parallax__element---transition-duration` | `{motion.duration.medium}` |

Transition duration / easing are applied inline by the component, sourced
from the parent `<OrigamParallax>` provide context (so all elements stay
in sync).

The full list lives in
`tokens/component/parallax.json`.

## Accessibility

- Layers driven by parallax should never carry essential information —
  the effect is purely decorative. Pair with a static fallback
  composition for `prefers-reduced-motion`.
- Inline `transform` styles can interact with screen-magnifier
  trackers. Keep movement amplitudes (`strength`) reasonable on
  text-bearing layers.

## Theming notes

- The element ships no color tokens. Style its inner content (image,
  div, …) with the standard origam tokens (`--origam-color-*`) for
  theme awareness.

## Related

- `OrigamParallax` — the host that emits the
  movement context this element consumes.
