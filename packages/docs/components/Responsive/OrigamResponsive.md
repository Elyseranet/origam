# OrigamResponsive

`<OrigamResponsive>` is the aspect-ratio container for origam — an
intrinsic-size box that locks its content to a target ratio (16/9,
1/1, 3/4, …) without JavaScript. It's the underlying primitive of
`<OrigamImg>`, `<OrigamCard>`'s media slot, and any embed (video,
iframe, canvas).

The component leans on the CSS `aspect-ratio` property when supported
(every evergreen browser) and falls back to a padding-block-end sizer
trick otherwise — driven by the `useAspectRatio` composable.

## Basic usage

```vue
<template>
    <OrigamResponsive aspect-ratio="16/9">
        <img src="/hero.jpg" alt="" />
    </OrigamResponsive>
</template>
```

## Aspect ratio

`aspectRatio` accepts a string (`"16/9"`, `"3/4"`) or a number (`1.7778`).

```vue
<template>
    <OrigamResponsive aspect-ratio="16/9">16:9</OrigamResponsive>
    <OrigamResponsive aspect-ratio="1/1">1:1 (square)</OrigamResponsive>
    <OrigamResponsive aspect-ratio="3/4">3:4 (portrait)</OrigamResponsive>
    <OrigamResponsive :aspect-ratio="2.39">2.39:1 (cinema)</OrigamResponsive>
</template>
```

## Inline mode

`inline` switches the wrapper from `block` to `inline-flex`, useful
when the component is dropped into a paragraph or a chip-like context.

```vue
<template>
    <p>
        Inline embed:
        <OrigamResponsive inline aspect-ratio="1/1" :width="32" :height="32">
            <img src="/avatar.png" alt="" />
        </OrigamResponsive>
    </p>
</template>
```

## Dimensions

`width` / `height` / `min-*` / `max-*` apply to the outer wrapper —
the inner sizer enforces the ratio.

```vue
<template>
    <OrigamResponsive aspect-ratio="16/9" max-width="640">
        <video src="/intro.mp4" />
    </OrigamResponsive>
</template>
```

## Modifiers

```vue
<template>
    <OrigamResponsive aspect-ratio="16/9" rounded border>
        <img src="/hero.jpg" alt="" />
    </OrigamResponsive>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Content wrapped at the target ratio. |
| `additional` | — | Extra content placed alongside the sizer (e.g. an overlay caption). |

```vue
<template>
    <OrigamResponsive aspect-ratio="16/9">
        <img src="/hero.jpg" alt="" />
        <template #additional>
            <span class="badge">Live</span>
        </template>
    </OrigamResponsive>
</template>
```

## Props (interface)

```ts
interface IResponsiveProps extends IDimensionProps, ICommonsComponentProps,
    IPaddingProps, IMarginProps, IBorderProps, IRoundedProps {
    aspectRatio?:  string | number
    contentClass?: string
    inline?:       boolean
}
```

## Anatomy

```html
<div class="origam-responsive [origam-responsive--inline]">
    <div class="origam-responsive__sizer" :style="{ aspectRatio }" />
    <!-- additional slot -->
    <div class="origam-responsive__content">
        <!-- default slot -->
    </div>
</div>
```

## Design tokens consumed

`<OrigamResponsive>` reads from `tokens/component/responsive.json`.

| CSS variable | Default |
|---|---|
| `--origam-responsive---display` | `flex` |
| `--origam-responsive---flex` | inherits |
| `--origam-responsive---max-height` | inherits |
| `--origam-responsive---max-width` | `100%` |
| `--origam-responsive---min-width` | inherits |
| `--origam-responsive---min-height` | inherits |
| `--origam-responsive---overflow` | `hidden` |
| `--origam-responsive---position` | `relative` |
| `--origam-responsive---width` | inherits |
| `--origam-responsive---height` | inherits |
| `--origam-responsive--inline---display` | `inline-flex` |
| `--origam-responsive--inline---flex` | inherits |
| `--origam-responsive__content---flex` | `1 1 auto` |
| `--origam-responsive__content---max-width` | `100%` |
| `--origam-responsive__content---margin` | inherits |
| `--origam-responsive__sizer---flex` | inherits |
| `--origam-responsive__sizer---transition` | inherits |
| `--origam-responsive__sizer---pointer-events` | `none` |
| `--origam-responsive__sizer---padding-block-end` | computed by useAspectRatio |

The token file also exposes named ratio shortcuts (`aspect-ratio-default`,
`aspect-ratio-square`, `aspect-ratio-portrait`).

## Accessibility

- The wrapper is presentational. Pass `alt=""` on decorative images
  inside the slot, and a meaningful `alt` on content images.
- For embedded `<video>` / `<iframe>` content, ensure the inner
  element exposes the appropriate `title` attribute.
- The `aspect-ratio` lock is a visual constraint only — assistive
  tech sees the inner content unchanged.

## Theming notes

- The component is theme-aware. Switching `<html data-theme="…">`
  re-resolves every variable instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamImg` — image wrapper that builds on `<OrigamResponsive>`.
- `useAspectRatio` — the underlying CSS-first ratio composable.
