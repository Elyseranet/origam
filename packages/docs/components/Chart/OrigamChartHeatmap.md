# OrigamChartHeatmap

Rectangular heatmap chart. Renders a grid of `<rect>` cells where each cell is coloured by its `value` relative to the min/max of the dataset using CSS `color-mix` interpolation between two configurable colour endpoints.

Common use cases:

- **GitHub-style activity grids** — commit count by weekday × hour
- **Correlation matrices** — pairwise correlation coefficients
- **Engagement heatmaps** — page views or conversions by day × hour

The component consumes `series[0]` only. Each datum must supply `x` (column key), `y` (row key) and a numeric `value`.

## Import

```ts
import { OrigamChartHeatmap } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-heatmap
    :series="[{ name: 'Commits', data: activityData }]"
    :x-categories="hours"
    :y-categories="days"
    :height="400"
    title="Weekly activity"
    subtitle="Commits per hour"
  />
</template>

<script setup lang="ts">
import { OrigamChartHeatmap } from '@origam/ds'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`)
const activityData = days.flatMap((day) =>
  hours.map((hour) => ({ x: hour, y: day, value: Math.floor(Math.random() * 50) }))
)
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Only `series[0]` is consumed. Each datum must be `{ x, y, value }`. |
| `xCategories` | `Array<string>` | `[]` | Explicit X-axis column ordering. When empty, unique `x` values from the data are sorted ascending. |
| `yCategories` | `Array<string>` | `[]` | Explicit Y-axis row ordering. When empty, unique `y` values from the data are sorted ascending. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `colorRange` | `[TIntent \| string, TIntent \| string]` | `['info', 'danger']` | Two-stop gradient. First = min colour, second = max colour. Accepts intent tokens or raw CSS strings. |
| `cellGap` | `number` | `2` | Gap between cells in SVG user units. `0` produces a fully-continuous grid. |
| `height` | `number \| string` | `400` | Chart height. A plain number is interpreted as `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `showLabel` | `boolean` | `true` | Render the numeric value centred in each cell when the cell is at least 18 SVG-px wide and tall. |
| `showAxis` | `boolean` | `true` | Render X (bottom) and Y (left) axis labels alongside the grid. Labels are skipped every other entry when N > 20. |
| `showGradientLegend` | `boolean` | `true` | Render a horizontal gradient bar with min/max labels below the grid (or at the position set by `legendPosition`). |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Anchor for the gradient legend. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `animated` | `boolean` | `true` | Fade cells in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Applied to each X-axis column label. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to row labels and to the min/max labels on the gradient legend bar. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a cell. `point.x` is the column key, `point.y` is the raw value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry (not applicable to the gradient legend — reserved for future categorical legend). |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip body. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or has no data. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are ignored.

**Category ordering.** Pass `xCategories` and `yCategories` to lock axis order (e.g. weekday order). Without them, unique values are sorted ascending (alphabetically for strings, numerically for numeric strings).

**Colour interpolation.** Each cell's colour is computed as `color-mix(in srgb, <endColour> <pct>%, <startColour>)` where `pct = ((value - min) / (max - min)) * 100`. When all values are equal, every cell renders as the start colour.

**Cell labels.** A value is rendered inside the cell only when both `showLabel=true` and the cell is at least 18 SVG-px wide and tall. For dense grids (e.g. 24 × 7) cells are typically too small to show labels; set `showLabel=false` for performance and readability.

**Axis label thinning.** When the number of categories exceeds 20 on either axis, every other label is skipped automatically to prevent overlap. Use `xAxisFormat` / `yAxisFormat` to keep labels short.

**Gradient legend.** The legend is an inline SVG `<linearGradient>` bar rendered inside the same SVG element. It does not use the `OrigamChartLegend` component (which is designed for categorical series).

**Accessibility.** Each cell is a focusable `<rect>` with `role="button"` and an `aria-label` carrying the `x × y: value` string. Keyboard users can Tab through cells and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>`.

**Animation.** Cells fade in on mount via a CSS keyframe animation. Skipped when `animated=false` or `prefers-reduced-motion: reduce`.

**SSR.** All geometry is computed as pure `computed()` values — no `onMounted` guard. The SVG renders server-side.

## Examples

### Correlation matrix with custom formatter

```vue
<template>
  <origam-chart-heatmap
    :series="[{ name: 'Correlation', data: corrData }]"
    :x-categories="tickers"
    :y-categories="tickers"
    :color-range="['primary', 'danger']"
    :y-axis-format="(v) => v.toFixed(2)"
    :show-label="true"
    :height="400"
    title="Stock correlation matrix"
    subtitle="12-month rolling"
  />
</template>
```

### Activity grid — no labels, custom colours

```vue
<template>
  <origam-chart-heatmap
    :series="[{ name: 'Commits', data: activityData }]"
    :x-categories="hours"
    :y-categories="days"
    :color-range="['#e0f2fe', '#0369a1']"
    :show-label="false"
    :cell-gap="3"
    :height="240"
    title="Commit heatmap"
  />
</template>
```
