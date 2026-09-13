# OrigamChartBoxPlot

Box-and-whisker (box plot) chart. Renders one box per category showing the five-number statistical summary — **min / Q1 / median / Q3 / max** — with optional outlier dots and whisker caps. Common in QA dashboards, performance distribution analysis, and any domain where spread + extremes matter alongside the central tendency.

## Import

```ts
import { OrigamChartBoxPlot } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-box-plot
    :series="[{
      name: 'API response time (ms)',
      data: [
        { category: '/users', min: 12, q1: 18, median: 24, q3: 32, max: 58, outliers: [120, 180] },
        { category: '/auth',  min: 8,  q1: 12, median: 16, q3: 22, max: 40, outliers: [] }
      ]
    }]"
    :height="400"
    title="API Response Time"
    subtitle="Distribution per endpoint (ms)"
  />
</template>

<script setup lang="ts">
import { OrigamChartBoxPlot } from '@origam/ds'
</script>
```

## Data shapes

### Format A — pre-aggregated (preferred)

Supply the five-number summary directly:

```ts
interface IChartBoxPlotDatum {
  category: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers?: Array<number>
  color?: TIntent | string
}
```

### Format B — raw samples

Let the component compute quartiles via Tukey's method:

```ts
interface IChartBoxPlotRawDatum {
  category: string
  samples: Array<number>
  color?: TIntent | string
}
```

Detection: if a datum has a `samples` array property, Format B is assumed; otherwise Format A.

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | The box plot reads `series[0]` only. Each datum in `series[0].data` becomes one box. |
| `categories` | `Array<string>` | inferred | Explicit category order. When absent the order is derived from the first occurrence of each `datum.category` in `series[0].data`. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied by category index when a datum omits its own `color`. Supports intent names and raw CSS colours. |
| `boxWidth` | `number` | `0.6` | Box rectangle width as a fraction of the category slot width. Range `[0, 1]`. |
| `whiskerCapWidth` | `number` | `0.4` | Whisker cap segment width as a fraction of the category slot width. |
| `title` | `string` | `undefined` | Optional title above the chart. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `showOutliers` | `boolean` | `true` | Render outlier dots beyond the whisker fences. |
| `showAxis` | `boolean` | `true` | Render X and Y axes with tick labels. |
| `showGrid` | `boolean` | `true` | Render horizontal dashed grid lines. |
| `animated` | `boolean` | `true` | Fade boxes in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `false` | Toggle the legend block. Box plots rarely need a legend; default is off. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Scale

| Name | Type | Default | Description |
|---|---|---|---|
| `yMin` | `number` | auto | Override the auto-computed Y-axis minimum. |
| `yMax` | `number` | auto | Override the auto-computed Y-axis maximum. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | identity | Applied to X-axis category labels. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to Y-axis tick values and the default tooltip. |

### Inherited from `IChartBaseProps`

`height`, `aspectRatio`, and `colorScheme` are documented above (**Visual**)
since they carry box-plot-specific defaults/behaviour. The rest of the
surface is consumed as-is, with no local override:

- `width`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` — via `useDimension`.
- `margin*`, `padding*` — via `useMargin` / `usePadding`.
- `rounded` — via `useRounded`.
- `elevation` — via `useElevation`.
- `bgColor` — via `useBackgroundColor`.
- `fontSize`, `fontWeight` — via `useChartHeaderTypography` (title/subtitle only).

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a box group. `point.x` is the category; `point.y` is the median. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number, box: IChartBoxPlotBox }` | Replace the default tooltip card. `box` exposes the full five-number summary, IQR, and outlier list. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every category is hidden. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are silently ignored.

**Tukey quartile computation (Format B).** `computeQuartiles()` sorts the samples, then interpolates Q1 and Q3 at the 25th and 75th percentile positions using the inclusive linear-interpolation rule (identical to `PERCENTILE.INC` in Excel and `numpy.percentile` with default interpolation). Outliers are defined as values outside `[Q1 − 1.5·IQR, Q3 + 1.5·IQR]`. Whisker endpoints are the smallest non-outlier ≥ lower fence and the largest non-outlier ≤ upper fence.

**Pre-aggregated vs raw detection.** A datum is treated as raw samples when its `samples` property exists and is an array, regardless of whether the other statistics properties are also present. Pre-aggregated format is used otherwise.

**Y scale padding.** Auto-computed range pads by 10% of the data range on each side (minimum 1 unit) to avoid clipping.

**Outlier dots.** Each outlier is rendered as a `<circle r="3">` centred on the box's X position at the value's SVG-Y coordinate. Outliers participate in the Y scale computation — they are included when auto-computing `yMin` / `yMax`.

**Tooltip content.** The default tooltip shows: category, min, Q1, median, Q3, max, IQR, and outlier count. Use the `#tooltip` slot to replace it entirely; the `box` binding supplies all the same information.

**Accessibility.** Each box group is a focusable `<g>` with `role="button"` and an `aria-label` summarising all five statistics. Keyboard users can Tab through boxes and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>` element.

**Animation.** Box rectangles fade in on mount. Whiskers and caps are not animated to keep the motion subtle. Respects `prefers-reduced-motion`.

**SSR.** The SVG is rendered server-side without JS geometry — all geometry values are pure computed properties, no `onMounted` guard needed.

## Examples

### Pre-aggregated API data

```vue
<template>
  <origam-chart-box-plot
    :series="[{ name: 'Response time (ms)', data: apiData }]"
    :height="400"
    :y-axis-format="(v) => `${v}ms`"
    title="API Response Time Distribution"
    subtitle="Last 30 days"
  />
</template>

<script setup lang="ts">
import { OrigamChartBoxPlot } from '@origam/ds'
import type { IChartBoxPlotDatum } from '@origam/ds'

const apiData: Array<IChartBoxPlotDatum> = [
  { category: '/users',    min: 12, q1: 18, median: 24, q3: 32, max: 58, outliers: [120, 180] },
  { category: '/products', min: 20, q1: 28, median: 38, q3: 52, max: 90, outliers: [150] },
  { category: '/orders',   min: 45, q1: 58, median: 70, q3: 88, max: 132, outliers: [] }
]
</script>
```

### Raw samples (automatic quartile computation)

```vue
<template>
  <origam-chart-box-plot
    :series="[{ name: 'Daily sales', data: salesData }]"
    :height="380"
    title="Sales Distribution"
  />
</template>

<script setup lang="ts">
import { OrigamChartBoxPlot } from '@origam/ds'
import type { IChartBoxPlotRawDatum } from '@origam/ds'

const salesData: Array<IChartBoxPlotRawDatum> = [
  { category: 'Monday',    samples: [62,71,58,80,65,74,68,70,73,77] },
  { category: 'Wednesday', samples: [75,82,71,90,78,85,80,83,86,79] }
]
</script>
```

### Custom tooltip with full stats

```vue
<template>
  <origam-chart-box-plot :series="series" :height="400">
    <template #tooltip="{ box }">
      <div class="stats-card">
        <strong>{{ box.category }}</strong>
        <p>Median: {{ box.rawStats.median }} · IQR: {{ Math.round(box.iqr) }}</p>
        <p>Outliers: {{ box.outliers.length }}</p>
      </div>
    </template>
  </origam-chart-box-plot>
</template>
```
