# OrigamChartCartesian

Tightly-typed cartesian chart surface covering seven topologies: \`line\`, \`area\`, \`bar\`, \`column\`, \`scatter\`, \`spline\`, and \`stepped-line\`. Owns the X + Y plotting area, axes, grid, and tick labels as first-class concerns and deliberately rejects polar / radar / gauge types at the TypeScript level.

Use this component when the chart type is fixed at compile time and you want `TChartCartesianKind` enforced on the `type` prop. Use `OrigamChart` when you need to switch between families at runtime.

## Import

```ts
import { OrigamChartCartesian } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-cartesian
    type="column"
    :series="series"
    :categories="months"
    :height="320"
    :stacked="true"
    title="Monthly sales"
    subtitle="2025 vs 2026"
    @point-click="onPointClick"
  />
</template>

<script setup lang="ts">
import { OrigamChartCartesian } from '@origam/ds'
import type { IChartSeries, IChartPoint } from '@origam/ds'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const series: Array<IChartSeries> = [
  { name: 'Product A', data: [10, 14, 18, 16, 22, 28, 25, 30, 33, 36, 38, 42], color: 'primary' },
  { name: 'Product B', data: [ 6, 10, 14, 12, 18, 22, 19, 24, 28, 30, 32, 35], color: 'success' }
]

function onPointClick(point: IChartPoint) {
  console.log(point.seriesName, point.x, point.y)
}
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | One or more data series. An empty array or every series hidden renders the `#empty` slot. |
| `categories` | `Array<string>` | `[]` | X-axis labels. Length should match the longest series; missing entries fall back to the numeric index. Not required for `scatter`. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `TChartCartesianKind` | `'line'` | Cartesian topology. One of `'line'`, `'area'`, `'bar'`, `'column'`, `'scatter'`, `'spline'`, `'stepped-line'`. |
| `height` | `number \| string` | `360` | Chart height. A plain number is `px`; any CSS length is accepted. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when a series omits its own `color`. |
| `title` | `string` | `undefined` | Optional title above the plotting area. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `stacked` | `boolean` | `false` | Stack series on top of each other. Applies to `bar` and `column`. |
| `smoothing` | `TChartSmoothing` | `'none'` | Smoothing for `line` / `area`. `'none'` = straight segments; `'curve'` = Catmull-Rom Bezier. `spline` forces `'monotone'` regardless. |
| `animated` | `boolean` | `true` | Entrance animation. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor: `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `showGrid` | `boolean` | `true` | Render horizontal grid lines. |
| `showAxis` | `boolean` | `true` | Render X / Y axes and tick labels. |

### Axis range and formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `yMin` | `number` | auto | Override the auto-computed Y minimum. |
| `yMax` | `number` | auto | Override the auto-computed Y maximum. |
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Formatter for X-axis tick labels. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Formatter for Y-axis tick labels. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a data point. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip body. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every series is hidden. |

## Behaviour notes

**Topology primer.**

| `type` | Shape emitted | Smoothing applies |
|---|---|---|
| `line` | Polyline per series + circle markers | Yes (`'curve'` or `'monotone'`) |
| `area` | Filled polygon + stroke per series + markers | Yes |
| `spline` | Polyline per series, defaults to `'monotone'` smoothing | Yes (overridable) |
| `stepped-line` | Right-angle staircase per series + markers | No |
| `column` | Vertical `<rect>` per data point | N/A |
| `bar` | Horizontal `<rect>` per data point | N/A |
| `scatter` | `<circle>` per data point, no connecting path | N/A |

**`spline` smoothing override.** `spline` calls the monotone path generator by default. Pass `smoothing='curve'` to switch to Catmull-Rom, or `smoothing='none'` to collapse back to straight segments (at which point it is identical to `line`).

**Stacked bar / column.** `stacked=true` accumulates series values per data index. The Y scale is computed over the stacked totals — the global `yMin` / `yMax` overrides still apply after stacking. Stacking on `line`, `area`, or `scatter` has no visual effect.

**Mix charts.** Each series can set its own `type` to override the chart-level type. A common pattern: a `column` chart with a `line` overlay on top. The series-level type must be a `TChartType` value; there is no restriction to cartesian-only values at the series level, but using polar or gauge types on a series in a cartesian chart has undefined behaviour.

**Scatter data shape.** `scatter` requires explicit `{x, y}` objects in `series[n].data`. Number-only data is technically accepted but all points land on the same X position since there is no implicit category axis.

## Examples

### Minimal line chart

```vue
<template>
  <origam-chart-cartesian
    type="line"
    :series="series"
    :categories="['Q1', 'Q2', 'Q3', 'Q4']"
    :height="240"
    title="Quarterly revenue"
  />
</template>

<script setup lang="ts">
import { OrigamChartCartesian } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [120, 185, 210, 250], color: 'primary' },
  { name: 'Costs',   data: [ 90, 130, 155, 175], color: 'danger'  }
]
</script>
```

### Stacked column with custom palette and Y formatter

```vue
<template>
  <origam-chart-cartesian
    type="column"
    :series="series"
    :categories="months"
    :color-scheme="['#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#0ea5e9']"
    :stacked="true"
    :y-axis-format="formatRevenue"
    :height="360"
    title="Product mix"
    legend-position="right"
  />
</template>

<script setup lang="ts">
import { OrigamChartCartesian } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const series: Array<IChartSeries> = [
  { name: 'Product A', data: [10, 14, 18, 16, 22, 28, 25, 30, 33, 36, 38, 42] },
  { name: 'Product B', data: [ 6, 10, 14, 12, 18, 22, 19, 24, 28, 30, 32, 35] },
  { name: 'Product C', data: [ 4,  6, 10,  9, 13, 16, 14, 18, 21, 23, 25, 28] }
]

function formatRevenue(v: number) {
  return `$${v}k`
}
</script>
```

### Mix chart — column + line overlay

```vue
<template>
  <origam-chart-cartesian
    type="column"
    :series="series"
    :categories="months"
    :height="320"
    title="Revenue with overlay"
  />
</template>

<script setup lang="ts">
import { OrigamChartCartesian } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [90, 105, 118, 112, 132, 155], color: 'primary' },
  { name: 'Trend',   data: [88, 102, 116, 114, 134, 158], color: 'warning', type: 'line' }
]
</script>
```
