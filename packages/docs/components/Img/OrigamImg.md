# OrigamImg

`<OrigamImg>` is the lazy-aware, aspect-locked image primitive for origam.
It wraps the native `<img>` element inside an `OrigamResponsive` sizer so
the layout never reflows once the picture finishes loading, and adds the
full chrome mixin set (color, rounded, border, padding, margin) that
every other origam atom inherits.

It is the engine behind `OrigamAvatar` (which forces `cover` + a 1:1
ratio) and the picture surface used by `OrigamCard` / `OrigamHeader`.

## Basic usage

```vue
<template>
    <OrigamImg
        src="https://picsum.photos/seed/origam/640/360"
        :aspect-ratio="16 / 9"
        alt="Demo"
    />
</template>
```

## Lazy loading

The component uses an `IntersectionObserver` (via the `v-intersect`
directive) to defer the network request until the image enters the
viewport. Pass `eager` to disable that behaviour, or `lazySrc` to render
a low-resolution preview while the full image loads.

```vue
<template>
    <OrigamImg
        src="https://picsum.photos/seed/origam-large/1600/900"
        lazy-src="https://picsum.photos/seed/origam-large/40/22"
        :aspect-ratio="16 / 9"
        alt="Lazy"
    />

    <!-- skip the IntersectionObserver entirely -->
    <OrigamImg
        src="https://picsum.photos/seed/origam-eager/640/360"
        :aspect-ratio="16 / 9"
        eager
        alt="Eager"
    />
</template>
```

## Object fit

`cover` toggles between `object-fit: contain` (default) and
`object-fit: cover`. Use `position` to reposition the picture inside
the sizer (any valid `object-position` string).

```vue
<template>
    <OrigamImg
        src="https://picsum.photos/seed/origam-cover/640/360"
        :aspect-ratio="1"
        cover
        position="center top"
        alt="Cover, top-aligned"
    />
</template>
```

## Aspect ratio

`aspectRatio` can be a number (`16 / 9`), a numeric string (`'1.7777'`),
or come from a structured `src` object that includes its own ratio (so
you can ship the metadata alongside the URL). When omitted the sizer
falls back to the natural dimensions of the image.

```vue
<template>
    <OrigamImg
        :src="{ src: 'https://picsum.photos/seed/origam-square/400/400', aspectRatio: 1 }"
        alt="Square via src object"
    />
</template>
```

## Gradient overlay

Pass a CSS gradient string to `gradient` and the component layers it on
top of the picture. Convenient for caption legibility or hero banners.

```vue
<template>
    <OrigamImg
        src="https://picsum.photos/seed/origam-grad/640/360"
        :aspect-ratio="16 / 9"
        gradient="to bottom, transparent 40%, rgba(0,0,0,0.6) 100%"
        alt="Hero with gradient overlay"
    />
</template>
```

## Color tinting

Like every origam atom, `color` and `bg-color` accept either a
`TIntent` value or a CSS color string. The hex / rgb form is deprecated
since v0.4 and emits a one-shot console warning.

```vue
<template>
    <OrigamImg color="primary" bg-color="surface-overlay" :aspect-ratio="1" />
</template>
```

## States & slots

| Slot | Rendered when |
|---|---|
| `default` | Always — projected on top of the image, behind the gradient. |
| `placeholder` | While the image is loading and `lazySrc` is not set. |
| `error` | When the image errors out. Replaces the placeholder. |

```vue
<template>
    <OrigamImg :src="brokenUrl" :aspect-ratio="16 / 9" alt="Broken">
        <template #error>
            <div class="error-state">Failed to load image</div>
        </template>
        <template #placeholder>
            <div class="loading-state">Loading…</div>
        </template>
    </OrigamImg>
</template>
```

## Events

| Event | Payload | Description |
|---|---|---|
| `loadstart` | `currentSrc: string` | Network request started. |
| `load` | `currentSrc: string` | Image fully decoded. |
| `error` | `currentSrc: string` | Native `<img>` error fired. |

## Props (interface)

```ts
interface IImgProps extends IColorProps, IResponsiveProps,
    ITransitionComponentProps, ILazyProps {
    alt?: string
    cover?: boolean
    draggable?: boolean
    gradient?: string
    lazySrc?: string
    options?: IIntersectionObserverInit
    sizes?: string
    src?: string | ISrcObject
    crossorigin?: TCrossOrigin
    referrerpolicy?: TReferrerPolicy
    srcset?: string
    position?: string
}

interface ISrcObject {
    src?: string
    srcset?: string
    lazySrc?: string
    aspectRatio: number
    alt?: string
}
```

## Anatomy

```html
<div class="origam-responsive origam-img">
    <div class="origam-responsive__sizer"></div>
    <img class="origam-img__picture origam-img__picture--cover" />
    <div class="origam-img__gradient"></div>
    <!-- placeholder / error overlays as needed -->
</div>
```

## Design tokens consumed

`<OrigamImg>` reads from `tokens/component/img.json`. The defaults are
unopinionated (positioning, fit, blur for the `lazySrc`) so the
component blends into any surface.

| CSS variable | Purpose |
|---|---|
| `--origam-img---z-index` | Sizer stacking order. |
| `--origam-img--booting---transition` | Transition applied while booting. |
| `--origam-img--rounded---border-radius` | Override when `rounded` is used. |
| `--origam-img__picture---*` | Layout of the inner `<img>` (position, fit). |
| `--origam-img__picture--preload---filter` | Blur applied to `lazySrc`. |
| `--origam-img__gradient---*` | Gradient overlay positioning. |
| `--origam-img__placeholder---*` | Placeholder slot positioning. |
| `--origam-img__error---*` | Error slot positioning. |

## Accessibility

- Pass `alt` for any meaningful image. The component forwards it to the
  inner `<img>` and mirrors it on the wrapper as `aria-label` when
  present, so screen readers announce the image regardless of which
  layer captures focus.
- Decorative images should pass `alt=""` so AT skip the picture.
- The component does not trap focus. If the image acts as a link,
  wrap it in a focusable element (`<a>`, `<router-link>`).

## Theming notes

The component itself only sets neutral chrome (positioning, fit,
preload blur). Background tints come from the host surface or the
`bg-color` mixin. Switching `<html data-theme="dark">` re-resolves
`--origam-color__surface---*` automatically.

## Related

- `OrigamAvatar` — round, fixed-size variant built on top of this
  component.
- `OrigamResponsive` — the underlying aspect-ratio sizer.
- `OrigamTransition` — the fade used between loading and loaded
  states.
