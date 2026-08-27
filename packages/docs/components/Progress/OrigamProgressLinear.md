# OrigamProgressLinear

`<OrigamProgressLinear>` renders a horizontal progress bar. It supports
determinate fill, indeterminate animation (two-bar marquee), buffered
streaming (with optional dotted stream marker), reverse direction, and
pinned positioning (absolute / fixed top or bottom).

## Basic usage

```vue
<template>
    <OrigamProgressLinear :model-value="42" />
    <OrigamProgressLinear indeterminate />
</template>
```

## Determinate vs indeterminate

```vue
<template>
    <OrigamProgressLinear :model-value="0" />
    <OrigamProgressLinear :model-value="50" />
    <OrigamProgressLinear :model-value="100" />

    <OrigamProgressLinear indeterminate />
</template>
```

## Buffer + stream

`bufferValue` paints a darker ghost zone "ahead" of the main bar - typical
for buffered media. `stream` adds a dotted indicator that animates from the
buffer edge.

```vue
<template>
    <OrigamProgressLinear
        :model-value="35"
        :buffer-value="60"
        stream
    />
</template>
```

Note: the `stream` indicator (and the indeterminate bar) only animates
while `active` is true — `active` defaults to `true`, so this runs out of
the box. Pass `:active="false"` to pause it (e.g. an off-screen bar).

## Thickness

The `thickness` prop (default `4`) controls the bar height (in px).

```vue
<template>
    <OrigamProgressLinear :model-value="40" :thickness="2" />
    <OrigamProgressLinear :model-value="40" :thickness="8" />
    <OrigamProgressLinear :model-value="40" :thickness="16" />
</template>
```

## Color (intent)

```vue
<template>
    <OrigamProgressLinear color="primary"  :model-value="50" />
    <OrigamProgressLinear color="success"  :model-value="100" />
    <OrigamProgressLinear color="danger"   :model-value="20" />
    <OrigamProgressLinear color="warning"  :model-value="60" />
</template>
```

`color` paints the foreground bar; `bgColor` paints the track. Both go
through token resolution (`useTextColor`).

## Reverse direction

Useful for RTL or "remaining" semantics.

```vue
<template>
    <OrigamProgressLinear :model-value="40" />
    <OrigamProgressLinear :model-value="40" reverse />
</template>
```

The component also reacts to `dir="rtl"` automatically via `useRtl`.

## Position (absolute / fixed)

Anchor the bar to the top or bottom of its scroll container (absolute) or
of the viewport (fixed). Combined with `location="top"` / `location="bottom"`.

```vue
<template>
    <!-- Sticks to the top of the parent stacking context -->
    <OrigamProgressLinear absolute location="top" indeterminate />

    <!-- Pinned to the viewport's bottom edge -->
    <OrigamProgressLinear class="origam-progress--fixed" location="bottom" indeterminate />
</template>
```

## Rounded

```vue
<template>
    <OrigamProgressLinear :model-value="50" rounded />
    <OrigamProgressLinear :model-value="50" rounded="lg" />
</template>
```

`rounded` accepts the same values as the rest of origam (boolean, named
radius, or a free-form CSS string).

## Clickable (seek)

When `clickable` is true the user can click anywhere on the bar to set its
value (good for seek bars on media players).

```vue
<template>
    <OrigamProgressLinear v-model="value" clickable />
</template>
```

## Slot (label)

```vue
<template>
    <OrigamProgressLinear :model-value="73" :buffer-value="90">
        <template #default="{ value, buffer }">
            <small>{{ Math.round(value) }}% (buffer {{ Math.round(buffer) }}%)</small>
        </template>
    </OrigamProgressLinear>
</template>
```

## Props (interface)

```ts
interface IProgressLinearProps extends IProgressTypeProps, IRoundedProps, ILocationProps {
    bufferValue?: number | string
    clickable?: boolean
    reverse?: boolean
    stream?: boolean
}
```

## Anatomy

```html
<div class="origam-progress origam-progress--linear">
    <div class="origam-progress__stream" />          <!-- dotted stream    -->
    <div class="origam-progress__background" />      <!-- track / buffer   -->

    <div class="origam-progress__loader">
        <div class="origam-progress__bar origam-progress__bar--long"  />  <!-- indeterminate -->
        <div class="origam-progress__bar origam-progress__bar--short" />  <!-- indeterminate -->
        <!-- or one bar in determinate mode -->
    </div>

    <div class="origam-progress__content">
        <!-- default slot (label) -->
    </div>
</div>
```

## Design tokens consumed

`<OrigamProgressLinear>` reads from `tokens/component/progress-linear.json`.

| CSS variable                                                 | Token reference                          |
|--------------------------------------------------------------|------------------------------------------|
| `--origam-progress-linear---background`                      | `transparent`                            |
| `--origam-progress-linear---width`                           | `100%`                                   |
| `--origam-progress-linear---transition-duration`             | `{motion.duration.medium}`               |
| `--origam-progress-linear---rounded-border-radius`           | `{radius.full}`                          |
| `--origam-progress-linear__background---color` (BEM legacy)  | `inherit` (overridden by `bgColor` prop) |
| `--origam-progress-linear__background---opacity`             | `{opacity.50}`                           |
| `--origam-progress-linear__loader---color` (BEM legacy)      | `inherit` (overridden by `color` prop)   |
| `--origam-progress-linear---indeterminate-duration`          | `2200ms` (animation-specific)            |

## Accessibility

`<OrigamProgressLinear>` owns its full ARIA contract (#500) — it is
accessible **standalone**, with no `<OrigamProgress>` wrapper required.

- Renders `role="progressbar"` on its own root.
- `aria-valuemin="0"`, `aria-valuemax` mirrors `max`.
- `aria-valuenow` is set to the normalised value in determinate mode.
  In `indeterminate` mode it is **omitted entirely** (not set to `0`) —
  the ARIA spec reserves `aria-valuenow` for a known value, and
  `indeterminate` progress has none.
- `aria-busy="true"` is set while `indeterminate`.
- `aria-label` resolves the `label` prop (a locale key, default
  `origam.loading`) through the DS `t()` mechanism.
- `aria-hidden` mirrors the `active` prop (default `true`) — set
  `active="false"` to intentionally hide an off-screen or paused
  indicator.
- When `clickable` is enabled, the bar accepts pointer input - pair with a
  visible label so the seek behaviour is discoverable.

When mounted through `<OrigamProgress type="linear">`, the wrapper
forwards `label`/`active`/`modelValue`/`max`/`indeterminate` down to this
component via `filterProps` — the wrapper itself declares no ARIA
attribute, so there is only ever one `role="progressbar"` in the DOM.

## Theming notes

- Theme-aware: every CSS variable resolves on the active `data-theme`.
- The `striped` prop adds a class but no SCSS rule is shipped yet -
  reserved for a future visual variant.

## Related

- `OrigamProgress` - dispatcher with `type` prop.
- `OrigamProgressCircular` - circular variant.
- `OrigamLoader` - toggle wrapper around any progress.
