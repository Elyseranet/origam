# OrigamSkeleton

`<OrigamSkeleton>` is a placeholder loading element that conveys the shape of
content before it arrives. It replaces blank areas with animated shimmer
blocks, reducing perceived loading time.

## Basic usage

```vue
<template>
    <!-- text line -->
    <OrigamSkeleton variant="text" width="200" />

    <!-- block rectangle -->
    <OrigamSkeleton variant="rectangular" width="100%" height="80px" />

    <!-- circular avatar placeholder -->
    <OrigamSkeleton variant="circular" width="48" />
</template>
```

## Variants

| Variant | Description |
|---|---|
| `text` | Short rectangle with `1.2em` default height — represents a line of text. |
| `rectangular` | Generic rectangle. Set `width` and `height` freely. |
| `circular` | Perfectly round placeholder. `height` mirrors `width`. |
| `list-item` | Preset: circular avatar + 2 text lines side-by-side. |
| `card` | Preset: image rectangle + 3 text lines stacked vertically. |

## Loading toggle

When `loading` is `false` the skeleton is not rendered and the `default` slot
content is displayed instead.

```vue
<template>
    <OrigamSkeleton :loading="isLoading" variant="text" width="200">
        <p>Content loaded</p>
    </OrigamSkeleton>
</template>
```

## Pulse animation

`pulse` (default `true`) enables a CSS-only `@keyframes` animation that
oscillates the background opacity between `0.4` and `0.8`. Disable it for
content where motion reduction is preferred.

```vue
<template>
    <OrigamSkeleton variant="rectangular" width="100%" height="60px" :pulse="false" />
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'text' \| 'rectangular' \| 'circular' \| 'card' \| 'list-item'` | `'rectangular'` | Visual shape. |
| `width` | `string \| number` | — | CSS width (e.g. `200`, `'100%'`, `'12rem'`). |
| `height` | `string \| number` | — | CSS height. |
| `loading` | `boolean` | `true` | When `false`, renders the slot content instead. |
| `pulse` | `boolean` | `true` | Enables the opacity pulse animation. |
| `rounded` | `TRounded \| boolean \| number \| string` | — | Corner radius override (shared mixin). |
| `bgColor` | `TColor` | — | Background color intent override. |

## Design tokens

| CSS variable | Default |
|---|---|
| `--origam-skeleton---background-color` | `{color.surface.overlay}` |
| `--origam-skeleton---border-radius` | `{radius.sm}` |
| `--origam-skeleton---border-radius-circular` | `{radius.full}` |
| `--origam-skeleton---animation-duration` | `{motion.duration.slower}` |
| `--origam-skeleton---opacity-min` | `0.4` |
| `--origam-skeleton---opacity-max` | `0.8` |
| `--origam-skeleton---text-height` | `1.2em` |
