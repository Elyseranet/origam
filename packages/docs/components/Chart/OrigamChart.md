# OrigamChart

Universal chart shell that dispatches to one of twenty-one rendering families based on the `type` prop. Accepts twenty-nine visualisation primitives — `line`, `area`, `bar`, `column`, `scatter`, `spline`, `stepped-line`, `pie`, `donut`, `radar`, `gauge`, `funnel`, `pyramid`, `honeycomb`, `treemap`, `sankey`, `word-cloud`, `heatmap`, `sunburst`, `box-plot`, `pictorial`, `candlestick`, `streamgraph`, `variwide`, `polar-bar`, `bullet`, `pareto`, `map`, `sparkline` — through a single consistent API. Pure SVG rendering; no canvas, no `d3`, no `chart.js`.

Prefer a family-level component (`OrigamChartCartesian`, `OrigamChartPolar`, `OrigamChartRadar`, `OrigamChartGauge`, `OrigamChartPyramid`, `OrigamChartHoneycomb`, `OrigamChartTreemap`, `OrigamChartSankey`, `OrigamChartWordCloud`, `OrigamChartHeatmap`, `OrigamChartSunburst`, `OrigamChartBoxPlot`, `OrigamChartPictorial`, `OrigamChartCandlestick`, `OrigamChartStreamgraph`, `OrigamChartVariwide`, `OrigamChartPolarBar`, `OrigamChartBullet`, `OrigamChartPareto`, `OrigamChartMap`, `OrigamChartSparkline`) when the chart type is fixed at compile time and you want a tightly-typed prop surface. Use `OrigamChart` when the type is determined at runtime or you need to switch families dynamically.

## Import

```ts
import { OrigamChart } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart
    type="line"
    :series="series"
    :categories="months"
    :height="320"
    title="Monthly sales"
    subtitle="2025 vs 2026"
    @point-click="onPointClick"
  />
</template>

<script setup lang="ts">
import { OrigamChart } from '@origam/ds'
import type { IChartSeries, IChartPoint } from '@origam/ds'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const series: Array<IChartSeries> = [
  { name: 'Sales 2025', data: [12, 18, 22, 19, 25, 32, 28, 33, 30, 36, 39, 42], color: 'primary' },
  { name: 'Sales 2026', data: [16, 22, 25, 23, 30, 38, 35, 41, 39, 45, 48, 52], color: 'success' }
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
| `categories` | `Array<string>` | `[]` | X-axis labels for line / area / bar / column / radar. Length should match the longest series; missing entries fall back to the numeric index. Ignored for scatter. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `TChartType` | `'line'` | Visualisation primitive. One of `'line'`, `'area'`, `'bar'`, `'column'`, `'scatter'`, `'spline'`, `'stepped-line'`, `'pie'`, `'donut'`, `'radar'`, `'gauge'`, `'funnel'`, `'pyramid'`, `'honeycomb'`, `'treemap'`, `'sankey'`, `'word-cloud'`, `'heatmap'`, `'sunburst'`, `'box-plot'`, `'pictorial'`, `'candlestick'`, `'streamgraph'`, `'variwide'`, `'polar-bar'`, `'bullet'`, `'pareto'`, `'map'`, `'sparkline'`. |
| `height` | `number \| string` | `360` | Chart height. A plain number is interpreted as `px`. Any valid CSS length is accepted. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand (`'16/9'`, `'4/3'`, `'1/1'`). When set, overrides `height` and the chart scales with its container width. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when a series omits its own `color`. Pass intent names (e.g. `'primary'`) or raw CSS values. Cycles by index. **No effect when `type` is `'bullet'`, `'candlestick'`, `'heatmap'` or `'map'`** — see the behaviour note below (#426). |
| `title` | `string` | `undefined` | Optional title rendered above the plotting area. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle rendered below the title. |
| `fontSize` | `TFontSize` | `undefined` | Header typography token applied to the title + subtitle (`xs` → `5xl`). Inherited from `IChartBaseProps`. |
| `fontWeight` | `TFontWeight` | `undefined` | Header weight token applied to the title (`regular` → `black`). Inherited from `IChartBaseProps`. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Animate paths / bars / slices on first paint and on data changes. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `stacked` | `boolean` | `false` | Stack series on top of each other. Applies to `bar` and `column`. |
| `stacking` | `TChartStacking` | `'normal'` | Stacking mode applied when `stacked=true`. `'normal'` stacks raw absolute values; `'percent'` normalises every stack to 100%, fixes the Y axis at `0 → 100`, and formats tick labels as `${v}%`. Cartesian family only. |
| `smoothing` | `TChartSmoothing` | `'none'` | Smoothing strategy for `line` / `area`. `'none'` draws straight segments; `'curve'` uses cubic Bezier with Catmull-Rom tangents. `spline` forces `'monotone'` internally regardless of this prop. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `showGrid` | `boolean` | `true` | Render horizontal grid lines behind the plot. Ignored for `pie`, `donut`, `radar`, and `gauge`. |
| `showAxis` | `boolean` | `true` | Render X / Y axes and tick labels. Ignored for `pie`, `donut`, and `gauge`. |

### Axis formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Formatter applied to X-axis tick labels. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Formatter applied to Y-axis tick labels. |
| `yMin` | `number` | auto | Override the auto-computed Y minimum. Useful when data starts well above zero. |
| `yMax` | `number` | auto | Override the auto-computed Y maximum. |

### Surface — dimension, spacing, shape

`OrigamChart` renders no DOM of its own — it dispatches to one of the 21
family components. These props are forwarded verbatim to whichever family is
active (all 21 already consume them through the shared `IChartBaseProps` →
`IDimensionProps` / `IMarginProps` / `IPaddingProps` / `IRoundedProps` /
`IElevationProps` / `IBgColorProps` chain), so `<origam-chart padding="8px"
rounded="lg" elevation="md">` styles the actual rendered family, not the
dispatcher. Inherited from `IDimensionProps` / `IMarginProps` /
`IPaddingProps` / `IRoundedProps` / `IElevationProps` / `IBgColorProps`.

| Name | Type | Default | Description |
|---|---|---|---|
| `width` | `number \| string` | `undefined` | Chart width. A plain number is interpreted as `px`. |
| `minWidth` / `maxWidth` | `number \| string` | `undefined` | Min / max width bounds. |
| `minHeight` / `maxHeight` | `number \| string` | `undefined` | Min / max height bounds. |
| `bgColor` | `TIntent \| string` | `undefined` | Background color painted behind the chart surface. |
| `elevation` | `TElevation` | `undefined` | Shadow rung (`xs` → `xl`) applied to the chart surface. |
| `rounded` | `TRounded \| string \| boolean` | `undefined` | Corner radius shorthand. |
| `roundedTopLeft` / `roundedTopRight` / `roundedBottomLeft` / `roundedBottomRight` | `string` | `undefined` | Per-corner radius override — takes precedence over `rounded` for the corner it targets. |
| `padding` / `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft` / `paddingBlock` / `paddingInline` | `string \| number` | `undefined` | Padding shorthand and per-side overrides. |
| `margin` / `marginTop` / `marginRight` / `marginBottom` / `marginLeft` / `marginBlock` / `marginInline` | `string \| number` | `undefined` | Margin shorthand and per-side overrides. |

### Cartesian overlays

Forwarded verbatim to `<OrigamChartCartesian>`. They are **cartesian-family
only** — `line`, `spline`, `stepped-line`, `area`, `bar`, `column`, `scatter`,
`candlestick`, `variwide`. Non-cartesian types (`pie`, `donut`, `radar`,
`gauge`, `treemap`, …) ignore them silently, with the single exception of
`drilldown`, which the polar family honours too.

| Name | Type | Default | Description |
|---|---|---|---|
| `plotBands` | `Array<IChartPlotBand>` | `[]` | Coloured rectangular zones drawn behind (or above) the data, spanning a numeric range on either axis. Each band accepts `axis`, `from`, `to`, `color`, `opacity`, `label`, `labelColor` and `layer`. |
| `plotLines` | `Array<IChartPlotLine>` | `[]` | Threshold lines drawn at a fixed axis value. Each line accepts `axis`, `value`, `color`, `width`, `dash`, `label`, `labelAlign` and `layer`. |
| `annotations` | `Array<IChartAnnotation>` | `[]` | Overlay annotations positioned in data coordinates and projected through the chart scales. Four kinds: `arrow`, `label`, `circle`, `bracket`. |
| `secondaryYAxis` | `IChartSecondaryYAxis` | `undefined` | Configuration of the right-hand Y axis (`min`, `max`, `format`, `title`). A series opts into it with `yAxis: 1`; passing this object alone also forces the axis to render. |
| `drilldown` | `IChartDrilldownProps` | `undefined` | Wires the drilldown feature. `datasets` is the bank of named sub-datasets looked up by the `drilldown.id` carried on a data point; `backLabel` and `navAriaLabel` label the breadcrumb trail. |

```vue
<origam-chart
    type="column"
    :series="series"
    :categories="categories"
    :plot-bands="[{ axis: 'y', from: 20, to: 34, color: 'success', label: 'Target zone' }]"
    :plot-lines="[{ axis: 'y', value: 30, color: 'danger', dash: 'dashed', label: 'Quota' }]"
    :annotations="[{ kind: 'circle', x: 'Dec', y: 52, text: 'Peak', color: 'warning' }]"
/>
```

### Donut-specific

| Name | Type | Default | Description |
|---|---|---|---|
| `donutHoleSize` | `number` | `0.6` | Inner-radius proportion for `donut`. `0` collapses to a pie; `1` produces a zero-thickness ring. Ignored unless `type='donut'`. |

### Gauge-specific

| Name | Type | Default | Description |
|---|---|---|---|
| `gaugeMin` | `number` | `0` | Lower bound of the gauge range. Ignored unless `type='gauge'`. |
| `gaugeMax` | `number` | `100` | Upper bound of the gauge range. Ignored unless `type='gauge'`. |
| `gaugeUnit` | `string` | `''` | Unit string appended to the centre label (e.g. `'%'`, `' rpm'`). Ignored unless `type='gauge'`. |

> **Typography scope.** The `fontSize` / `fontWeight` props target the chart
> **header** (title + subtitle) only. Axis labels and per-type data labels
> (gauge value, sankey/treemap/pyramid/… labels, annotations, breadcrumbs) stay
> **theme-driven** — they are intentionally not exposed on the component API.
> Only `fontSize` and `fontWeight` have an effect on SVG `<text>`; `fontFamily`,
> `lineHeight` and `letterSpacing` are not part of the chart typography surface.
> `<OrigamChartWordCloud>` is excluded from header `fontWeight` (its `fontWeight`
> prop sets the rendered word weight).

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fired on mouse click or keyboard activation on a data point. Payload is fully denormalised — no need to look up the series. |
| `legend-click` | `(series: IChartSeries, index: number)` | Fired when a legend entry is clicked. Pair with `series-toggle` to drive visibility state. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fired after a legend click with the resulting visibility state. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default floating tooltip card entirely. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry (colour swatch + series name). |
| `title` | — | Replace the title + subtitle block above the chart. |
| `empty` | — | Rendered when `series` is empty or every series is hidden. |

## Behaviour notes

**Type switching at runtime.** Changing `type` triggers a full SVG re-render. The entrance animation replays from scratch (stroke-dashoffset is reset). To suppress the replay, set `:animated="false"` before the prop swap and restore it after.

**`spline` and smoothing.** `type='spline'` forces `smoothing='monotone'` internally unless you explicitly pass `smoothing='curve'` or `smoothing='none'`. This is the only case where the computed smoothing diverges from the prop value.

**Pie / donut data shape.** These two types consume only `series[0]`. Extra series are silently ignored. Slice colours cycle through `colorScheme` by data index, not by series index. Never set `type` on individual series objects when the chart-level type is `'pie'` or `'donut'` — the chart-level type is authoritative for polar charts.

**Gauge data shape.** The gauge reads `series[0].data[0]` as the current value. Extra series and extra data points are ignored. Never set `type='gauge'` on a series object.

**Empty state.** If `series` is `[]` or all series have `visible: false`, the `#empty` slot is rendered in place of the SVG.

**Animation and `prefers-reduced-motion`.** When the OS accessibility setting is active, all animations are suppressed regardless of the `animated` prop.

**SSR.** A placeholder `<div>` with the correct dimensions is emitted server-side; the SVG mounts on `onMounted`. No `window` or `ResizeObserver` is accessed during SSR.

**Keyboard access.** Each data point is focusable via `Tab` / `Shift+Tab`. `Enter` or `Space` fires `point-click` with a synthetic `KeyboardEvent`. Legend entries are also keyboard-navigable and announce their visibility state to screen readers.

**`showAxis` / `showGrid` on polar / gauge types.** These props are accepted by the shell for API uniformity but have no visual effect when `type` is `pie`, `donut`, `radar`, or `gauge`.

**`colorScheme` is not universal (#426).** Four types own a colour model that has no per-series identity axis for a rotating palette to drive, so the prop is inert on them:

| `type` | Colour model that replaces `colorScheme` |
|---|---|
| `'bullet'` | uniform `barColor` for the value bar + `rangeColors` for the bands |
| `'candlestick'` | binary `bullishColor` / `bearishColor` |
| `'heatmap'` | continuous gradient driven by `colorRange` |
| `'map'` | continuous `colorRange` (choropleth) or a single `lineColor` (flight routes) |

Passing a non-empty `colorScheme` on one of those four is not silent: the delegated sub-component warns once per component in development builds (`useUnsupportedProp`) and stays quiet in production.

## Composable — `useChart`

Stateless engine that produces every render-time descriptor the component needs. Available for advanced consumers who want to drive a custom SVG tree without using the component template.

```ts
import { useChart } from '@origam/composables'

const {
  viewBox,    // ComputedRef<string>  — '0 0 600 360'
  scales,     // ComputedRef<IChartScales>  — { x(v, i, n), y(v) }
  ticks,      // ComputedRef<{ x: IChartTick[], y: IChartTick[] }>
  paths,      // ComputedRef<IChartPath[]>  — path/rect/circle descriptors
  legend,     // ComputedRef<IChartLegendItem[]>
  hover,      // Ref<IChartPoint | null>
  onPointHover, // (point | null) => void
  plot,       // ComputedRef<{ x0, y0, x1, y1, cx, cy }>
  yRange,     // ComputedRef<{ min, max }>
  slotCount,  // ComputedRef<number>
  colorFor,   // (series, index) => string
  effectiveType // (series) => TChartType
} = useChart({
  type:         () => 'line',
  series:       () => mySeries,
  categories:   () => myCategories,
  stacked:      () => false,
  donutHoleSize:() => 0.6,
  colorScheme:  () => [],
  smoothing:    () => 'none',
  yMin:         () => undefined,
  yMax:         () => undefined,
  width:        () => 600,
  height:       () => 360,
  padding:      () => ({ top: 24, right: 24, bottom: 36, left: 48 })
})
```

Every option is a `() => …` thunk so the composable can be driven from props, a Pinia store, or hardcoded constants without re-instantiation.

## Examples

### Runtime type switch

```vue
<template>
  <div>
    <select v-model="chartType">
      <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
    </select>
    <origam-chart
      :type="chartType"
      :series="series"
      :categories="months"
      :height="360"
      title="Revenue dashboard"
      @point-click="onPointClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OrigamChart } from '@origam/ds'
import type { IChartSeries, IChartPoint } from '@origam/ds'

const types = ['line', 'area', 'column', 'bar', 'spline', 'stepped-line', 'scatter']
const chartType = ref<string>('line')
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [120, 145, 160, 148, 178, 210, 195, 230, 218, 245, 262, 280], color: 'primary' },
  { name: 'Costs',   data: [ 90, 105, 118, 112, 132, 155, 144, 168, 160, 178, 190, 205], color: 'danger'  }
]

function onPointClick(point: IChartPoint) {
  console.table(point)
}
</script>
```

### Gauge with live update

```vue
<template>
  <origam-chart
    type="gauge"
    :series="[{ name: 'CPU', data: [cpu], color: 'warning' }]"
    :gauge-min="0"
    :gauge-max="100"
    gauge-unit="%"
    title="CPU usage"
    :height="280"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { OrigamChart } from '@origam/ds'

const cpu = ref(42)
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => { cpu.value = 20 + Math.round(Math.random() * 60) }, 1500)
})
onUnmounted(() => clearInterval(timer))
</script>
```

### Custom tooltip and empty state

```vue
<template>
  <origam-chart
    type="column"
    :series="series"
    :categories="categories"
    :height="300"
  >
    <template #tooltip="{ point, series, category }">
      <div class="tip">
        <strong>{{ series.name }}</strong>
        <span>{{ category }} — ${{ point.y }}k</span>
      </div>
    </template>
    <template #empty>
      <p>No data available for the selected period.</p>
    </template>
  </origam-chart>
</template>

<script setup lang="ts">
import { OrigamChart } from '@origam/ds'
import type { IChartSeries } from '@origam/ds'

const categories = ['Q1', 'Q2', 'Q3', 'Q4']
const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [120, 185, 210, 250], color: 'primary' },
  { name: 'Costs',   data: [ 90, 130, 155, 175], color: 'danger'  }
]
</script>
```
