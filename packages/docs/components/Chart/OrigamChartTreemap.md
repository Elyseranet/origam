# OrigamChartTreemap

Treemap chart family. Renders a single series of N data items as nested rectangles sized proportionally to their value. Used for portfolio breakdowns, budget allocation, file-system maps, and any data where comparing part-to-whole relationships matters visually.

Two layout algorithms are available:

- **`algorithm='squarified'`** (default) — Bruls / Huijse / van Wijk squarified algorithm. Produces compact, nearly-square tiles by minimising the worst-case aspect ratio.
- **`algorithm='slice-dice'`** — Alternates horizontal and vertical splits. Tiles tend to be long and thin but preserve data order faithfully.

v1 renders a **flat single-level** treemap. Nested `children` in the data shape are accepted for forward compatibility but are not rendered — drilldown is planned for v2.

## Import

```ts
import { OrigamChartTreemap } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-treemap
    :series="[{
      name: 'Tech Portfolio',
      data: [
        { name: 'AAPL', value: 25 },
        { name: 'MSFT', value: 18 },
        { name: 'GOOG', value: 14 }
      ]
    }]"
    :height="400"
    title="Portfolio breakdown"
  />
</template>

<script setup lang="ts">
import { OrigamChartTreemap } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | The treemap reads `series[0]` only. Each item in `series[0].data` becomes one tile. Extra series are silently ignored. Data items use the `{ name: string, value: number, color? }` shape. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `algorithm` | `TChartTreemapAlgorithm` | `'squarified'` | Layout algorithm. `'squarified'` = compact tiles; `'slice-dice'` = ordered strips. |
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when a tile does not pin its own `color`. Supports intent names and raw CSS values. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `showLabel` | `boolean` | `true` | Render the `name` + `value` label inside each tile when the tile is at least 60 × 24 SVG-px. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade tiles in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to the value label inside each tile and in the tooltip. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a tile. `point.x` is the tile name; `point.y` is the raw value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tile-label` | `{ name, value, formatted, color, index, visible }` | Replace the label rendered inside each tile. |
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every tile is hidden. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are ignored. For multi-series comparisons use the cartesian family.

**Data shape.** Items in `series[0].data` must follow `{ name: string, value: number, color?: TIntent | string }`. The `value` must be ≥ 0. Negative values are clamped to 0.

**Tile area is proportional.** Each tile's area is proportional to `value / sum(values)`. The total available area is the plot area minus padding (8 px on each side of the 600 × 400 SVG viewport).

**Squarified algorithm.** Sorts items descending by value, then builds rows row by row, adding each item to the current row only while it improves (or matches) the worst aspect ratio. Produces compact tiles close to square. This is the default.

**Slice-dice algorithm.** Alternates horizontal (depth=0) and vertical (depth=1) splitting. Items fill the long axis in order — rows are either horizontal bands or vertical columns. Tiles are typically long and thin but preserve the original data order.

**Label threshold.** Labels are rendered only when the tile is at least 60 × 24 SVG-px (`showLabel=true`). Small tiles (ADBE at 3% of the total with 10 items) will be too small and will not show text.

**Legend toggle.** Clicking a legend item hides that tile and re-computes the layout without it — the remaining tiles fill the viewport proportionally.

**Empty state.** When `series` is empty, all values are zero, or every tile is hidden, the `#empty` slot is rendered instead of the SVG.

**Per-tile colour override.** Each datum in `series[0].data` may carry its own `color` (intent or raw CSS). When absent, the per-datum colour cycles from `colorScheme`. When `series[0].color` is set, it overrides everything.

**Accessibility.** Each tile is a focusable `<rect>` with `role="button"` and an `aria-label` carrying the tile name + formatted value. Keyboard users can Tab through tiles and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>` for screen-reader context.

**Animation.** Tiles fade in on mount via a CSS keyframe animation. Animation is skipped when `animated=false` or `prefers-reduced-motion: reduce` is set.

**Nested children — v1 caveat.** The `IChartTreemapDatum.children` field is accepted in the type system for forward compatibility but is completely ignored at render time. Drilldown into sub-groups is planned for v2.

**SSR.** All geometry is computed as pure derived state via `computed()` — no `onMounted` guard. The SVG renders correctly server-side.

## Examples

### Budget breakdown with formatter

```vue
<template>
  <origam-chart-treemap
    :series="series"
    :y-axis-format="(v) => `${v}%`"
    :height="400"
    title="Q2 Budget allocation"
  />
</template>

<script setup lang="ts">
import { OrigamChartTreemap } from '@origam/ds'

const series = [{
  name: 'Budget',
  data: [
    { name: 'Engineering', value: 42 },
    { name: 'Marketing', value: 22 },
    { name: 'Sales', value: 18 },
    { name: 'Support', value: 11 },
    { name: 'Ops', value: 7 }
  ]
}]
</script>
```

### Custom colour per tile + custom tooltip

```vue
<template>
  <origam-chart-treemap
    :series="series"
    :height="400"
    title="Tech portfolio"
  >
    <template #tooltip="{ point, category }">
      <div class="tip">
        <strong>{{ category }}</strong>
        <span>{{ point?.y }}% of portfolio</span>
      </div>
    </template>
  </origam-chart-treemap>
</template>

<script setup lang="ts">
import { OrigamChartTreemap } from '@origam/ds'

const series = [{
  name: 'Portfolio',
  data: [
    { name: 'AAPL', value: 25, color: 'primary' },
    { name: 'MSFT', value: 18, color: 'info' },
    { name: 'GOOG', value: 14, color: 'success' }
  ]
}]
</script>
```
