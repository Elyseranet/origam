# OrigamChartRadar

Radar (spider / web) chart for multivariate comparison. Each axis in the polygon corresponds to one entry in `categories`; each series draws a filled polygon whose vertices are positioned proportionally to the series values. Useful for character stats, balanced scorecards, skill profiles, and any data set where comparing multiple dimensions simultaneously matters more than tracking a single trend.

Type-specific wrapper with a tightly-typed prop surface — no `type` prop (radar is always the topology), no cartesian-only props (`showAxis`, `showGrid`, `yMin`, `yMax`, `stacked`, `smoothing`). Use `OrigamChart` when you need to switch between radar and another topology at runtime.

## Import

```ts
import { OrigamChartRadar } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-radar
    :series="series"
    :categories="axes"
    :height="320"
    title="Player comparison"
  />
</template>

<script setup lang="ts">
import { OrigamChartRadar } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const axes = ['Speed', 'Power', 'Agility', 'Stamina', 'Skill', 'Defence']

const series: Array<IChartSeries> = [
  { name: 'Player A', data: [80, 65, 75, 90, 70, 60], color: 'primary' },
  { name: 'Player B', data: [55, 85, 60, 70, 90, 80], color: 'success' }
]
</script>
```

## Props

`IChartRadarProps` extends `IChartBaseProps` without adding any radar-specific properties. All props come from the shared base:

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | One or more data series. Each series draws one polygon. An empty array renders the `#empty` slot. |
| `categories` | `Array<string>` | `[]` | Axis labels. `categories[i]` labels the i-th polygon vertex. Length should match `series[n].data.length` for the visual to be correct. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `360` | Chart height. A plain number is `px`; any CSS length is accepted. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette cycling by series index when a series omits its own `color`. |
| `title` | `string` | `undefined` | Optional title above the chart. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Animate polygon vertices on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor: `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip on vertex markers. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a vertex marker. `point.dataIndex` identifies the axis; `point.x` is the category label. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip. `category` is `categories[point.dataIndex]`. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every series is hidden. |

## Behaviour notes

**Axis count.** The number of polygon vertices is `Math.max(categories.length, series[n].data.length)`. If `categories` and `series[n].data` have different lengths, the surplus axis has no label (falling back to its numeric index) or the surplus data point is placed at a computed angle without a label. Keep them aligned.

**Y scale.** The polygon is sized relative to the global Y range computed across all visible series. A series with `data: [100]` and another with `data: [10]` will produce very different polygon sizes because the Y range is `[0, 100]`. Use `yMin` / `yMax` via `OrigamChart` if you need explicit range control; they are not exposed on this component's narrowed prop surface.

**Polygon fill.** Each polygon is rendered with a semi-transparent fill (opacity controlled by the SCSS token `--origam-chart---radar-fill-opacity`, default `0.15`). The fill order matches the series array — later series paint on top of earlier ones.

**Circle markers.** Each vertex emits a `<circle>` marker of radius `3.5` in addition to the polygon path. The markers are the interactive targets for tooltip + click events.

**No axes, grid, or tick labels.** Radar charts draw axis spokes (lines from centre to each vertex) and concentric grid rings instead of cartesian axes. These are rendered by the component internally and are not configurable via props on this version.

**SSR.** A placeholder `<div>` with the correct dimensions is emitted server-side; the SVG mounts on `onMounted`.

## Examples

### Two-series comparison

```vue
<template>
  <origam-chart-radar
    :series="series"
    :categories="skills"
    :height="360"
    title="Team skills"
    legend-position="bottom"
  />
</template>

<script setup lang="ts">
import { OrigamChartRadar } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const skills = ['Communication', 'Analysis', 'Delivery', 'Leadership', 'Creativity']

const series: Array<IChartSeries> = [
  { name: 'Alice', data: [90, 75, 85, 70, 80], color: 'primary' },
  { name: 'Bob',   data: [65, 90, 78, 88, 60], color: 'warning' }
]
</script>
```

### Custom tooltip showing axis name and value

```vue
<template>
  <origam-chart-radar
    :series="series"
    :categories="axes"
    :height="320"
    title="Performance radar"
  >
    <template #tooltip="{ point, series, category }">
      <div class="radar-tip">
        <strong>{{ series.name }}</strong>
        <span>{{ category }}: {{ point.y }}</span>
      </div>
    </template>
  </origam-chart-radar>
</template>

<script setup lang="ts">
import { OrigamChartRadar } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const axes = ['Speed', 'Power', 'Agility', 'Stamina', 'Skill', 'Defence']
const series: Array<IChartSeries> = [
  { name: 'Hero', data: [88, 72, 95, 80, 77, 65], color: 'primary' }
]
</script>
```
