# OrigamChartStreamgraph

Streamgraph chart family. Renders **multiple series** as continuous, river-like ribbons flowing over a shared time (X) axis. The baseline position is driven by `offsetMode`, enabling four distinct layouts from the canonical centred streamgraph to a traditional stacked-area chart.

Four `offsetMode` values:

- **`wiggle`** (default) — Byron-Wattenberg algorithm. Minimises the total weighted slope change across the baseline, producing the most organic, river-like flow. This is the defining layout of the streamgraph family.
- **`silhouette`** — Baseline centred at half the total column height. Simpler than wiggle; always symmetric around the horizontal mid-line.
- **`expand`** — Each column is normalised so all series together fill 100% of the plot height. Useful for visualising relative share over time.
- **`zero`** — Baseline fixed at zero. Equivalent to a traditional stacked-area chart.

Catmull-Rom smoothing (`smoothing="curve"`) blends each ribbon's top and bottom polylines into a continuous curve, giving the characteristic flowing silhouette. Disable with `smoothing="none"` for hard angular edges.

Use this component directly when the chart type is fixed. Use `OrigamChart` with `type="streamgraph"` when you need runtime switching between chart families.

## Import

```ts
import { OrigamChartStreamgraph } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-streamgraph
    :series="[
      { name: 'Pop',      data: [420, 480, 510, 460, 440, 490, 530, 560, 520, 480, 460, 500] },
      { name: 'Rock',     data: [320, 300, 280, 310, 350, 370, 360, 340, 380, 400, 420, 390] },
      { name: 'Hip-Hop',  data: [260, 310, 380, 420, 400, 380, 350, 330, 310, 340, 360, 390] },
    ]"
    :categories="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"
    offset-mode="wiggle"
    smoothing="curve"
    title="Music Genre Listens"
    subtitle="12 months · 3 genres"
    :height="400"
  />
</template>

<script setup lang="ts">
import { OrigamChartStreamgraph } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | One entry per flowing ribbon. `series[i].data` must be a plain `Array<number>` aligned to `categories`. |
| `categories` | `Array<string>` | `[]` | X-axis labels (time periods). `categories[i]` labels the column at index `i`. Falls back to the numeric index when the array is shorter than the data. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `offsetMode` | `TChartStreamgraphOffset` | `'wiggle'` | Baseline algorithm. One of `'wiggle'`, `'silhouette'`, `'expand'`, `'zero'`. |
| `smoothing` | `'none' \| 'curve'` | `'curve'` | Path interpolation. `'curve'` applies Catmull-Rom on each ribbon; `'none'` uses straight linear segments. |
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when a series omits its own `color`. Supports intent names and raw CSS values. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade ribbons in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `showAxis` | `boolean` | `true` | Toggle the X-axis line and category labels. |
| `showGrid` | `boolean` | `false` | Toggle horizontal grid lines behind the ribbons. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Applied to each X-axis category label. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to Y-axis tick labels and tooltip values. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fired on ribbon click or keyboard activation. `point.x` = category label, `point.y` = series value at that X. |
| `legend-click` | `(series: IChartSeries, index: number)` | Fired on a legend-entry click before visibility flips. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fired after the legend toggles a series' visibility. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `default` / `tooltip` | `{ point, series, category, allPoints }` | Custom tooltip body. `allPoints` is an array of `{ series, value, color }` for every visible ribbon at the hovered X — use it to render a multi-series breakdown. |
| `legend-item` | `{ series, index, visible }` | Replace a single legend entry. |
| `title` | — | Replace the entire title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every series is hidden. |

## Behaviour notes

### Wiggle algorithm

The Byron-Wattenberg wiggle minimises the total weighted second derivative of the baseline. Implementation:

```
offset[0] = -totalAtColumn[0] / 2
for i = 1..n-1:
  g = sum_j( (layer_j[i] - layer_j[i-1]) × cumulative_below_j_avg )
  nTotal = totalAtColumn[i] + totalAtColumn[i-1]
  offset[i] = offset[i-1] - g / nTotal
```

When all series have equal flat values the wiggle baseline equals the silhouette baseline.

### Smoothing edge cases

Catmull-Rom requires at least two points. With a single time point the component renders a degenerate ribbon (zero-width line). With two points the spline degenerates to a straight line — this is correct behaviour.

### Expand mode

In `expand` mode the raw values are normalised column-by-column. A column where every series is `0` renders as a flat line (zero height). Y-axis labels are meaningless in expand mode; suppress them with `showAxis="false"` and add a subtitle noting the normalisation.

### Accessibility

Each `<path>` ribbon carries `tabindex="0"` and `role="button"` with an `aria-label` listing the series name and all values. Keyboard users can Tab through ribbons and activate them with Enter or Space.

### Animation

The `origam-chart-streamgraph-fade` keyframe fades ribbons from `opacity: 0` to the resting `opacity: 0.82`. Set `animated="false"` or `animationDuration="0"` to disable. The fade is automatically suppressed when `prefers-reduced-motion: reduce` is active.

## Composable reference

No dedicated composable — geometry and state are encapsulated inside the component using computed properties. Legend toggle state is managed via a local `Set<string>` of hidden series names.

## Usage examples

### Tech stack adoption with custom colours

```vue
<origam-chart-streamgraph
  :series="[
    { name: 'Vue',     data: [280, 310, 340, 370, 400, 420, 440, 460] },
    { name: 'React',   data: [620, 600, 580, 560, 540, 520, 500, 490] },
    { name: 'Svelte',  data: [60,  80, 110, 140, 170, 200, 230, 260] },
    { name: 'Angular', data: [380, 360, 340, 310, 280, 260, 240, 220] },
  ]"
  :categories="['Q1 24','Q2 24','Q3 24','Q4 24','Q1 25','Q2 25','Q3 25','Q4 25']"
  :color-scheme="['#41b883','#61dafb','#ff3e00','#dd0031']"
  offset-mode="wiggle"
  title="Framework adoption"
  subtitle="Relative popularity by quarter"
/>
```

### Custom multi-series tooltip

```vue
<origam-chart-streamgraph
  :series="musicSeries"
  :categories="months"
>
  <template #tooltip="{ category, allPoints }">
    <strong>{{ category }}</strong>
    <ul>
      <li v-for="p in allPoints" :key="p.series.name">
        {{ p.series.name }}: {{ p.value.toLocaleString() }} plays
      </li>
    </ul>
  </template>
</origam-chart-streamgraph>
```

### Expand mode with custom axis format

```vue
<origam-chart-streamgraph
  :series="marketShareSeries"
  :categories="quarters"
  offset-mode="expand"
  :y-axis-format="(v) => `${(v * 100).toFixed(0)}%`"
  :show-grid="true"
  title="Market share"
/>
```
