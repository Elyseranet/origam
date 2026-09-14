# OrigamResponsive

`<OrigamResponsive>` is the aspect-ratio container for origam — an
intrinsic-size box that locks its content to a target ratio (16/9,
1/1, 3/4, …) without JavaScript. It's the underlying primitive of
`<OrigamImg>`, `<OrigamCard>`'s media slot, and any embed (video,
iframe, canvas).

The component sets the native CSS `aspect-ratio` property on its own root
element, driven by the `useAspectRatio` composable. There is no fallback
path and no sizer child: `aspect-ratio` is Baseline Widely Available
(Chrome/Edge 88, Firefox 89, Safari 15 — all 2021), comfortably below this
DS's support floor.

::: warning Changed in #709
Until #709 the ratio was held by the classic padding-percentage hack — an
empty `.origam-responsive__sizer` child carrying
`padding-block-end: <inverse-ratio>%`, with `__content` pulled back over it
by the exact opposite `margin-block-start`. Because the root is a column
flex container, those two values **cancelled arithmetically** and the root
collapsed to the height of its content: `<OrigamResponsive aspect-ratio="16/9"
max-width="480">` measured **480 × 23** instead of 480 × 270, and 16/9 and
4/3 rendered the *same* height.

The paragraph that used to sit here claimed the component already used
`aspect-ratio` "when supported, falling back to the sizer trick otherwise".
It never did — only the sizer path existed. If you are relying on the
`__sizer` element or on the four `--origam-responsive__sizer---*` tokens,
both are gone.
:::

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
}
```

## Anatomy

```html
<div class="origam-responsive" :style="{ aspectRatio }">
    <!-- additional slot -->
    <div class="origam-responsive__content">
        <!-- default slot -->
    </div>
</div>
```

The ratio lives on the root. `__content` is rendered only when the default
slot is filled.

## Design tokens consumed

`<OrigamResponsive>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`).

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
| `--origam-responsive__content---flex` | `1 1 auto` |
| `--origam-responsive__content---max-width` | `100%` |
| `--origam-responsive__content---margin` | inherits |

The four `--origam-responsive__sizer---*` tokens were **removed in #709**
along with the element they styled.

The ratio itself is **not** a token: it is an inline `aspect-ratio`
declaration computed from the `aspectRatio` prop at runtime, never a
design-time default a theme would override. To pin a ratio from a theme,
set the `aspectRatio` **prop** through `IOrigamTheme.components`
(props-first), not a CSS variable.

The token file also exposes named ratio shortcuts (`aspect-ratio-default`,
`aspect-ratio-square`, `aspect-ratio-portrait`). ⚠️ No component reads
them — they are declared-but-dormant, and were already so before #709.

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
