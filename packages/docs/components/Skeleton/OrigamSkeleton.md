# OrigamSkeleton

`<OrigamSkeleton>` is a placeholder loading element that conveys the shape of
content before it arrives. It replaces blank areas with animated shimmer
blocks, reducing perceived loading time.

## Basic usage

```vue
<template>
    <!-- text line -->
    <OrigamSkeleton shape="text" width="200" />

    <!-- block rectangle -->
    <OrigamSkeleton shape="rectangular" width="100%" height="80px" />

    <!-- circular avatar placeholder -->
    <OrigamSkeleton shape="circular" width="48" />
</template>
```

## Shape and composition

> **Renamed in v3 (ADR-005, Q4).** The former single `variant` prop
> conflated two independent axes — a primitive **shape** and a composite
> **layout assembled from several shapes**. They are now two separate
> props: `shape` and `composition`. Setting `composition` selects an
> entirely different template branch, and `shape` is then ignored.

### `shape` — primitive block

| Value | Description |
|---|---|
| `text` | Short rectangle with `1.2em` default height — represents a line of text. |
| `rectangular` | Generic rectangle. Set `width` and `height` freely. |
| `circular` | Perfectly round placeholder. `height` mirrors `width`. |

### `composition` — preset assembled from several `shape` blocks

| Value | Description |
|---|---|
| `list-item` | Preset: circular avatar + 2 text lines side-by-side. |
| `card` | Preset: image rectangle + 3 text lines stacked vertically. |

```vue
<template>
    <OrigamSkeleton composition="card" />
    <OrigamSkeleton composition="list-item" />
</template>
```

## Loading toggle

When `loading` is `false` the skeleton is not rendered and the `default` slot
content is displayed instead.

```vue
<template>
    <OrigamSkeleton :loading="isLoading" shape="text" width="200">
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
    <OrigamSkeleton shape="rectangular" width="100%" height="60px" :pulse="false" />
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `shape` | `'text' \| 'rectangular' \| 'circular'` | `'rectangular'` | Primitive block shape. Ignored when `composition` is set. |
| `composition` | `'card' \| 'list-item'` | — | Composite layout assembled from several `shape` blocks. |
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
