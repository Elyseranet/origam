# OrigamProgress

`<OrigamProgress>` is a **dispatcher** component that renders either
`<OrigamProgressCircular>` or `<OrigamProgressLinear>` depending on the
`type` prop. It forwards every relevant prop to the picked variant via
`filterProps`, so consumers only learn one API.

Use it when the surface that owns the spinner needs to be configurable
(circular for buttons / inline placeholders, linear for top bars and
upload progress).

> **Accessibility ownership (#500).** `<OrigamProgress>` is a pure layout
> dispatcher — it carries **no ARIA semantics of its own**. `role`,
> `aria-value*`, `aria-busy`, `aria-label` and `aria-hidden` all live on
> whichever concrete component it delegates to
> (`<OrigamProgressCircular>` / `<OrigamProgressLinear>`), because it
> delegates its entire render to that component (`<component :is="…">`,
> a single DOM root — never an extra wrapping node). Both concrete
> components are exported publicly and documented separately, and both
> are fully accessible **standalone**, with no wrapper required. See
> their own docs' Accessibility sections for details.

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
    active?: boolean                // default true
    absolute?: boolean
    max?: number | string          // default 100
    striped?: boolean              // reserved (linear); class emitted, not yet styled
    label?: string                 // locale key, default 'origam.loading'
}
```

### `active` — visible / running state

`active` defaults to **`true`**: a mounted progress bar is assumed to be
currently relevant and must stay reachable to assistive tech and animated
by default (`indeterminate` bars/streams only run while `active`). Pass
`active="false"` explicitly to pause an off-screen or intentionally
hidden indicator — that is the only case where it should surface as
`aria-hidden="true"` (see Accessibility below).

### `label` — accessible name

`label` feeds the `aria-label` of the `role="progressbar"` element. It
carries a **locale key**, not final text: it is resolved through the DS
`t()` mechanism, so the announcement follows the active locale out of the
box. It defaults to `origam.loading`, the shared key also used by
`OrigamSkeleton`, `OrigamVideo`, `OrigamAudio` and `OrigamSwitch`.

```vue
<!-- Default — announced in the active locale -->
<OrigamProgress :model-value="42" />

<!-- Your own key, added to your locale files -->
<OrigamProgress :model-value="42" label="upload.progress_photo" />
```

A raw string that matches no key is returned unchanged, so
`label="Uploading photo"` still works if you'd rather translate on your
side.

## Design tokens consumed

`<OrigamProgress>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`). The wrapper
itself only sets layout tokens; the visuals come from the picked child.

| CSS variable                                        | Token reference                |
|-----------------------------------------------------|--------------------------------|
| `--origam-progress---display`                       | `block`                        |
| `--origam-progress---width`                         | `100%`                         |
| `--origam-progress__content---align-items`          | `center`                       |
| `--origam-progress__content---justify-content`      | `center`                       |
| `--origam-progress__content---position`             | `absolute`                     |

## Accessibility

`<OrigamProgress>` itself carries **no ARIA attribute** (#500) — it
delegates its entire render to the picked variant
(`<component :is="…">`, a single DOM root), so declaring `role`/`aria-*`
here too would either be dead code or, worse, a second conflicting
`role="progressbar"` on the same element. The dispatched variant
(`OrigamProgressCircular` or `OrigamProgressLinear`) owns the full
contract:

- `role="progressbar"` on the rendered root.
- `aria-valuemin="0"`, `aria-valuemax` follows `max`.
- `aria-valuenow` is set when `indeterminate` is false, and **omitted**
  (not `0`) when it is true.
- `aria-busy="true"` while `indeterminate`.
- `aria-label` resolves `label` through `t()`.
- `aria-hidden` mirrors the `active` prop, which **defaults to `true`** —
  a progress bar is announced to assistive tech out of the box. Set
  `active="false"` to intentionally hide an off-screen or paused
  indicator (`aria-hidden="true"` then applies).

This holds identically whether the bar is reached through
`<OrigamProgress>` or mounted directly as `<OrigamProgressCircular>` /
`<OrigamProgressLinear>` — both are exported publicly and are fully
accessible standalone.

## Related

- `OrigamProgressCircular` - the round spinner variant.
- `OrigamProgressLinear` - the bar variant with buffer/stream support.
- `OrigamLoader` - simple toggle between content and a default spinner.
