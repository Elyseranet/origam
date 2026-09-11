# OrigamSvgIcon

`<OrigamSvgIcon>` is the **inline SVG leaf**: when the resolved icon is a
single SVG path string or an array of path entries, `OrigamIcon`
selects this leaf to render the corresponding `<svg>` element directly in
the DOM (no font-icon dependency, no external request).

Inline SVG is the **most flexible** rendering mode: paths are styled via
`fill: currentColor` and the icon scales perfectly at any size.

## Basic usage

```vue
<template>
    <!-- Single path -->
    <OrigamSvgIcon icon="M12 2 L17 8 …" />

    <!-- Multi-path (filled regions / outlines layered together) -->
    <OrigamSvgIcon
        :icon="[
            'M12 2 L17 8 …',
            ['M12 2 L17 8 …', 0.5]   /* second path with 50% opacity */
        ]"
    />

    <!-- Or use the dispatcher (recommended) — same result -->
    <OrigamIcon icon="M12 2 L17 8 …" />
</template>
```

The `icon` prop shape:

```ts
type TIcon =
    | string                                            // single path
    | Array<string | [path: string, opacity: number]>   // multiple paths
    | Component                                         // routed to OrigamComponentIcon
```

A bare string in the array → opaque path. A `[path, opacity]` tuple →
that path is rendered with the given `fill-opacity`.

## Sizes

```vue
<template>
    <OrigamSvgIcon icon="M12 2 …" size="x-small" />
    <OrigamSvgIcon icon="M12 2 …" size="small"   />
    <OrigamSvgIcon icon="M12 2 …" size="default" />
    <OrigamSvgIcon icon="M12 2 …" size="large"   />
    <OrigamSvgIcon icon="M12 2 …" size="x-large" />

    <!-- Numeric override — pins the wrapper width / height in pixels -->
    <OrigamSvgIcon icon="M12 2 …" :size="64" />
</template>
```

The inner `<svg>` is sized as `width: 1em; height: 1em` so it follows the
wrapper's `font-size`. Numeric `size` pins both wrapper and inner SVG to
explicit pixel values.

## Polymorphic tag

```vue
<template>
    <OrigamSvgIcon icon="M12 2 …" />            <!-- <div> -->
    <OrigamSvgIcon icon="M12 2 …" tag="span" />
</template>
```

## viewBox

`viewBox="0 0 24 24"` is **hardcoded** on the inner SVG. All path data
must therefore be authored on a 24×24 grid. If you need a different
canvas, use `OrigamComponentIcon` and supply a full Vue SVG component
instead.

## Props (interface)

```ts
interface IIconComponentProps {
    icon?: TIcon  // string OR array (see above)
    size?: TSize | number
    tag?: string
    class?: string | string[] | object
    style?: string | string[] | object
}
```

## Anatomy

```html
<div class="origam-icon origam-icon--svg origam-icon--size-default">
    <svg
        class="origam-icon__svg"
        role="img"
        aria-hidden="true"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 2 …" />
    </svg>
</div>
```

## Color / theming

- Path elements inherit `fill: currentColor` (set by the
  `.origam-icon--svg .origam-icon__svg` rule).
- The wrapper's `color` cascades from `.origam-icon` (`currentColor` by
  default) — set `color` anywhere up the tree and the icon follows.
- Per-path opacity is supported via the array tuple `[path, opacity]`.

## When to use

- When you have **raw SVG path data** (e.g. extracted from Figma or a
  design system source-of-truth JSON).
- When you don't want to ship an icon font (`mdi`, `fa`, …) for a few
  glyphs.
- When you need **multi-layer paths with per-path opacity** — this is the
  only leaf that supports the `[path, opacity]` tuple shape.

## Accessibility

- The inner `<svg>` has `role="img"` and `aria-hidden="true"` — the
  wrapper is the announce target.
- For interactive icons, attach `aria-label` to the wrapper and a click
  handler to `OrigamIcon` (which adds `role="button"` automatically).

## Related

- `OrigamIcon` — the dispatcher (preferred entry-point).
- `OrigamComponentIcon` — wraps a full Vue
  SVG component when 24×24 isn't enough.
