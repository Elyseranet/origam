# OrigamVirtualScroll

`<OrigamVirtualScroll>` is a windowed list renderer: only the items
inside the viewport (plus a small overscan buffer) are mounted, while a
single padding-top / padding-bottom pair simulates the rest of the
scrollable height. It scales gracefully to thousands of rows.

The engine measures item heights at runtime (via a per-item
`ResizeObserver` inside `<OrigamVirtualScrollItem>`) so heterogeneous row
heights are supported — the `itemHeight` prop is just the initial
estimate used for the first paint.

## Basic usage

```vue
<template>
    <OrigamVirtualScroll
        :items="rows"
        :item-height="48"
        height="320"
    >
        <template #item="{ item }">
            <div class="row">{{ item.label }}</div>
        </template>
    </OrigamVirtualScroll>
</template>
```

## Item height

`itemHeight` (px) is the estimated row height used by the engine to
decide how many items fit in the viewport before any item has rendered
and reported its actual size. Pass the closest integer matching your
typical row.

```vue
<template>
    <OrigamVirtualScroll :item-height="32" :items="dense"   height="240">…</OrigamVirtualScroll>
    <OrigamVirtualScroll :item-height="64" :items="comfort" height="320">…</OrigamVirtualScroll>
</template>
```

## Height

`height` controls the viewport. It accepts any CSS length expression
(`'320px'`, `400`, `'50vh'`). When set to an empty string, the
component fills its parent.

```vue
<template>
    <OrigamVirtualScroll :items="rows" height="50vh">…</OrigamVirtualScroll>
</template>
```

## Dynamic items

`items` is reactive — push, splice, replace at will. The engine resets
its size cache on item identity change and re-measures everything via
`ResizeObserver`.

```vue
<script setup>
const rows = ref([{ id: 1, label: 'A' }])
function append () { rows.value.push({ id: rows.value.length + 1, label: 'New' }) }
</script>
```

## scrollToIndex

The component exposes an imperative `scrollToIndex(index)` method via
`defineExpose`. Use it to jump to a specific row without animation.

```vue
<template>
    <OrigamVirtualScroll ref="vsRef" :items="rows" height="320">…</OrigamVirtualScroll>
    <button @click="vsRef.scrollToIndex(500)">Jump to 500</button>
</template>
```

## Renderless mode

When `renderless` is `true`, the component renders no scroll container
of its own — it climbs the DOM at mount to find the nearest scrollable
parent and binds the engine to it. Useful when you want to virtualise a
list inside an existing scrollable layout.

```vue
<template>
    <div style="height: 320px; overflow: auto;">
        <OrigamVirtualScroll renderless :items="rows" :item-height="48">
            <template #item.renderless="{ item, itemRef }">
                <div :ref="itemRef" class="row">{{ item.label }}</div>
            </template>
        </OrigamVirtualScroll>
    </div>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `item` | `item`, `index` | Default per-row template (non-renderless mode). |
| `item.{index}` | `item` | Targeted slot for a specific item index. |
| `item.renderless` | `item`, `index`, `itemRef` | Renderless variant — bind `itemRef` so the engine can measure. |
| `item.renderless.{index}` | `item`, `itemRef` | Targeted renderless slot. |

## Props (interface)

```ts
interface IVirtualScrollProps extends ICommonsComponentProps,
    IDimensionProps, IVirtualProps {
    items?: Array<any>
    renderless?: boolean
}

interface IVirtualProps {
    itemHeight?: number | string
    height?: number | string
}
```

## Anatomy

```html
<div class="origam-virtual-scroll">
    <div class="origam-virtual-scroll__container" style="padding-top: …; padding-bottom: …;">
        <div class="origam-virtual-scroll__item">…</div>
        <div class="origam-virtual-scroll__item">…</div>
        <!-- only the visible window is mounted -->
    </div>
</div>
```

## Design tokens consumed

Defined in `tokens/component/virtual-scroll.json`.

| CSS variable | Default |
|---|---|
| `--origam-virtual-scroll---scroll-padding` | `{space.0}` |
| `--origam-virtual-scroll---transition-duration` | `{motion.duration.fast}` |
| `--origam-virtual-scroll---transition-easing` | `{motion.easing.standard}` |
| `--origam-virtual-scroll---item-height` | `48px` (engine fallback) |

## Accessibility

- Because items outside the viewport are not in the DOM, screen readers
  cannot navigate them. Pair the component with `aria-rowcount` /
  `aria-rowindex` on the parent if you need full row addressing.
- `scroll-padding` lets you keep a sticky header from obscuring focused
  rows during keyboard scrolling.

## Performance

- Item measurement is debounced — bursts of resizes (e.g. window resize
  during scrolling) are coalesced.
- `BUFFER_PX` overscan keeps a small range outside the viewport mounted
  so the user doesn't see blank rows when scrolling fast.
- Heavy item content (e.g. images) should declare a fixed height to
  prevent layout shifts during measurement.

## Related

- `OrigamVirtualScrollItem` — the per-row primitive that emits
  `update:height` so the engine can refine its size cache.
