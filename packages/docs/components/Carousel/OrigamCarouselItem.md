# OrigamCarouselItem

A single slide inside `<OrigamCarousel>`. It is a thin composition of two
existing components rather than a new one:

- the root is an `<OrigamWindowItem>` — which supplies the group membership,
  the selection lifecycle and the enter/leave transition;
- its default content is an `<OrigamImg>` — so the common case (an image
  slide) needs nothing beyond `src` and `alt`.

Fill the `#default` slot to replace the image entirely with arbitrary markup.

`<OrigamCarouselItem>` **emits nothing of its own** (`ICarouselItemEmits` is
empty): it only forwards props and slots to the two children.

## Basic usage

```vue
<template>
    <origam-carousel :model-value="0">
        <origam-carousel-item
                src="/img/slide-1.jpg"
                alt="Product overview"
        />
        <origam-carousel-item
                src="/img/slide-2.jpg"
                alt="Product detail"
        />
    </origam-carousel>
</template>
```

## Arbitrary slide content

```vue
<template>
    <origam-carousel :model-value="0">
        <origam-carousel-item>
            <origam-card height="100%">
                <origam-title>Welcome</origam-title>
                <p>Any markup is valid inside a slide.</p>
            </origam-card>
        </origam-carousel-item>
    </origam-carousel>
</template>
```

## Props

`ICarouselItemProps extends IImgProps, IWindowItemProps`. Everything the two
children accept is accepted here and forwarded; the tables below group the
surface by where the prop lands.

### Image (forwarded to `<OrigamImg>`)

| Name | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| ISrcObject` | `undefined` | Image source. The object form carries `src` / `srcset` / `lazySrc` / `aspectRatio` / `alt` together. |
| `alt` | `string` | `undefined` | Alternative text. Set it — a slide is content, not decoration. |
| `srcset` | `string` | `undefined` | Native `srcset` candidate list. |
| `sizes` | `string` | `undefined` | Native `sizes` hint, paired with `srcset`. |
| `lazySrc` | `string` | `undefined` | Low-resolution placeholder painted until the real image decodes. |
| `cover` | `boolean` | `false` | `object-fit: cover` instead of `contain`. |
| `position` | `string` | `undefined` | `object-position` value (`'center'`, `'top left'`, …). |
| `gradient` | `string` | `undefined` | CSS gradient layered over the image. |
| `draggable` | `boolean` | `undefined` | Native `draggable` attribute on the `<img>`. |
| `crossorigin` | `TCrossOrigin` | `undefined` | `'anonymous'` or `'use-credentials'`. |
| `referrerpolicy` | `TReferrerPolicy` | `undefined` | Native referrer policy. |
| `options` | `IIntersectionObserverInit` | `undefined` | `IntersectionObserver` options for the lazy-load trigger. |

### Group membership (forwarded to `<OrigamWindowItem>`)

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `any` | `undefined` | Identity of this slide inside the carousel group. When absent, the registration index is used. |
| `disabled` | `boolean` | `undefined` | Excludes the slide from navigation. |
| `selectedClass` | `string` | `undefined` | Extra class applied while this slide is the active one. |
| `eager` | `boolean` | `false` | Render the slide immediately instead of waiting for its first activation (`ILazyProps`). |

### Transition

| Name | Type | Default | Description |
|---|---|---|---|
| `transition` | `boolean \| string` | `undefined` | Transition used when this slide enters. A component name (`'origam-fade-transition'`), or `false` to disable. Narrower than `ITransitionComponentProps`' union — `ICarouselItemProps` redeclares it as `boolean \| string`. |
| `reverseTransition` | `boolean \| string` | `undefined` | Transition used when the carousel moves backwards. Inherited from `IWindowItemProps`. |

### Design (forwarded to `<OrigamImg>` via `IResponsiveProps`)

| Name | Type | Default | Description |
|---|---|---|---|
| `color` / `bgColor` | `TColor` | `undefined` | Foreground / background colour — intent token or raw CSS. |
| `rounded` | `TRounded` | `undefined` | Corner radius token. |
| `border` (+ `borderColor`, `borderStyle`) | `IBorderProps` | `undefined` | Border surface. |
| `width` / `height` / `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number \| string` | `undefined` | Full `IDimensionProps` surface. |
| `aspectRatio` | `string \| number` | `undefined` | Locks the slide's ratio. |
| `margin*` / `padding*` | `IMarginProps` / `IPaddingProps` | `undefined` | Spacing surface. |
| `inline` | `boolean` | `undefined` | Inline layout mode on the underlying `<OrigamResponsive>`. |
| `contentClass` | `string` | `undefined` | Class applied to the responsive content wrapper. |
| `id` / `class` / `style` | `ICommonsComponentProps` | `undefined` | Host identity and style passthrough. |

## Emits

None. `ICarouselItemEmits` is empty — the component never calls `emit()`.
The image lifecycle events (`load`, `loadstart`, `error`) belong to
`<OrigamImg>`; they are **not** re-emitted here. Reach them by putting your own
`<origam-img>` in the `#default` slot.

## Slots

| Name | Bindings | Description |
|---|---|---|
| `default` | — | Replaces the whole `<OrigamImg>`. When filled, none of the image props do anything and the three slots below become unreachable. |
| `content` | — | Overlay rendered inside the image (forwarded to `<OrigamImg>`'s own `#default`). Use it for a caption or a gradient scrim. |
| `error` | — | Rendered when the image fails to load. |
| `placeholder` | — | Rendered while the image is still loading. |

## Behaviour notes

**`#default` short-circuits the image.** The template is
`<slot name="default"><origam-img …/></slot>`: filling `#default` removes the
`<origam-img>` from the tree, so `src`, `cover`, `gradient`, `#content`,
`#error` and `#placeholder` all stop mattering. Pick one mode or the other.

**Unset boolean-union props are not forwarded (#428).** `rounded`, `border`,
`bgColor` and `color` each accept a `boolean` member in their union, and Vue
resolves an unset prop of that shape to the concrete value `false`, never
`undefined`. Forwarding that `false` blindly would permanently outrank
`theme.components['origam-img']`. The component therefore uses
`usePassedProps` — which reads `vnode.props`, the raw value the parent template
actually wrote — and re-applies those four only when the consumer really passed
them. A prop you did not set is genuinely absent from the object bound onto
`<origam-img>`, so the image's own theme default resolves normally.

**Height.** The scoped rule is `height: inherit`, and `> .origam-img` inherits
in turn. Give the carousel (or an ancestor) an explicit height; a slide has no
intrinsic one.

**Lazy by default.** `<OrigamWindowItem>` mounts a slide on its first
activation. Pass `eager` when a slide must exist in the DOM from the start —
for measurement, or for SEO on the first slide.

**Exposed instance API.** `defineExpose` surfaces `filterProps` plus the
`useStyle` handles (`css`, `id`, `load`, `unload`, `isLoaded`), matching the
convention used across the DS for components that host a style block.

## Related

- [`OrigamCarousel`](/components/Carousel/OrigamCarousel) — the container that owns navigation, delimiters and auto-play.
- [`OrigamWindowItem`](/components/Window/OrigamWindowItem) — the root this component renders.
- [`OrigamImg`](/components/Img/OrigamImg) — the default slide content.
