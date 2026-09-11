# OrigamChartBullet

Compact KPI display chart (Stephen Few). Each series entry renders one bullet — qualitative range bands (poor / acceptable / good) as a coloured background, an actual-value bar overlaid on top, and a thin target marker tick for the comparative measure.

## Quick start

```vue
<script setup lang="ts">
import { OrigamChartBullet } from '@origam/components'
import type { IChartBulletDatum, IChartSeries } from '@origam/interfaces'

const series: Array<IChartSeries> = [
  {
    name: 'Revenue',
    data: [{ value: 420, target: 500, ranges: [{ to: 200 }, { to: 350 }, { to: 600 }] } as unknown as IChartBulletDatum]
  },
  {
    name: 'Profit Margin',
    data: [{ value: 28, target: 35, ranges: [{ to: 15 }, { to: 25 }, { to: 40 }] } as unknown as IChartBulletDatum]
  }
]
</script>

<template>
  <OrigamChartBullet
    :series="series"
    :categories="['Revenue', 'Profit Margin']"
    title="Sales Targets"
    subtitle="Q1 2026"
  />
</template>
```

## Data shape

Each series entry must have exactly one datum in its `data` array. The datum must follow the `IChartBulletDatum` shape:

```ts
interface IChartBulletDatum {
  value: number      // actual measured value
  target: number     // comparative target / goal
  ranges: Array<{
    to: number         // upper bound of this qualitative band
    color?: string     // optional fill (intent or raw CSS)
  }>
}
```

Bands are rendered in array order. Each band covers `[previous.to, this.to]`. Stephen Few recommends three bands: poor / acceptable / good.

## Props

### Core

| Prop | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | One entry per bullet. Each entry's `data[0]` must be an `IChartBulletDatum`. |
| `categories` | `Array<string>` | `[]` | Labels rendered beside each bullet. Falls back to `series[i].name`. |
| `title` | `string` | `undefined` | Title above the chart. |
| `subtitle` | `string` | `undefined` | Subtitle below the title. |

### Visual

| Prop | Type | Default | Description |
|---|---|---|---|
| `barColor` | `TIntent \| string` | `'primary'` | Fill colour of the actual-value bar. |
| `targetColor` | `TIntent \| string` | `'danger'` | Stroke colour of the target marker tick. |
| `rangeColors` | `Array<TIntent \| string>` | `['danger', 'warning', 'success']` | Fallback palette used when `range.color` is omitted. Cycled in array order. |
| `orientation` | `TChartBulletOrientation` | `'horizontal'` | `'horizontal'` renders labels left, bars right. `'vertical'` renders labels bottom, bars upward. |
| `barThickness` | `number` | `0.45` | Fraction of the slot height (horizontal) or slot width (vertical) used for the value bar. Range `[0, 1]`. |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAxis` | `boolean` | `true` | Toggle the quantitative axis line and tick labels. |
| `showLegend` | `boolean` | `false` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Anchor of the legend. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `animated` | `boolean` | `true` | Animate bars on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `xAxisFormat` | `(v: string \| number) => string` | `undefined` | Axis tick formatter (horizontal orientation). |
| `yAxisFormat` | `(v: number) => string` | `undefined` | Axis tick formatter (vertical orientation). |

### Inherited from `IChartBaseProps`

`height`, `colorScheme`, `aspectRatio`, and all dimension / margin / padding / rounded / elevation / bgColor props.

## Emits

| Event | Signature | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fired when a value bar is clicked or activated via keyboard. |
| `legend-click` | `(series: IChartSeries, index: number)` | Fired when a legend entry is clicked. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fired after a visibility flip from a legend click. |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point, series, category, bullet, delta }` | Override the default tooltip body. `delta` is `Math.round(value / target * 100)`. |
| `empty` | — | Render when `series` is empty or every series is hidden. |
| `title` | — | Replace the title + subtitle block. |
| `legend-item` | `{ series, index, visible }` | Replace one legend entry. |

## Accessibility

- Root `<div>` carries `role="figure"` and `aria-label` (defaults to `title` or `"bullet chart"`).
- Inner `<svg>` carries `role="img"` plus `<title>` and `<desc>` for screen readers.
- Each value bar (`<rect>`) has `tabindex="0"`, `role="button"`, and `aria-label` describing category / value / target / achievement %.
- Keyboard: `Enter` and `Space` fire `point-click` on the focused bar.
- Animation respects `prefers-reduced-motion: reduce`.

## Examples

### Custom tooltip with delta %

```vue
<OrigamChartBullet :series="series" :categories="categories">
  <template #tooltip="{ category, bullet, delta }">
    <div>
      <strong>{{ category }}</strong>
      <span>{{ bullet?.datum?.value }} / {{ bullet?.datum?.target }}</span>
      <span>{{ delta }}% achievement</span>
    </div>
  </template>
</OrigamChartBullet>
```

### Vertical orientation

```vue
<OrigamChartBullet
  orientation="vertical"
  :series="series"
  :categories="categories"
  :height="320"
/>
```

### Custom range per band

```vue
const series = [{
  name: 'Score',
  data: [{
    value: 72,
    target: 80,
    ranges: [
      { to: 40, color: '#ef4444' },
      { to: 65, color: '#f97316' },
      { to: 100, color: '#22c55e' }
    ]
  }]
}]
```

## Composable reference

`OrigamChartBullet` does not ship a standalone composable — all geometry is computed inside the component. Tooltip rendering is delegated to `OrigamChartTooltip` and legend to `OrigamChartLegend`.

## Browser support

SVG-only rendering — no canvas. Works in all modern browsers (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+).

## Token reference

| Token | Default | Description |
|---|---|---|
| `--origam-chart---gap` | `12px` | Gap between header / body / legend grid areas. |
| `--origam-chart---padding` | `12px` | Outer padding of the chart container. |
| `--origam-chart---background-color` | `transparent` | Container background. |
| `--origam-chart__bullet-range---opacity` | `0.55` | Opacity applied to all range bands. |
| `--origam-chart__bullet-target---stroke-width` | `3` | Width of the target tick stroke. |
| `--origam-chart__axis-label---color` | `var(--origam-color-text-secondary)` | Axis and category label colour. |
| `--origam-chart__axis-label---font-size` | `0.75rem` | Axis tick label font size. |
| `--origam-chart__axis-line---color` | `var(--origam-color-border-subtle)` | Axis baseline stroke colour. |
| `--origam-chart---animation-duration` | `600ms` | Duration of the fade-in animation. |
