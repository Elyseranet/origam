# OrigamChartAxis

Extracted cartesian axis renderer. Paints the X / Y axis lines, tick marks, tick labels, and horizontal grid lines from pre-computed input — it does not own any data or scales. Intended for advanced consumers who compose a chart manually from primitives, or for the internal use of `OrigamChartCartesian`.

This component is a pure SVG renderer. It must be placed inside an `<svg>` element at the correct `viewBox`; it uses SVG coordinate space directly and does not manage its own viewport.

## Import

```ts
import { OrigamChartAxis } from '@origam/ds'
```

## Quick start

```vue
<template>
  <svg :viewBox="viewBox" width="100%" :height="height">
    <origam-chart-axis
      :plot="plot"
      :ticks="ticks"
      :show-axis="true"
      :show-grid="true"
      :y-axis-format="formatY"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { OrigamChartAxis } from '@origam/ds'
import { useChart } from '@origam/composables'
import type { IChartSeries } from '@origam/ds'

const height = 360
const width = 600

const series: Array<IChartSeries> = [
  { name: 'Revenue', data: [120, 145, 160, 148, 178, 210], color: 'primary' }
]
const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const engine = useChart({
  type:          () => 'line',
  series:        () => series,
  categories:    () => categories,
  stacked:       () => false,
  donutHoleSize: () => 0.6,
  colorScheme:   () => [],
  smoothing:     () => 'none',
  yMin:          () => undefined,
  yMax:          () => undefined,
  width:         () => width,
  height:        () => height,
  padding:       () => ({ top: 24, right: 24, bottom: 40, left: 52 })
})

const viewBox  = computed(() => engine.viewBox.value)
const plot     = computed(() => engine.plot.value)
const ticks    = computed(() => engine.ticks.value)

function formatY(v: number) { return `$${v}k` }
</script>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `plot` | `{ x0: number, y0: number, x1: number, y1: number, cx: number, cy: number }` | required | Pixel coordinates of the plotting area's four corners. Comes from `useChart().plot.value`. |
| `ticks` | `{ x: Array<IChartTick>, y: Array<IChartTick> }` | required | Tick descriptors for both axes. Comes from `useChart().ticks.value`. |
| `showAxis` | `boolean` | `true` | Render the four-side axis frame and tick labels. When `false`, the component renders nothing. |
| `showGrid` | `boolean` | `true` | Render horizontal grid lines under the plot. |
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Formatter applied to X-axis tick labels. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Formatter applied to Y-axis tick labels. |

### `IChartTick` (tick descriptor)

Each entry in `ticks.x` and `ticks.y`:

| Field | Type | Description |
|---|---|---|
| `position` | `number` | SVG pixel coordinate along the relevant axis. |
| `label` | `string` | Already-formatted label string. Overridden by `xAxisFormat` / `yAxisFormat` when those props are supplied. |
| `value` | `number \| string` | Raw value before formatting. |

## Emits

No emits — this is a presentational component.

## Slots

No slots — the component renders fixed SVG elements only.

## Behaviour notes

**SVG context required.** `OrigamChartAxis` is an SVG fragment component. It must be a direct or nested child of an `<svg>` element. Mounting it outside an SVG context produces invalid markup and browser rendering artefacts.

**Pure renderer.** The component owns no reactive state and performs no data computation. Every position it renders comes from the `plot` and `ticks` props. Update those props reactively (e.g. via a `ComputedRef` from `useChart`) and the axis repaints automatically.

**`showAxis = false` renders nothing.** When `showAxis` is `false`, the component mounts an empty `<g>` with no children — it does not forward its children or render the grid either.

**Grid only without axis lines.** Passing `showAxis=true` and `showGrid=true` renders both. To render only horizontal grid lines without the axis frame and labels, set `showAxis=false` and `showGrid=true`. However: when `showAxis=false`, **nothing** is rendered (including the grid). If you need grid-only rendering, pass both `showAxis=true` and `showGrid=true` and hide the axis lines via CSS.

**Tick count.** The number of Y ticks is controlled by `CHART_Y_TICK_COUNT` (a constant in `src/consts/Chart/chart.const.ts`; default value exposed in the stories is `5`). The number of X ticks equals `categories.length`. These counts are determined by `useChart` before the ticks reach this component; `OrigamChartAxis` renders whatever it receives.

**Formatter application.** `xAxisFormat` and `yAxisFormat` are applied inside the component to the `tick.value` field (not `tick.label`). The pre-formatted `tick.label` is used as a fallback when no formatter is provided.

## Examples

### Standalone axis in a custom SVG chart

```vue
<template>
  <svg viewBox="0 0 600 360" width="100%" height="360">
    <origam-chart-axis
      :plot="{ x0: 52, y0: 24, x1: 576, y1: 320, cx: 314, cy: 172 }"
      :ticks="ticks"
      :show-axis="true"
      :show-grid="true"
    />
  </svg>
</template>

<script setup lang="ts">
import { OrigamChartAxis } from '@origam/ds'
import type { IChartTick } from '@origam/ds'

const ticks = {
  x: [
    { position:  52, label: 'Jan', value: 'Jan' },
    { position: 157, label: 'Feb', value: 'Feb' },
    { position: 262, label: 'Mar', value: 'Mar' },
    { position: 367, label: 'Apr', value: 'Apr' },
    { position: 472, label: 'May', value: 'May' },
    { position: 576, label: 'Jun', value: 'Jun' }
  ] as Array<IChartTick>,
  y: [
    { position: 320, label: '0',   value: 0   },
    { position: 246, label: '50',  value: 50  },
    { position: 172, label: '100', value: 100 },
    { position:  98, label: '150', value: 150 },
    { position:  24, label: '200', value: 200 }
  ] as Array<IChartTick>
}
</script>
```

### Driven by `useChart` (reactive)

```vue
<template>
  <svg :viewBox="viewBox" width="100%" height="360" style="display: block;">
    <origam-chart-axis
      :plot="plot"
      :ticks="ticks"
      :show-axis="showAxis"
      :show-grid="showGrid"
      :y-axis-format="(v) => `${v}k`"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { OrigamChartAxis } from '@origam/ds'
import { useChart } from '@origam/composables'
import type { IChartSeries } from '@origam/ds'

defineProps<{ showAxis?: boolean, showGrid?: boolean }>()

const series: Array<IChartSeries> = [
  { name: 'Sales', data: [12, 18, 22, 19, 25, 32], color: 'primary' }
]
const cats = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const { viewBox, plot, ticks } = useChart({
  type: () => 'line', series: () => series, categories: () => cats,
  stacked: () => false, donutHoleSize: () => 0.6, colorScheme: () => [],
  smoothing: () => 'none', yMin: () => undefined, yMax: () => undefined,
  width: () => 600, height: () => 360,
  padding: () => ({ top: 24, right: 24, bottom: 40, left: 52 })
})
</script>
```
