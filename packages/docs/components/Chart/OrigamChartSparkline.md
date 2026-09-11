# OrigamChartSparkline

A tiny inline chart for table cells, KPI cards, and dashboards. Renders a single numeric series as a compact visualization with no axes, no legend, and no grid.

## Quick start

```vue
<OrigamChartSparkline
  :series="[{ name: 'Sales', data: [18, 22, 19, 25, 32, 28, 33, 30, 36, 39, 42, 45] }]"
  type="line"
  color="primary"
  :width="120"
  :height="30"
/>
```

## Props

### Visual

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `TChartSparklineKind` | `'line'` | Rendering mode: `'line'`, `'area'`, `'column'`, `'bar'` |
| `color` | `TIntent \| string` | `'primary'` | Stroke / fill colour — intent token or raw CSS |
| `lineWidth` | `number` | `1.5` | Stroke width (SVG pixels) — line and area only |
| `width` | `number \| string` | `120` | Container width in px or CSS string |
| `height` | `number \| string` | `30` | Container height in px or CSS string |

### Markers

| Prop | Type | Default | Description |
|---|---|---|---|
| `showMarkers` | `boolean` | `false` | Show a filled circle at every data point |
| `showMin` | `boolean` | `false` | Highlight the minimum value in red |
| `showMax` | `boolean` | `false` | Highlight the maximum value in green |
| `showLast` | `boolean` | `true` | Highlight the last data point in the series colour |
| `markerSize` | `number` | `2.5` | Radius of highlighted marker circles (SVG pixels) |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Single data series. Data must be `Array<number>` |
| `showTooltip` | `boolean` | `false` | Enable a minimal value tooltip on hover |
| `animated` | `boolean` | `false` | Animate on paint (respects `prefers-reduced-motion`) |
| `animationDuration` | `number` | `600` | Animation duration in ms |

### Layout (inherited from `IChartBaseProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `margin` | `TMargin` | — | Outer spacing |
| `padding` | `TPadding` | — | Inner spacing |
| `rounded` | `TRounded` | — | Border radius token |
| `elevation` | `TElevation` | — | Shadow token |
| `bgColor` | `TIntent \| string` | — | Background colour |
| `title` | `string` | — | ARIA label / accessible title for the chart |
| `aspectRatio` | `string` | — | CSS `aspect-ratio` shortcut |

## Emits

| Event | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fired when a data point is activated (reserved for future interactive variant) |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, index: number }` | Replace the default hover tooltip body |
| `empty` | — | Render when `series` is empty or contains no numeric data |

## Types

```ts
type TChartSparklineKind = 'line' | 'area' | 'column' | 'bar'
```

Defined in `src/types/Chart/chart-sparkline-kind.type.ts`.

## Rendering modes

| Mode | Shape | Use case |
|---|---|---|
| `line` | Polyline connecting data points | Trend over time |
| `area` | Line with translucent fill below | Emphasise volume |
| `column` | Vertical bars proportional to value | Discrete periods |
| `bar` | Horizontal bars proportional to value | Ranked comparison |

## Colour behaviour

Unlike full chart families, sparklines use a **single `color` prop** — no palette cycling. Passing a `TIntent` (`'primary'`, `'success'`, `'danger'`, …) resolves to the matching design token. Raw CSS strings pass through untouched.

Special markers (`showMin`, `showMax`) override the colour locally:
- Min → `feedback.danger.bg` token (red)
- Max → `feedback.success.bg` token (green)
- Last → same as the series `color`

## Accessibility

The component uses a `<figure>` root (semantic landmark for a self-contained chart), an SVG with `role="img"`, `aria-label`, `<title>`, and `<desc>` for screen reader support.

## Usage examples

### Embedding in a table

```vue
<table>
  <tbody>
    <tr v-for="row in data" :key="row.id">
      <td>{{ row.name }}</td>
      <td>{{ row.latestValue }}</td>
      <td>
        <OrigamChartSparkline
          type="line"
          :series="[{ name: row.name, data: row.history }]"
          :color="row.trend >= 0 ? 'success' : 'danger'"
          :width="100"
          :height="28"
          :show-last="true"
        />
      </td>
    </tr>
  </tbody>
</table>
```

### KPI card with area sparkline

```vue
<div class="kpi-card">
  <span class="kpi-value">$42,500</span>
  <OrigamChartSparkline
    type="area"
    :series="[{ name: 'Revenue', data: monthlyRevenue }]"
    color="success"
    :show-max="true"
    :show-last="true"
    :width="160"
    :height="40"
  />
</div>
```

### With custom tooltip slot

```vue
<OrigamChartSparkline
  type="line"
  :series="[{ name: 'Price', data: prices }]"
  :show-tooltip="true"
  :width="200"
  :height="48"
>
  <template #tooltip="{ point, index }">
    <div>
      <strong>Day {{ index + 1 }}</strong>
      <span>${{ point.y.toLocaleString() }}</span>
    </div>
  </template>
</OrigamChartSparkline>
```

## Caveats

- Only the **first** entry of the `series` array is rendered. Multi-series is not supported — use `<OrigamChartCartesian>` for that.
- Data must be `Array<number>`. Object-form entries (`{ x, y }`) are accepted and the `y` value is extracted, but the `x` is ignored (no X axis).
- `animated` defaults to `false` — animation on such small surfaces is typically distracting. Set `true` if the consumer explicitly wants it.
- The tooltip (`showTooltip`) tracks the nearest column index by horizontal proximity; it does not snap to the exact SVG circle — this is intentional for the tiny surface area.
