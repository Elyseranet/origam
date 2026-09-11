# OrigamChartPolarBar

Polar bar (nightingale-rose / radial column) chart. Renders a **single series** of N data points as N wedge-shaped arcs arranged radially around a common centre.

Each wedge occupies an equal angular slot; its **outer radius is proportional to its value** relative to the series maximum (or `maxValue`). The inner radius is a fixed fraction of the total radius, controlled by `innerRadius`.

This encoding is well-suited to cyclical data (days of the week, months of the year, hours of the day) where the radial layout visually reinforces the cyclical nature, and relative magnitude is communicated through varying bar length rather than bar height.

## Import

```ts
import { OrigamChartPolarBar } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-polar-bar
    :series="[{ name: 'Activity (hrs)', data: [8, 9, 7, 8, 10, 4, 3] }]"
    :categories="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
    :height="400"
    title="Hours of activity per day"
    subtitle="Week 21 — 2026"
  />
</template>

<script setup lang="ts">
import { OrigamChartPolarBar } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | The component reads `series[0]` only. Each datum becomes one wedge. Extra series are silently ignored. |
| `categories` | `Array<string>` | `[]` | Label for each wedge. `categories[i]` maps to `series[0].data[i]`. Falls back to `data[i].x` (object form) then `Item N`. |
| `maxValue` | `number` | `max(data)` | Override the auto-computed maximum used to scale wedge radii. Useful when you want wedges to be comparable across two charts. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `innerRadius` | `number` | `0.1` | Fraction of total radius reserved as a centre hole. `0` = no hole, `1` = zero-thickness ring. |
| `startAngle` | `number` | `0` | Start angle in radians for the first wedge. `0` = 3 o'clock; `-Math.PI / 2` = 12 o'clock. |
| `gap` | `number` | `0.02` | Angular gap between wedges in radians. `0` = flush wedges. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when the series omits its own `color`. Each wedge gets its own colour by index. Supports intent names and raw CSS values. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `showLabel` | `boolean` | `true` | Render category labels outside the outer radius. |
| `showValue` | `boolean` | `false` | Render the numeric value inside the wedge when there is sufficient angular room. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade wedges in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Applied to the tooltip X label. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to in-wedge value labels and the tooltip Y value. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a wedge. `point.x` = category label; `point.y` = raw value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, category: string \| number, percentage: string }` | Replace the default tooltip card. Receives the percentage of total as a pre-formatted string (e.g. `"23.4%"`). |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every wedge is hidden. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively.

**Equal angular slots.** All N wedges share the same angular slot: `(2π - N × gap) / N`. It is the **outer radius** that varies — proportionally to `value / maxValue`.

**Inner radius.** `innerRadius` is a fraction of the total available radius (canvas half-width minus label clearance). `innerRadius=0.1` gives a small centre hole that prevents narrow wedges from converging to a visual spike.

**Label placement.** Category labels are anchored at `outerR + 14` SVG units along the wedge midpoint radial. The `text-anchor` flips automatically between `start`, `middle`, and `end` based on whether the midpoint angle lies on the right, top/bottom, or left half.

**Value labels.** In-wedge value labels are rendered only when `showValue=true` AND the wedge has sufficient angular span (≥ 0.25 rad) and radial depth (≥ 12 SVG units). Narrow wedges never show an in-wedge label.

**Hidden wedges.** When a legend item is toggled off, its wedge is removed from the SVG. The remaining wedges stay at their computed positions — no reflow. The angular slot is "skipped" visually; the positions of other wedges do not shift.

**Percentage.** Tooltip and `#tooltip` slot bindings expose a `percentage` field: the wedge value as a percentage of the sum of all non-negative values in the series. Hidden wedges are still included in the total to keep percentages stable during toggle.

**Colour inheritance.** `series[0].color` (if set) is used as the single colour for all wedges. Per-wedge colours come from `colorScheme` (cycling by index) when absent.

**Accessibility.** Each wedge is a focusable `<path>` with `role="button"` and an `aria-label` carrying category + formatted value + percentage. Keyboard users can Tab through wedges and activate with Enter or Space.

**Animation.** Wedges fade in via a CSS keyframe. Skipped when `animated=false` or `prefers-reduced-motion: reduce`.

**SSR.** The SVG is rendered server-side — all geometry is pure computed values with no `onMounted` guard.

## Examples

### Weekly activity (12 o'clock start)

```vue
<template>
  <origam-chart-polar-bar
    :series="[{ name: 'Activity (hrs)', data: [8, 9, 7, 8, 10, 4, 3] }]"
    :categories="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
    :start-angle="-1.5708"
    :inner-radius="0.2"
    :height="400"
    title="Hours per day"
  />
</template>
```

### Sales by product with custom tooltip

```vue
<template>
  <origam-chart-polar-bar
    :series="[{ name: 'Units sold', data: [45, 30, 15, 8, 12] }]"
    :categories="['Phone', 'Laptop', 'Tablet', 'Watch', 'Earbuds']"
    :color-scheme="['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff']"
    :y-axis-format="(v) => v.toLocaleString()"
    :height="380"
    title="Sales by product"
  >
    <template #tooltip="{ point, category, percentage }">
      <div style="padding: 8px;">
        <strong>{{ category }}</strong>
        <p>{{ point.y }} units — {{ percentage }}</p>
      </div>
    </template>
  </origam-chart-polar-bar>
</template>
```
