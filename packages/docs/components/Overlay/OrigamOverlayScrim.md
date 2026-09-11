# OrigamOverlayScrim

`<OrigamOverlayScrim>` is the **backdrop layer** drawn behind any
floating content. `<OrigamOverlay>` instantiates it internally, but it
is also exposed standalone for one-off needs (lightboxes, custom
overlays, page-level loaders, …).

The component is purely visual: a fixed-position div with a
configurable colour, opacity, and click handler. It animates with
`<OrigamFade>` by default.

## Basic usage

```vue
<template>
    <OrigamOverlayScrim :active="open" @click="open = false"/>
</template>
```

## Custom backdrop colour

`scrim` accepts a CSS-color or origam intent name. When `false`, the
backdrop renders transparent (and consumes no clicks via the
`pointer-events` token).

```vue
<template>
    <OrigamOverlayScrim :active="open" scrim="primary"/>
    <OrigamOverlayScrim :active="open" scrim="rgba(0, 200, 255, .35)"/>
</template>
```

## Inactive (no render)

When `active` is `false`, the component returns no DOM (the transition
handles the leave animation, then unmounts).

```vue
<template>
    <OrigamOverlayScrim :active="false"/>
</template>
```

## Custom transition

Replace the default fade with any registered origam transition.

```vue
<template>
    <OrigamOverlayScrim :active="open" :transition="{ component: OrigamSlideY }"/>
</template>
```

## Slots

The scrim has no slot — it is a backdrop, never a container. Layer
content above it via your own positioning.

## Events

| Name | Payload | When |
|---|---|---|
| `click` | `Event` | The user clicked the scrim. |
| `mouseenter` | `MouseEvent` | Pointer entered. |
| `mouseleave` | `MouseEvent` | Pointer left. |

## Props (interface)

```ts
interface IOverlayScrimProps extends ICommonsComponentProps, ITagProps,
    ITransitionComponentProps, IScrimProps {
    active?: boolean
}

interface IScrimProps {
    scrim?: boolean | string
}
```

## Anatomy

```html
<div class="origam-scrim"></div>
```

The element is `position: fixed; inset: 0` by default and consumes
pointer events so clicks on the surrounding page do not leak through.

## Design tokens consumed

`<OrigamOverlayScrim>` reads from `tokens/component/overlay-scrim.json`.

| CSS variable | Token reference |
|---|---|
| `--origam-overlay-scrim---background-color` | `{color.overlay.scrim}` (pending arbitrage #2) |
| `--origam-overlay-scrim---opacity` | `{opacity.32}` |
| `--origam-overlay-scrim---pointer-events` | `auto` |
| `--origam-overlay-scrim---border-radius` | `inherit` |
| `--origam-overlay-scrim---position` | `fixed` |
| `--origam-overlay-scrim---transition-property` | `opacity` |
| `--origam-overlay-scrim---transition-duration` | `{motion.duration.medium}` |
| `--origam-overlay-scrim---transition-timing-function` | `{motion.easing.standard}` |

## Accessibility

- The scrim is decorative. Add `aria-hidden="true"` if you place it in
  a context where it could leak into the accessibility tree.
- Make sure the surface above the scrim manages focus — the scrim
  does not trap focus on its own.
- When using a custom backdrop colour, double-check contrast on the
  content above.

## Theming notes

- Override `--origam-overlay-scrim---*` to tint the backdrop globally
  via tokens, or via inline `:style` for one-off tweaks.
- The default transition fades the scrim in/out over the medium motion
  duration. Replace via the `transition` prop for snappier or more
  dramatic behaviour.

## Related

- `OrigamOverlay` — full overlay primitive (uses this scrim
  internally).
- `OrigamFade` — the default enter/leave transition.
