# OrigamChartPareto

Pareto chart family. Combines **vertical columns sorted descending by value** with a **cumulative percentage line** overlaid on a secondary right Y-axis.

Classic use-cases: quality control, root-cause analysis, the 80/20 rule (Pareto principle).

Use this component when the type is fixed at `pareto`. Use `OrigamChart` with `type="pareto"` when you need runtime switching between chart families.

## Import

```ts
import { OrigamChartPareto } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-pareto
    :series="[{
      name: 'Defect causes',
      data: [
        { category: 'Bad welding', value: 89 },
        { category: 'Wrong size', value: 66 },
        { category: 'Loose fastener', value: 52 }
      ]
    }]"
    :height="360"
    title="Defect Causes — Pareto Analysis"
    subtitle="Sorted by frequency (descending)"
  />
</template>

<script setup lang="ts">
import { OrigamChartPareto } from '@origam/ds'
</script>
```

## Data shape

The component auto-sorts data descending by value. `series[0].data` accepts an array of `IChartParetoDatum`:

```ts
interface IChartParetoDatum {
  category: string  // X-axis label
  value: number     // raw count / amount
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `series` | `IChartSeries[]` | — | Single series; data is `IChartParetoDatum[]`. |
| `categories` | `Array<string>` | `[]` | Fallback category label per index, used when a datum's own `category` is absent — `categories[i] ?? String(i)`. |
| `title` | `string` | `undefined` | Optional title above the chart. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `barColor` | `TIntent \| string` | `'primary'` | Colour of all columns. Accepts an intent token or a raw CSS colour. |
| `lineColor` | `TIntent \| string` | `'danger'` | Colour of the cumulative line and dots. |
| `barGap` | `number` | `4` | Gap in SVG pixels between adjacent columns. |
| `showLine` | `boolean` | `true` | Toggle the cumulative percentage line and right Y-axis. |
| `showLabel` | `boolean` | `false` | Show a value label above each column. |
| `showAxis` | `boolean` | `true` | Render X and Y axes. |
| `showGrid` | `boolean` | `true` | Render horizontal grid lines. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Anchor of the legend: `'top' \| 'bottom' \| 'left' \| 'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `animated` | `boolean` | `true` | Animate bars and line on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `xAxisFormat` | `(v: string \| number) => string` | `undefined` | Formatter for X-axis category tick labels. |
| `yAxisFormat` | `(v: number) => string` | `undefined` | Formatter for the left Y-axis tick labels and above-bar labels. |
| `cumulativeFormat` | `(v: number) => string` | `v => \`${Math.round(v*100)}%\`` | Formatter for the right Y-axis (cumulative %) tick labels. |
| `colorScheme` | `(TIntent \| string)[]` | `[]` | Colour palette when `barColor` is not set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shortcut, overrides `height`. |
| `height` | `number \| string` | `360` | Chart height (px when numeric). |

### Inherited from `IChartBaseProps`

`height`, `aspectRatio`, and `colorScheme` are documented above since they
carry Pareto-specific defaults. The rest of the surface is consumed as-is:

- `bgColor` — via `useBackgroundColor`.
- `rounded` — via `useRounded`.
- `elevation` — via `useElevation`.
- `width`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` — via `useDimension`.
- `margin*`, `padding*` — via `useMargin` / `usePadding`.
- `fontSize`, `fontWeight` — via `useChartHeaderTypography` (title/subtitle only).

## Emits

| Event | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fired when a column is clicked or activated via keyboard. |
| `legend-click` | `(series: IChartSeries, index: number)` | Fired when a legend entry is clicked. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fired after a legend click flips visibility. |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point, category, value, formattedValue, share, cumulative, color }` | Replace the default tooltip body. `share` and `cumulative` are fractions (0–1). |
| `empty` | — | Rendered when `series` is empty or has no data. |
| `title` | — | Replace the title + subtitle header block. |
| `legend-item` | `{ series, index, visible }` | Replace one legend entry. |

## Geometry

1. Data is auto-sorted descending by `value`.
2. `total = Σ value[i]`.
3. `cum[i] = (Σ value[0..i]) / total` (fraction 0–1).
4. Left Y-axis: linear scale from 0 to `max(value)`.
5. Right Y-axis: linear scale from 0% to 100%.
6. Columns are `<rect>` elements filled with `barColor` (inline `:style`).
7. The cumulative line is a `<path>` connecting `(cx[i], scaleYRight(cum[i]))` points, stroked with `lineColor`.
8. Dots are `<circle>` elements on every cumulative vertex.

## Behaviour notes

- **Auto-sort** — the component sorts descending by value regardless of input order. The 80/20 line will naturally cross around the 20% mark on the X axis for a well-distributed dataset.
- **Keyboard navigation** — each column is `tabindex="0"` with `role="button"`. Enter/Space fires `point-click`.
- **Reduced motion** — when `prefers-reduced-motion: reduce` is active, all CSS animations are suppressed regardless of the `animated` prop.
- **SSR** — the component renders in a fixed `640 × 400` SVG viewBox; layout scales to the container width via `preserveAspectRatio`.

## Usage examples

### Custom tooltip showing share and cumulative

```vue
<origam-chart-pareto :series="data">
  <template #tooltip="{ category, value, share, cumulative }">
    <strong>{{ category }}</strong>
    <p>Count: {{ value }}</p>
    <p>Share: {{ Math.round(share * 100) }}%</p>
    <p>Cumulative: {{ Math.round(cumulative * 100) }}%</p>
  </template>
</origam-chart-pareto>
```

### Columns-only (no cumulative line)

```vue
<origam-chart-pareto
  :series="data"
  :show-line="false"
  bar-color="success"
/>
```

### Custom formatters

```vue
<origam-chart-pareto
  :series="data"
  :y-axis-format="(v) => v.toLocaleString()"
  :cumulative-format="(v) => `${(v * 100).toFixed(1)}%`"
/>
```
