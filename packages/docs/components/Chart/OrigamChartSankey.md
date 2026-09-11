# OrigamChartSankey

Sankey diagram family. Visualises **flows between categories** — energy budgets, revenue funnels, web-traffic paths.

Nodes are inferred automatically from the union of all `from` and `to` strings found in `series[0].data`. Columns are assigned by topological depth (Kahn's algorithm). Flows are rendered as smooth cubic Bezier ribbons whose stroke width is proportional to the flow value.

Use this component when you need to visualise magnitude flows between categorical nodes. Use `OrigamChart` with `type="sankey"` when you need runtime switching between chart families.

## Import

```ts
import { OrigamChartSankey } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-sankey
    :series="[{
      name: 'Web funnel',
      data: [
        { from: 'Home', to: 'Catalogue', value: 100 },
        { from: 'Catalogue', to: 'Cart', value: 40 },
        { from: 'Catalogue', to: 'Exit', value: 60 },
        { from: 'Cart', to: 'Checkout', value: 25 },
        { from: 'Checkout', to: 'Success', value: 20 }
      ]
    }]"
    :height="400"
    title="Web funnel"
  />
</template>

<script setup lang="ts">
import { OrigamChartSankey } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | The Sankey chart reads `series[0]` only. Each datum in `series[0].data` must be `IChartSankeyDatum` — a `{ from, to, value }` triple. Nodes are inferred from the union of all `from` and `to` strings. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied per column index. Nodes in column 0 get colour 0, column 1 gets colour 1, etc. Supports intent names and raw CSS values. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `nodeWidth` | `number` | `16` | Width of each node rectangle in SVG pixels. |
| `nodePadding` | `number` | `8` | Minimum vertical gap between sibling nodes in the same column, in SVG pixels. |
| `linkOpacity` | `number` | `0.4` | Opacity of the flow ribbons. Range `[0, 1]`. |
| `showLabel` | `boolean` | `true` | Whether to render node name labels. Left-column nodes are right-aligned outside their rect; all other columns are left-aligned outside. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade nodes and links in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `false` | Toggle the legend block. Off by default — Sankey diagrams use node labels instead. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: number \| string) => string` | `String(value)` | Applied to node labels and tooltip values. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Alias for `xAxisFormat` — kept for API symmetry with other families. `yAxisFormat` takes precedence. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a **node** or a **link**. For nodes `point.x` is the node name; for links `point.x` is `"from → to"`. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `node-label` | `{ name: string, value: number, formatted: string, color: string, column: number }` | Replace the label rendered beside each node. |
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or no nodes could be derived. |

## Data shape (`IChartSankeyDatum`)

```ts
interface IChartSankeyDatum {
  from: string         // Source node name
  to: string           // Target node name
  value: number        // Flow magnitude (≥ 0)
  color?: TIntent | string  // Optional per-link colour override
}
```

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are ignored.

**Node inference.** Nodes are derived from the union of all `from` and `to` strings. You do not declare nodes separately — just provide the links.

**Column assignment.** Columns are assigned via Kahn's topological sort algorithm. Each node's column = max column of its predecessors + 1. Source nodes (no incoming links) land in column 0.

**Cycle detection.** If the data contains a directed cycle, the component logs a console warning and renders the reachable acyclic portion. It does not throw.

**Node values.** Each node's height is proportional to `max(sum of incoming links, sum of outgoing links)` within its column.

**Link ribbons.** Each link is rendered as a cubic Bezier `<path>` from `(x_source_right, y_source_band_mid)` to `(x_target_left, y_target_band_mid)`. Stroke width is proportional to the link value relative to the source node's total outgoing flow. Stroke colour defaults to the source node's colour; override per-link via `datum.color`.

**Node labels.** Left-column nodes (column 0) render their label right-aligned to the left of the node rect. All other nodes render left-aligned to the right. Set `showLabel=false` to suppress labels entirely.

**Empty state.** When `series` is empty or no nodes can be inferred, the `#empty` slot is rendered instead of the SVG.

**Accessibility.** Each node `<rect>` and each link `<path>` carries `tabindex="0"`, `role="button"`, and a descriptive `aria-label`. Keyboard users can Tab through all interactive elements and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>` for screen-reader context.

**Animation.** Nodes and links fade in on mount via a CSS keyframe animation. The animation is skipped when `animated=false` or `prefers-reduced-motion: reduce` is set.

**SSR.** The SVG is rendered server-side without JS geometry. There is no `onMounted` guard — the node and link geometry are pure computed values.

## Examples

### Energy budget

```vue
<template>
  <origam-chart-sankey
    :series="[{
      name: 'Energy budget',
      data: [
        { from: 'Solar', to: 'Grid', value: 30 },
        { from: 'Wind', to: 'Grid', value: 25 },
        { from: 'Nuclear', to: 'Grid', value: 20 },
        { from: 'Grid', to: 'Residential', value: 35 },
        { from: 'Grid', to: 'Industrial', value: 25 },
        { from: 'Grid', to: 'Commercial', value: 15 }
      ]
    }]"
    :height="400"
    title="Energy budget"
    subtitle="GWh"
  />
</template>
```

### Custom colour ramp + formatted values

```vue
<template>
  <origam-chart-sankey
    :series="[{
      name: 'Revenue funnel',
      data: [
        { from: 'Leads', to: 'Prospects', value: 5000 },
        { from: 'Prospects', to: 'Demos', value: 1200 },
        { from: 'Demos', to: 'Customers', value: 320 }
      ]
    }]"
    :color-scheme="['#6366f1', '#8b5cf6', '#ec4899']"
    :y-axis-format="(v) => v.toLocaleString()"
    :height="360"
    title="Revenue funnel"
    subtitle="Q2 2026"
  />
</template>
```
