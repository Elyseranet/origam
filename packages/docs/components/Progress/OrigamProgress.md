# OrigamProgress

`<OrigamProgress>` is a **dispatcher** component that renders either
`<OrigamProgressCircular>` or `<OrigamProgressLinear>` depending on the
`type` prop. It forwards every relevant prop to the picked variant via
`filterProps`, so consumers only learn one API.

Use it when the surface that owns the spinner needs to be configurable
(circular for buttons / inline placeholders, linear for top bars and
upload progress).

## Basic usage

```vue
<template>
    <OrigamProgress type="circular" :model-value="42" />
    <OrigamProgress type="linear"   :model-value="42" />
</template>
```

## Type (circular vs linear)

| Type       | Default ARIA role | Best for                                        |
|------------|-------------------|-------------------------------------------------|
| `circular` | `progressbar`     | Buttons, inline content, small surfaces.        |
| `linear`   | `progressbar`     | Top bars, table headers, file upload, hero.     |

```vue
<template>
    <OrigamProgress type="circular" indeterminate />
    <OrigamProgress type="linear"   indeterminate />
</template>
```

## Determinate vs indeterminate

```vue
<template>
    <!-- Determinate -->
    <OrigamProgress type="linear" :model-value="65" :max="100" />

    <!-- Indeterminate -->
    <OrigamProgress type="circular" indeterminate />
</template>
```

`modelValue` (defaults to `0`) and `max` (defaults to `100`) drive the fill
ratio. When `indeterminate` is true the value is ignored and the animation
runs in a loop.

## Sizes

```vue
<template>
    <OrigamProgress type="circular" size="x-small" />
    <OrigamProgress type="circular" size="small" />
    <OrigamProgress type="circular" size="default" />
    <OrigamProgress type="circular" size="large" />
    <OrigamProgress type="circular" size="x-large" />
</template>
```

For the linear variant, height is driven by `thickness` (default `4`).

## Color (intent)

```vue
<template>
    <OrigamProgress type="circular" color="primary" indeterminate />
    <OrigamProgress type="linear"   color="success" :model-value="80" />
    <OrigamProgress type="linear"   color="danger"  bg-color="neutral" :model-value="20" />
</template>
```

`color` paints the foreground (the moving arc/bar). `bgColor` paints the
underlay (track / buffer ring).

## Slots

```vue
<template>
    <OrigamProgress type="circular" :model-value="42">
        <template #default="{ value }">
            <strong>{{ Math.round(value) }}%</strong>
        </template>
    </OrigamProgress>
</template>
```

The `default` slot receives the normalised value (and `buffer` for linear)
so consumers can render labels in sync with the bar.

## Props (interface)

```ts
interface IProgressProps extends IProgressLinearProps, IProgressCircularProps {
    type?: TProgressType  // 'circular' | 'linear'
}

interface IProgressTypeProps {
    indeterminate?: boolean
    modelValue?: string | number   // default 0
    thickness?: string | number    // default 4
    active?: boolean
    absolute?: boolean
    max?: number | string          // default 100
    striped?: boolean              // reserved (linear); class emitted, not yet styled
}
```

## Design tokens consumed

`<OrigamProgress>` reads from `tokens/component/progress.json`. The wrapper
itself only sets layout tokens; the visuals come from the picked child.

| CSS variable                                        | Token reference                |
|-----------------------------------------------------|--------------------------------|
| `--origam-progress---display`                       | `block`                        |
| `--origam-progress---width`                         | `100%`                         |
| `--origam-progress__content---align-items`          | `center`                       |
| `--origam-progress__content---justify-content`      | `center`                       |
| `--origam-progress__content---position`             | `absolute`                     |

## Accessibility

- The dispatched variant is rendered with `role="progressbar"`.
- `aria-valuemin="0"`, `aria-valuemax` follows `max`.
- `aria-valuenow` is set when `indeterminate` is false.
- `aria-hidden` mirrors the `active` prop (so off-screen progress bars do
  not surface to assistive tech).

## Related

- `OrigamProgressCircular` - the round spinner variant.
- `OrigamProgressLinear` - the bar variant with buffer/stream support.
- `OrigamLoader` - simple toggle between content and a default spinner.
