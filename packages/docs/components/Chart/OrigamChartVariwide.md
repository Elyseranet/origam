# OrigamChartVariwide

Variwide chart family. Encodes **two metrics simultaneously** per category:

- **Bar HEIGHT** → primary value (`value` field) mapped to the Y axis scale.
- **Bar WIDTH** → secondary value (`width` field) proportional to its share of the total sum of widths.

Classic use-cases: GDP × population, revenue × market share, response time × request count.

Use this component when the type is fixed at `variwide`. Use `OrigamChart` with `type="variwide"` when you need runtime switching between chart families.

## Import

```ts
import { OrigamChartVariwide } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-variwide
    :series="[{
      name: 'GDP × Population',
      data: [
        { category: 'US', value: 23, width: 331 },
        { category: 'China', value: 18, width: 1411 },
        { category: 'Germany', value: 4.2, width: 83 }
      ]
    }]"
    :height="360"
    title="GDP × Population (2023)"
    subtitle="Width = population (M) · Height = GDP (T$)"
  />
</template>

<script setup lang="ts">
import { OrigamChartVariwide } from '@origam/ds'
</script>
```

## Data shape

`series[0].data` accepts an array of `IChartVariwideDatum`:

```ts
interface IChartVariwideDatum {
  category: string       // X-axis label
  value: number          // primary metric → bar HEIGHT
  width: number          // secondary metric → proportional bar WIDTH
  color?: TIntent | string  // optional per-datum color override
}
```

Plain `number` items (from `IChartSeries.data`) are accepted for compatibility; their `width` defaults to `1` (equal-width columns).

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Reads `series[0]` only. Each datum becomes one column. Extra series are silently ignored. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `360` | Chart height in px. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when a datum has no `color`. Supports intent names and raw CSS values. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `barGap` | `number` | `2` | Gap in SVG pixels between adjacent columns. `0` = flush. |
| `showLabel` | `boolean` | `true` | Render the primary value as a text label above each bar. |
| `showAxis` | `boolean` | `true` | Render X (category) and Y (value) axes with tick marks and labels. |
| `showGrid` | `boolean` | `true` | Render horizontal grid lines aligned with Y-axis ticks. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Animate bars on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `false` | Toggle the legend block (off by default — variwide labels are on the X axis). |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor: `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | identity | Applied to X-axis category tick labels. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to Y-axis tick labels, the above-bar label, and the tooltip primary value. |
| `yMin` | `number` | auto | Override the computed Y minimum. |
| `yMax` | `number` | auto | Override the computed Y maximum. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a bar. `point.x` is the category label; `point.y` is the primary value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string, value: number, widthValue: number, formattedValue: string, formattedWidth: string, color: string }` | Replace the default tooltip card. Receives both encodings. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or has no valid data. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are ignored.

**Width encoding geometry.** Total column widths = Σ `datum.width`. Each bar gets `plotWidth × (datum.width / totalWidth) - barGap` SVG pixels wide. A country with population 1411 M (China) will be ~21× wider than one with 67 M (UK), making the two-dimensional encoding visually immediate.

**Y scale.** The Y axis maps from `yMin` (default `min(0, min(values))`) to `yMax` (default `max(values)`). Bars grow upward from `y = scaleY(0)`.

**Axis ticks.** The X axis places one tick at the center of each column; the label is the category string (optionally formatted via `xAxisFormat`). The Y axis emits 5 evenly-spaced ticks (optionally formatted via `yAxisFormat`).

**Empty state.** When `series` is empty or `series[0].data` is empty, the `#empty` slot is rendered instead of the SVG.

**Custom tooltip.** The `#tooltip` slot receives both encoded values (`value` + `widthValue` / `formattedValue` + `formattedWidth`) so you can display both metrics with their respective units.

**Accessibility.** Each bar is a focusable `<rect>` with `role="button"` and an `aria-label` carrying the category, formatted value, and width value. Keyboard users can Tab through bars and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>` for screen-reader context.

**Animation.** Bars grow upward from the baseline on mount via a CSS `scaleY` keyframe. The animation is skipped when `animated=false` or `prefers-reduced-motion: reduce` is set.

## Examples

### GDP × Population

```vue
<template>
  <origam-chart-variwide
    :series="[{
      name: 'GDP × Population',
      data: [
        { category: 'US', value: 23, width: 331 },
        { category: 'China', value: 18, width: 1411 },
        { category: 'Germany', value: 4.2, width: 83 },
        { category: 'Japan', value: 4.9, width: 125 },
        { category: 'India', value: 3.5, width: 1393 },
        { category: 'UK', value: 3.1, width: 67 }
      ]
    }]"
    :y-axis-format="(v) => v + ' T$'"
    :height="400"
    title="GDP × Population (2023)"
    subtitle="Width = population (M) · Height = GDP (T$)"
  />
</template>

<script setup lang="ts">
import { OrigamChartVariwide } from '@origam/ds'
</script>
```

### Revenue × Market share with custom tooltip

```vue
<template>
  <origam-chart-variwide
    :series="[{
      name: 'Revenue × Market share',
      data: [
        { category: 'Phone', value: 120, width: 38, color: 'primary' },
        { category: 'Laptop', value: 95, width: 22, color: 'success' },
        { category: 'Tablet', value: 42, width: 15, color: 'warning' },
        { category: 'Watch', value: 28, width: 14, color: 'danger' },
        { category: 'Earbuds', value: 18, width: 11, color: 'info' }
      ]
    }]"
    :height="360"
  >
    <template #tooltip="{ category, formattedValue, widthValue }">
      <div>
        <strong>{{ category }}</strong>
        <p>Revenue: {{ formattedValue }} M€</p>
        <p>Market share: {{ widthValue }}%</p>
      </div>
    </template>
  </origam-chart-variwide>
</template>

<script setup lang="ts">
import { OrigamChartVariwide } from '@origam/ds'
</script>
```

## Composable reference

`OrigamChartVariwide` is a self-contained component — it does not ship a dedicated composable. All geometry is computed inside the component's `<script setup>` as pure `computed()` functions that depend only on props.
