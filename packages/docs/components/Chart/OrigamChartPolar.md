# OrigamChartPolar

Polar chart surface for `pie` and `donut` visualisations. Handles part-of-whole data (a single series whose data points become slices) with no axes, no grid, and no tick labels — the cartesian chrome is deliberately absent to avoid the historical "pie-has-axis-lines" regression.

Use this component when you know at compile time that you need a pie or donut. Use `OrigamChart` when the type must switch at runtime.

## Import

```ts
import { OrigamChartPolar } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-polar
    type="donut"
    :series="series"
    :categories="regions"
    :donut-hole-size="0.6"
    :height="320"
    title="Revenue by region"
    subtitle="2026 fiscal year"
  />
</template>

<script setup lang="ts">
import { OrigamChartPolar } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const regions = ['US', 'France', 'Germany', 'Japan', 'Brazil']

const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [120, 80, 60, 45, 25] }
]
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Polar charts consume `series[0]` only. Each datum in `series[0].data` becomes one slice. Extra series are ignored. An empty array renders the `#empty` slot. |
| `categories` | `Array<string>` | `[]` | Slice labels. `categories[i]` labels the slice for `series[0].data[i]`. Shown in the legend and tooltip. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `TChartPolarKind` | `'pie'` | Polar primitive: `'pie'` or `'donut'`. |
| `donutHoleSize` | `number` | `0.6` | Inner-radius proportion for `donut`. `0` collapses to a pie; `1` produces a zero-thickness ring. Ignored when `type='pie'`. |
| `height` | `number \| string` | `360` | Chart height. A plain number is `px`; any CSS length is accepted. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette cycling by slice index. A series-level `color` overrides the palette for all slices of that series. |
| `title` | `string` | `undefined` | Optional title above the chart. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Animate slice sweep on first paint and on data changes. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor: `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Tooltip formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Formatter for the category name shown in the tooltip. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Formatter for the slice value shown in the tooltip. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a slice. `point.dataIndex` identifies the slice within `series[0].data`. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. `category` is the slice label from `categories[point.dataIndex]`. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty. |

## Behaviour notes

**Single-series architecture.** Pie and donut charts are single-series by definition. `series[0]` is the active series; all other entries in the `series` array are silently ignored. Each number in `series[0].data` becomes one slice. Slice colours cycle through `colorScheme` by data index: `data[0]` gets `colorScheme[0]`, `data[1]` gets `colorScheme[1]`, and so on. Setting `series[0].color` to an intent or CSS value overrides the entire palette and tints all slices with that single colour.

**Negative and zero values.** Slices where `data[i] <= 0` are skipped entirely. The percentage label in the default tooltip is computed against the sum of all positive values.

**`donutHoleSize` range.** Values outside `[0, 1]` are clamped. `0` produces a solid pie; `0.6` (the default) gives the classic donut ring. Values close to `1` produce a very thin ring that may be hard to interact with.

**No axes or grid.** `showAxis` and `showGrid` props are not present on this component — they are intentionally excluded to keep the prop surface clean. The polar family never renders cartesian chrome.

**Animation.** The entrance animation sweeps each slice from its start angle. When data changes, slices animate to their new sweep angles. `prefers-reduced-motion: reduce` suppresses the animation unconditionally.

**SSR.** A placeholder `<div>` with the correct dimensions is emitted server-side; the SVG mounts on `onMounted`.

**Keyboard.** Each slice is `tabindex="0"` with an `aria-label` of `"{series name} — {category}: {value}"`. `Enter` / `Space` fire `point-click`. Legend entries also support keyboard toggle.

## Examples

### Minimal pie

```vue
<template>
  <origam-chart-polar
    type="pie"
    :series="[{ name: 'Market share', data: [45, 30, 15, 10] }]"
    :categories="['Alpha', 'Beta', 'Gamma', 'Delta']"
    :height="280"
    title="Market share"
  />
</template>

<script setup lang="ts">
import { OrigamChartPolar } from '@origam/ds'
</script>
```

### Donut with value formatter and custom legend

```vue
<template>
  <origam-chart-polar
    type="donut"
    :series="series"
    :categories="countries"
    :donut-hole-size="0.7"
    :y-axis-format="formatRevenue"
    :height="360"
    legend-position="right"
    title="Revenue split"
  >
    <template #legend-item="{ series, index, visible }">
      <span :style="{ opacity: visible ? 1 : 0.4 }">
        {{ countries[index] }} — {{ series.data[index] }}k
      </span>
    </template>
  </origam-chart-polar>
</template>

<script setup lang="ts">
import { OrigamChartPolar } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const countries = ['US', 'France', 'Germany', 'Japan', 'Brazil']
const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [120, 80, 60, 45, 25], color: 'primary' }
]

function formatRevenue(v: number) {
  return `$${v}k`
}
</script>
```
