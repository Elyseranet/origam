# OrigamChartRangeSelector

Band-style preset toolbar (`1w / 1m / 3m / 6m / 1y / all`-style buttons)
rendered above `<OrigamChartCartesian>` when its `rangeSelector.enabled`
config is `true`. Each button commits a zoom window expressed as
`[start, end]` category indices; the parent listens for `select` and
reacts (typically by emitting `zoom` on the host chart).

## A different kind of Chart component — read this before reusing the interface

Every other `OrigamChart*` component extends `IChartBaseProps`: it plots
a `series` against `categories`, and inherits the whole layout/legend/
tooltip/animation surface that comes with actually rendering a dataset.

`<OrigamChartRangeSelector>` does **not** extend `IChartBaseProps`, on
purpose. It doesn't plot anything — it has no `series`, no `title`, no
`legendPosition`, no `colorScheme`. It is a self-contained toolbar
control (closer in spirit to a segmented control or a pagination bar)
that happens to live under `Chart/` and carry the `OrigamChart*` name
because its only reason to exist is to pair with
`<OrigamChartCartesian rangeSelector="...">`. Forcing it to extend the
base interface would resurrect the exact class of bug this family is
being cleaned up for elsewhere: a dozen inherited props
(`animated`, `showTooltip`, `colorScheme`, …) the component would
silently ignore. Its isolated `IChartRangeSelectorProps` interface is
the correct shape, not an oversight.

## Import

```ts
import { OrigamChartRangeSelector } from '@origam/ds'
```

## Quick start

```vue
<template>
    <origam-chart-range-selector
            :buttons="buttons"
            :active-index="activeIndex"
            :data-length="categories.length"
            @select="onSelect"
    />
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { OrigamChartRangeSelector } from '@origam/ds'
    import type { IChartRangeSelectorButton } from '@origam/ds/interfaces'

    const categories = Array.from({ length: 365 }, (_, i) => `Day ${ i + 1 }`)
    const activeIndex = ref(-1)

    const buttons: Array<IChartRangeSelectorButton> = [
        { label: '1w', count: 7 },
        { label: '1m', count: 30 },
        { label: '3m', count: 90 },
        { label: '1y', count: 365 },
        { label: 'all', fraction: 1 }
    ]

    function onSelect (index: number, start: number, end: number): void {
        activeIndex.value = index
        // Slice/zoom whatever series feeds the paired <OrigamChartCartesian>.
    }
</script>
```

The common path (`<OrigamChartCartesian :range-selector="{ enabled: true, buttons }">`)
renders this component automatically. Direct import is only needed for
a custom layout (e.g. the toolbar living outside the chart's own DOM
subtree).

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `buttons` | `Array<IChartRangeSelectorButton>` | *required* | Buttons to render, in order. Each button carries `label` plus exactly one of `count` (last N categories) or `fraction` (0..1 of the full range; `1` = all). |
| `activeIndex` | `number` | `-1` | Zero-based index of the currently active button. `-1` = none selected — no button gets the `--active` modifier. |
| `dataLength` | `number` | `0` | Total category count. The window each button computes against; `0` makes every click a no-op. |
| `ariaLabel` | `string` | `'origam.chart.range_selector.aria_label'` | Accessible name for the toolbar `<nav>` landmark. Carries a locale key, resolved through the DS `t()` mechanism — a raw string that matches no key is returned unchanged, so consumers who prefer to translate on their own side can pass final text directly. |

`IChartRangeSelectorButton` shape:

```ts
interface IChartRangeSelectorButton {
    label: string
    count?: number      // last N categories from the trailing edge
    fraction?: number   // 0..1 fraction of the full range; 1 = all
}
```

Exactly one of `count` / `fraction` should be set per button; if
neither is set the button selects the full range (`start: 0, end: dataLength - 1`).

## Emits

| Name | Payload | Description |
|------|---------|-------------|
| `select` | `(index: number, start: number, end: number)` | Fired on click or keyboard activation. `start`/`end` are the resolved zero-based category window — the component does not track its own active state beyond styling; the parent owns `activeIndex` and typically re-emits a `zoom` on the paired chart. |

## Slots

None — the button list is entirely data-driven from the `buttons` prop.

## Behaviour notes

- **Native elements throughout** — root is a `<nav aria-label="...">`,
  the list is a real `<ul>/<li>`, each button is a native
  `<button type="button">`. No custom ARIA widget pattern is needed:
  keyboard `Tab`/`Enter`/`Space` work for free.
- **`aria-pressed`, not a `role="tab"` pattern** — each button reflects
  its selection state via `aria-pressed="true/false"`, matching a
  toggle-button group rather than a tabs widget (there is no associated
  tabpanel; the "content" is the paired chart's own zoomed view).
- **No internal data slicing** — the component only computes
  `[start, end]` indices. It never touches series data itself; the
  parent chart owns the actual zoom/slice.
- **i18n** — the root `aria-label` resolves through the DS locale layer
  (`useLocale`/`t()`), following the active locale out of the box (#395).

## Composables

None. The component is a pure, self-contained toolbar — no shared
composable is extracted because the index-window arithmetic
(`count`/`fraction` → `[start, end]`) is only ever used here.

## Examples

### Paired with OrigamChartCartesian

```vue
<template>
    <origam-chart-range-selector
            :buttons="buttons"
            :active-index="activeIndex"
            :data-length="categories.length"
            @select="onSelect"
    />
    <origam-chart-cartesian
            type="line"
            :series="visibleSeries"
            :categories="visibleCategories"
    />
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'

    const activeIndex = ref(-1)
    const zoomWindow = ref<{ start: number, end: number } | null>(null)

    const visibleCategories = computed(() =>
        zoomWindow.value ? categories.slice(zoomWindow.value.start, zoomWindow.value.end + 1) : categories
    )

    function onSelect (index: number, start: number, end: number): void {
        activeIndex.value = index
        zoomWindow.value = { start, end }
    }
</script>
```

### Custom translated label

```vue
<template>
    <origam-chart-range-selector
            :buttons="buttons"
            :data-length="365"
            aria-label="Plages prédéfinies"
    />
</template>
```
