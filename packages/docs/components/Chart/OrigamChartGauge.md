# OrigamChartGauge

Solid radial gauge — a 270-degree arc track with a filled arc indicating the current value, an optional centre value label, and optional min / max endpoint labels at the arc's start and end. Modelled after the Highcharts "Solid Gauge" demo aesthetic. Single-value visualisation: the gauge reads `series[0].data[0]`.

Use this component when the type is fixed at `gauge`. Use `OrigamChart` with `type="gauge"` when you need runtime switching between gauge and another topology.

## Import

```ts
import { OrigamChartGauge } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-gauge
    :series="[{ name: 'Completion', data: [62], color: 'primary' }]"
    :gauge-min="0"
    :gauge-max="100"
    gauge-unit="%"
    :height="280"
    title="Project completion"
  />
</template>

<script setup lang="ts">
import { OrigamChartGauge } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Gauge reads `series[0].data[0]` as the current value. Extra series and extra data points are ignored. The series `color` prop sets the filled arc colour. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `360` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Fallback palette when the series omits its own `color`. Gauge only ever uses `colorScheme[0]`. |
| `title` | `string` | `undefined` | Optional title above the gauge. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Gauge geometry

| Name | Type | Default | Description |
|---|---|---|---|
| `gaugeMin` | `number` | `0` | Lower bound of the gauge range. |
| `gaugeMax` | `number` | `100` | Upper bound of the gauge range. |
| `gaugeUnit` | `string` | `''` | Unit string appended to the centre value label (e.g. `'%'`, `' rpm'`). |
| `gaugeThickness` | `number` | `18` | Arc thickness in SVG pixels. |
| `gaugeStartAngle` | `number` | `-3π/4` | Arc start angle in radians. Default is `−135°` (bottom-left of a 270-degree sweep). |
| `gaugeEndAngle` | `number` | `+3π/4` | Arc end angle in radians. Default is `+135°` (bottom-right). |
| `gaugeShowEndpoints` | `boolean` | `true` | Render the `gaugeMin` / `gaugeMax` labels at the arc endpoints. |
| `gaugeShowValue` | `boolean` | `true` | Render the centre value label. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Animate the filled arc on first paint and on value changes. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block (shows the series name and colour). |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. |
| `showTooltip` | `boolean` | `true` | Toggle hover tooltip on the filled arc. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on the filled arc. `point.y` is the clamped value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `gauge-value` | `{ value: number, ratio: number, formatted: string, unit: string }` | Replace the centre value label. `ratio` is the normalised position in `[0..1]`; `formatted` is `String(clampedValue)`; `unit` mirrors `gaugeUnit`. |
| `gauge-min` | `{ value: number }` | Replace the min label at the arc start endpoint. |
| `gauge-max` | `{ value: number }` | Replace the max label at the arc end endpoint. |
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty. |

## Behaviour notes

**Value clamping.** Values outside `[gaugeMin, gaugeMax]` are silently clamped before the arc is computed. The centre label shows the clamped value. `ratio` (available in the `#gauge-value` slot) is always in `[0..1]`.

**Arc geometry.** The default sweep is 270 degrees, leaving a 90-degree gap at the bottom (the classic speedometer look). Adjust `gaugeStartAngle` and `gaugeEndAngle` for different arc ranges. A full ring is `startAngle = -π`, `endAngle = π`.

**`gaugeThickness` and available radius.** The component sizes the outer radius from the available plot area. `gaugeThickness` is an absolute SVG-pixel value. A very thick arc on a small chart may clip; reduce thickness or increase `height` if labels overlap the arc.

**Empty arc at `value === gaugeMin`.** When the value equals the minimum, the filled arc `valuePath` is an empty string and nothing is painted on the indicator track. The empty track arc is always rendered.

**Composable — `useChartGauge`.** The geometry engine is exposed separately for advanced consumers who want to drive a custom SVG gauge without using the component template (see the composable section below).

**No `type` prop.** This component has no `type` prop — it always renders a gauge. Setting `type` on the series object has no effect.

**SSR.** A placeholder `<div>` is emitted server-side; the SVG mounts on `onMounted`.

## Composable — `useChartGauge`

Produces all arc geometry descriptors from thunk options. Useful when you want a raw SVG gauge without the full component chrome.

```ts
import { useChartGauge } from '@origam/composables'

const { geometry } = useChartGauge({
  value:  () => 62,
  min:    () => 0,
  max:    () => 100,
  width:  () => 300,
  height: () => 300,
  padding: () => ({ top: 24, right: 24, bottom: 36, left: 24 }),
  thickness:  () => 18,        // optional — defaults to 18
  startAngle: () => -Math.PI * 3 / 4,  // optional
  endAngle:   () => Math.PI * 3 / 4    // optional
})

// geometry.value: IChartGaugeGeometry
// {
//   trackPath, valuePath,
//   valueAngle, startAngle, endAngle,
//   outerRadius, innerRadius,
//   centerX, centerY,
//   ratio, clampedValue
// }
```

All options are `() => …` thunks so the composable stays reactive when driven from props or a store.

## Examples

### Minimal gauge

```vue
<template>
  <origam-chart-gauge
    :series="[{ name: 'Score', data: [78], color: 'success' }]"
    :gauge-min="0"
    :gauge-max="100"
    gauge-unit=" pts"
    :height="240"
  />
</template>

<script setup lang="ts">
import { OrigamChartGauge } from '@origam/ds'
</script>
```

### Custom value label with colour coding

```vue
<template>
  <origam-chart-gauge
    :series="[{ name: 'CPU', data: [cpu], color: cpuIntent }]"
    :gauge-min="0"
    :gauge-max="100"
    gauge-unit="%"
    :height="300"
    title="CPU usage"
  >
    <template #gauge-value="{ value, unit }">
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="28"
        font-weight="700"
        :fill="cpuIntent === 'danger' ? 'var(--origam-color__action--danger---bg)' : 'currentColor'"
      >{{ value }}{{ unit }}</text>
    </template>
  </origam-chart-gauge>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { OrigamChartGauge } from '@origam/ds'

const cpu = ref(42)
const cpuIntent = computed(() =>
  cpu.value >= 90 ? 'danger' : cpu.value >= 70 ? 'warning' : 'success'
)

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => { cpu.value = 20 + Math.round(Math.random() * 75) }, 1500)
})
onUnmounted(() => clearInterval(timer))
</script>
```
