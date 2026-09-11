# OrigamProgressCircular

`<OrigamProgressCircular>` renders a SVG-based circular progress indicator.
It supports both a determinate mode (driven by `modelValue` / `max`) and an
indeterminate mode (continuously animated dash + rotation).

The component is the visual workhorse behind `<OrigamLoader>` and is also
embedded in `<OrigamBtn loading>`.

## Basic usage

```vue
<template>
    <OrigamProgressCircular :model-value="42" />
    <OrigamProgressCircular indeterminate />
</template>
```

## Determinate vs indeterminate

```vue
<template>
    <OrigamProgressCircular :model-value="25" />
    <OrigamProgressCircular :model-value="50" :max="100" />

    <!-- Endless animation -->
    <OrigamProgressCircular indeterminate />
</template>
```

## Sizes

The size prop drives a CSS class (`origam-progress--circular--size-{size}`)
that pins explicit width/height in CSS:

```vue
<template>
    <OrigamProgressCircular indeterminate size="x-small" />
    <OrigamProgressCircular indeterminate size="small" />
    <OrigamProgressCircular indeterminate size="default" />
    <OrigamProgressCircular indeterminate size="large" />
    <OrigamProgressCircular indeterminate size="x-large" />
</template>
```

You can also pass a number to size for a custom px value (forwarded as a
style hint via `useSize`).

## Thickness

The `thickness` prop (default `4`) scales the SVG `stroke-width`. Combined
with `size`, it controls the visual weight of the ring.

```vue
<template>
    <OrigamProgressCircular indeterminate :thickness="2" />
    <OrigamProgressCircular indeterminate :thickness="6" size="large" />
</template>
```

## Rotate

The `rotate` prop (deg) shifts the start angle of the determinate arc.
Useful for designing dashboards where the arc must align with a custom axis.

```vue
<template>
    <OrigamProgressCircular :model-value="33" :rotate="0" />
    <OrigamProgressCircular :model-value="33" :rotate="90" />
    <OrigamProgressCircular :model-value="33" :rotate="180" />
</template>
```

## Color (intent)

```vue
<template>
    <OrigamProgressCircular color="primary"  :model-value="50" />
    <OrigamProgressCircular color="success"  :model-value="100" />
    <OrigamProgressCircular color="danger"   :model-value="20" />
    <OrigamProgressCircular color="warning"  :model-value="60" />
</template>
```

`color` paints the **overlay arc** (the moving stroke); `bgColor` paints the
**underlay ring** (the muted track behind the arc).

## Slot (label)

The default slot receives the normalised `value` so you can render a label
inside the ring:

```vue
<template>
    <OrigamProgressCircular :model-value="73" size="x-large">
        <template #default="{ value }">
            <strong>{{ Math.round(value) }}%</strong>
        </template>
    </OrigamProgressCircular>
</template>
```

## Props (interface)

```ts
interface IProgressCircularProps extends IProgressTypeProps, ISizeProps {
    rotate?: string | number
}
```

## Anatomy

```html
<div class="origam-progress origam-progress--circular origam-progress--circular--size-default">
    <svg viewBox="0 0 ...">
        <circle class="origam-progress__underlay" />   <!-- track -->
        <circle class="origam-progress__overlay"  />   <!-- arc   -->
    </svg>
    <div class="origam-progress__content">
        <!-- default slot (label) -->
    </div>
</div>
```

## Design tokens consumed

`<OrigamProgressCircular>` reads from `tokens/component/progress-circular.json`.

| CSS variable                                            | Token reference                          |
|---------------------------------------------------------|------------------------------------------|
| `--origam-progress-circular__underlay---color`          | `{color.surface.disabled}`               |
| `--origam-progress-circular__underlay---opacity`        | `{opacity.50}`                           |
| `--origam-progress-circular__overlay---color`           | `inherit` (overridden by `color` prop)   |
| `--origam-progress-circular---transition-duration`      | `{motion.duration.medium}` (200ms)       |
| `--origam-progress-circular---transition-easing`        | `{motion.easing.standard}`               |
| `--origam-progress-circular---indeterminate-duration`   | `1400ms` (animation-specific)            |

## Accessibility

- Renders with `role="progressbar"` (set by parent `OrigamProgress`).
- `aria-valuemin="0"`, `aria-valuemax` mirrors `max`.
- `aria-valuenow` is set when not `indeterminate`.
- The continuous spin is purely decorative; assistive tech announces only
  the value changes.

## Theming notes

- Theme-aware: switching `<html data-theme="dark">` re-resolves every
  variable, no Vue re-render required.
- For one-off custom colors use `:style="{ '--origam-progress-circular__overlay---color': 'var(--my-brand)' }"`.

## Related

- `OrigamProgress` - dispatcher with the `type` prop.
- `OrigamProgressLinear` - bar variant.
- `OrigamLoader` - simple toggle wrapper that uses this component by default.
