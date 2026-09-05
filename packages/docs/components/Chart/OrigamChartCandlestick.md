# OrigamChartCandlestick

Financial OHLC candlestick chart. Renders one candle per datum: a rectangular **body** between `open` and `close`, and a thin **wick** from `low` to `high`.

- **Bullish** candle (close ≥ open): body filled with `bullishColor` (default `'success'`).
- **Bearish** candle (close < open): body filled with `bearishColor` (default `'danger'`).

The Y axis auto-scales to `min(low) / max(high)` with 5 % padding, or is overridden via `yMin` / `yMax`.

Use this component when the chart type is fixed at `candlestick`. Use `OrigamChart` with `type="candlestick"` when you need runtime switching between chart families.

## Import

```ts
import { OrigamChartCandlestick } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-candlestick
    :series="[{
      name: 'AAPL',
      data: [
        { date: 'May 1', open: 150.20, high: 153.80, low: 149.50, close: 152.90 },
        { date: 'May 2', open: 152.90, high: 155.40, low: 151.20, close: 151.60 }
      ]
    }]"
    :height="400"
    title="AAPL — candlestick"
  />
</template>

<script setup lang="ts">
import { OrigamChartCandlestick } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Only `series[0]` is read. Each datum must be an `IChartCandlestickDatum` with `date`, `open`, `high`, `low`, `close`. Datums missing any of those fields are silently skipped. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `title` | `string` | `undefined` | Optional title above the chart. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `bullishColor` | `TIntent \| string` | `'success'` | Fill colour for candles where close ≥ open. Accepts an origam intent or any CSS colour string. |
| `bearishColor` | `TIntent \| string` | `'danger'` | Fill colour for candles where close < open. |
| `candleWidth` | `number` | `0.6` | Fraction of the per-slot width occupied by the body rectangle `[0..1]`. |
| `wickWidth` | `number` | `1` | Wick stroke width in SVG user-units. |
| `colorScheme` | `Array<TIntent \| string>` | ⛔ **Sans effet sur ce composant** — candle colour is binary (bullishColor / bearishColor) — there is no per-series identity for a rotating palette to drive. La prop reste declaree (elle est heritee d'`IChartBaseProps`) et emet un avertissement de developpement si elle est passee. Voir #426. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade candles in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `false` | Show the legend block. Candlestick charts rarely need one — default is `false`. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Where to anchor the legend: `'top' \| 'bottom' \| 'left' \| 'right'`. |
| `showTooltip` | `boolean` | `true` | Show the hover tooltip. |
| `showGrid` | `boolean` | `true` | Render horizontal Y-axis grid lines. |
| `showAxis` | `boolean` | `true` | Render X / Y axis labels. |

### Scale

| Name | Type | Default | Description |
|---|---|---|---|
| `yMin` | `number` | `undefined` | Override the auto-computed Y axis minimum. |
| `yMax` | `number` | `undefined` | Override the auto-computed Y axis maximum. |
| `xAxisFormat` | `(value: string \| number) => string` | `undefined` | Formatter applied to X-axis (date) labels. |
| `yAxisFormat` | `(value: number) => string` | `undefined` | Formatter applied to Y-axis (price) labels. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fires when a candle is activated by mouse click or keyboard Enter/Space. `point.x` = datum date, `point.y` = close price. |
| `legend-click` | `(series: IChartSeries, index: number)` | Fires on a legend entry click. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fires on a legend entry toggle with the resulting visibility. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `title` | — | Replace the default title / subtitle block entirely. |
| `tooltip` | `{ point, series, category, datum, change, changePct, isBullish }` | Replace the default tooltip card. `datum` is the full `IChartCandlestickDatum`; `change` is `close - open`; `changePct` is `(close - open) / open * 100`. |
| `legend-item` | `{ series, index, visible }` | Replace one legend row. |
| `empty` | — | Rendered when `series` is empty or contains no valid OHLC datums. |

## Data shape — `IChartCandlestickDatum`

```ts
interface IChartCandlestickDatum {
  date: string   // ISO date or any label rendered on the X axis
  open: number
  high: number
  low: number
  close: number
}
```

All four price fields are required. Pass them inside `series[0].data`:

```ts
const series = [{
  name: 'AAPL',
  data: [
    { date: '2026-05-01', open: 150.20, high: 153.80, low: 149.50, close: 152.90 },
    { date: '2026-05-02', open: 152.90, high: 155.40, low: 151.20, close: 151.60 }
  ]
}]
```

## Accessibility

- Root element carries `role="figure"` with an `aria-label` derived from `title` (or `'candlestick chart'`).
- The SVG carries `role="img"`, an inline `<title>`, and a `<desc>` that summarises candle count.
- Each candle `<g>` carries `role="button"`, `tabindex="0"`, and an `aria-label` describing date, direction, and all four OHLC values.
- Keyboard navigation: `Tab` to focus a candle; `Enter` or `Space` to fire `point-click`.
- CSS animation respects `prefers-reduced-motion: reduce`.

## Caveats

- **`colorScheme` has no effect** (#426). It's inherited from `IChartBaseProps` and stays on the public API for consistency across chart types, but candle colour is a binary bullish/bearish choice — there's no per-series identity for a rotating palette to drive. Passing it logs `[origam] <OrigamChartCandlestick> prop "colorScheme" has no effect on this component: …` once to the console in dev builds (silent in production). Neither wiring a fake behaviour nor removing the prop was on the table — see the #426 decision.
- **Volume bars** are not rendered — this is a price-only OHLC view. A `volumeSeries` prop is planned for a future minor release.
- **HLC variant** (no body, wick only) is not yet implemented. Use `candleWidth: 0` as a workaround — the body collapses to 1 px high.
- Only `series[0]` is consumed. Multi-series overlay (e.g. comparison stocks) is not yet supported.
- X-axis labels are thinned automatically when more than 10 candles are visible to avoid overlap.

## Examples

### Custom tooltip showing change %

```vue
<origam-chart-candlestick :series="series" :height="400">
  <template #tooltip="{ datum, change, changePct, isBullish }">
    <div :style="{ color: isBullish ? 'green' : 'red' }">
      {{ datum.date }}: {{ change > 0 ? '+' : '' }}{{ changePct.toFixed(2) }}%
    </div>
  </template>
</origam-chart-candlestick>
```

### Custom empty state

```vue
<origam-chart-candlestick :series="[]" :height="320">
  <template #empty>
    <div>No market data — connect a data source.</div>
  </template>
</origam-chart-candlestick>
```
