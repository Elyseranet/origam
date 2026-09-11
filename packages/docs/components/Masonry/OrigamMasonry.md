# OrigamMasonry

Pinterest-style masonry layout. Items of variable height stack into
columns without leaving vertical gaps — the visual centre of gravity
shifts each new item to the shortest column so the resulting layout
fills the available space evenly.

The component is **CSS-first**: when the browser exposes
`grid-template-rows: masonry`, the layout is implemented with native
CSS Grid and no JS runs after the initial mount. When the browser
doesn't support the masonry value (most engines as of 2026), a JS
fallback ships a bucket-fill algorithm wired to `ResizeObserver`.
Consumers don't need to think about it — the runtime branch is
transparent.

```vue
<template>
    <origam-masonry
            :columns="3"
            :column-breakpoints="{ 600: 2, 900: 3, 1200: 4 }"
            gap="md"
            :animated="true"
    >
        <div
                v-for="item in items"
                :key="item.id"
                class="card"
        >
            …
        </div>
    </origam-masonry>
</template>
```

## Props

| Prop                | Type                          | Default | Description                                                                 |
|---------------------|-------------------------------|---------|-----------------------------------------------------------------------------|
| `columns`           | `number`                      | `3`     | Default column count when no breakpoint matches.                            |
| `columnBreakpoints` | `Record<number, number>`      | —       | Container-query map: key = min width (px), value = column count above.      |
| `gap`               | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| string \| number` | `'md'`  | Gap between items. Tokens map to `--origam-grid---gap-{token}`.            |
| `animated`          | `boolean`                     | `true`  | Transition `transform` when items move on resize / column change.           |
| `align`             | `'top' \| 'center'`           | `'top'` | Vertical alignment inside each column (JS path only).                       |
| `tag`               | `string`                      | `'div'` | Tag rendered for the masonry root.                                          |

## When does CSS masonry kick in?

| Engine          | Status (Q2 2026)                                                                  |
|-----------------|-----------------------------------------------------------------------------------|
| Firefox         | Behind a flag (`layout.css.grid-template-masonry-value.enabled`).                 |
| Chromium        | Experimental — `--enable-experimental-web-platform-features` flag, since 117.     |
| Safari          | Not shipped. Tracking the issue, no ETA.                                          |
| WebView (mob.)  | Inherits the parent engine's flag state — typically unavailable.                  |

Origam queries `CSS.supports('grid-template-rows: masonry')` at runtime
via `useCssSupport`. When `true`, the component renders a single
`display: grid` element with `grid-template-rows: masonry` and stops
there. When `false`, the JS bucket-fill takes over.

## Behaviour — `columnBreakpoints`

The breakpoints are evaluated against the **container** width (via
`ResizeObserver`), not the viewport. A masonry placed in a 600 px sidebar
will pick the breakpoint that matches 600 px regardless of viewport size.
The matching rule is "largest key ≤ width" — exactly the
`min-width` semantics consumers expect from media queries.

When no key matches (container narrower than every breakpoint), the
`columns` prop is used verbatim.

## Behaviour — `animated`

When `true` (default), each item gets a CSS transition on `transform` /
`top` / `left` / `width`. The duration and easing are wired to design
tokens (`--origam-masonry---animation-duration`,
`--origam-masonry---animation-easing`) so theme overrides apply.

Set to `false` for performance-sensitive screens or when consumers
explicitly prefer no motion. The component does **not** honour
`prefers-reduced-motion` automatically — wrap with a media query in
your stylesheet or pass `animated="false"` programmatically.

## Performance — when to virtualise

The bucket-fill algorithm is O(n × cols) per layout pass; observed at
< 1 ms for 100 items / 4 cols on a 2020 MacBook Air. For very dense
grids (> 200 items, image-heavy), prefer a virtual-list strategy on top
of `OrigamMasonry`. The component itself does NOT virtualise — every
child remains in the DOM.

`ResizeObserver` coalesces multiple synchronous resize events through
`requestAnimationFrame`, so a window drag doesn't trigger one layout
per pixel.

## Accessibility

The root element carries `role="list"`. In the JS fallback path each
positioned wrapper carries `role="listitem"`, so screen readers expose
a list semantic. In the CSS path the consumer's children are rendered
verbatim — add `role="listitem"` on your own element if you need the
listitem semantic.

## Related

- `OrigamGrid` — fixed-row CSS Grid wrapper.
  Use it when the layout is rectangular (every cell occupies one
  predictable area).
