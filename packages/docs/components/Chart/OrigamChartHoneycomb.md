# OrigamChartHoneycomb

Hexagonal tile-map chart family. Renders a **single series** of data points as hexagonal `<polygon>` tiles positioned by column (`x`) and row (`y`) index in a two-dimensional grid.

Typical use cases: US-state tile-maps, periodic-table views, categorical tile-maps, geographic heat grids, skill matrices.

Two orientation modes:
- **`orientation='pointy-top'`** (default) — vertex at the top; odd rows offset half a hex-width to the right.
- **`orientation='flat-top'`** — flat edge on top; odd columns offset half a hex-height downward.

Two colour modes:
- **`colorMode='categorical'`** — each tile uses the `colorScheme` palette cycling by data index (or an explicit `color` per datum).
- **`colorMode='heatmap'`** — tile colour interpolates between the two `heatmapColorRange` endpoints using `color-mix(in srgb, …)` — value at min = start colour, value at max = end colour.

Use this component when you need the tightly-typed hexagonal API directly. Use `OrigamChart` with `type="honeycomb"` for runtime switching between chart families.

## Import

```ts
import { OrigamChartHoneycomb } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-honeycomb
    :series="[{
      name: 'Grid',
      data: [
        { x: 0, y: 0, name: 'A1', color: 'primary' },
        { x: 1, y: 0, name: 'A2', color: 'success' },
        { x: 0, y: 1, name: 'B1', color: 'warning' },
        { x: 1, y: 1, name: 'B2', color: 'danger' }
      ]
    }]"
    :height="300"
    title="Hex tile grid"
  />
</template>

<script setup lang="ts">
import { OrigamChartHoneycomb } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Only `series[0]` is consumed. Data entries must be objects with `x` (column index) and `y` (row index). Optional `name`, `value`, and `color` fields per entry. |

Each data entry shape (inside `series[0].data`):

| Field | Type | Required | Description |
|---|---|---|---|
| `x` | `number` | yes | Column index in the hex grid (integer ≥ 0). |
| `y` | `number` | yes | Row index in the hex grid (integer ≥ 0). |
| `value` | `number` | no | Numeric value — drives heatmap colour interpolation and appears in tooltips. |
| `name` | `string` | no | Label rendered inside the tile (falls back to formatted `value` when absent). |
| `color` | `TIntent \| string` | no | Per-tile colour override (intent token or raw CSS). When set, bypasses `colorScheme` and `colorMode`. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `orientation` | `TChartHoneycombOrientation` | `'pointy-top'` | Vertex-at-top (`'pointy-top'`) or flat-edge-at-top (`'flat-top'`). |
| `colorMode` | `TChartHoneycombColorMode` | `'categorical'` | `'categorical'` cycles the palette by tile index; `'heatmap'` interpolates between `heatmapColorRange` endpoints using the tile's `value`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied in `categorical` mode when a tile has no explicit `color`. Accepts intent names and raw CSS values. |
| `heatmapColorRange` | `[TIntent \| string, TIntent \| string]` | `['info', 'danger']` | Two-stop gradient for `heatmap` mode. First entry = min-value colour; second = max-value colour. |
| `tileSize` | `number` | `30` | Hex side-length in SVG user units. Increasing this grows every tile. |
| `tileGap` | `number` | `2` | Gap between adjacent tile edges in SVG user units. |
| `showLabel` | `boolean` | `true` | Render the tile label (`name` or formatted `value`) centred in each tile. |
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

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
| `xAxisFormat` | `(value: number \| string) => string` | `String(value)` | Applied to the `x` (column index) in tooltip and accessibility text. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to the `value` field in tooltips. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a tile. `point.x` = grid column, `point.y` = grid row. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tile-label` | `{ name: string, value: number \| undefined, color: string, x: number, y: number, index: number }` | Replace the label rendered inside each tile. |
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or has no data. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are ignored. Supply data with `{ x, y }` grid coordinates instead of a flat array.

**Geometry.** Tiles are placed by their `(x, y)` integer grid coordinates; gaps in the coordinate space are rendered as empty space. The SVG viewBox auto-expands to fit all tiles with a small padding margin. There are no fixed axis labels — all context is conveyed through tile labels, tooltips, and the legend.

**`pointy-top` layout.** Tile width = `√3 × tileSize`, height = `2 × tileSize`. Vertical row spacing = `1.5 × tileSize + tileGap`. Odd-numbered rows are offset horizontally by half a tile width.

**`flat-top` layout.** Tile width = `2 × tileSize`, height = `√3 × tileSize`. Horizontal column spacing = `1.5 × tileSize + tileGap`. Odd-numbered columns are offset vertically by half a tile height.

**Heatmap colour.** Computed via `color-mix(in srgb, <end> <pct>%, <start>)` where `<pct>` is the linear interpolation of `value` between `min(values)` and `max(values)`. Both endpoints accept intent tokens (resolved via `intentBgExpr`) or raw CSS colour strings.

**Categorical legend.** One entry per tile in the data array. When tile `name` fields are unique (state codes, element symbols), this gives an immediately scannable legend. For large grids, consider hiding the legend and relying on tile labels.

**Heatmap legend.** Two entries are shown: the min-value colour labelled with the minimum `value`, and the max-value colour labelled with the maximum `value`. A gradient bar is not rendered by the current legend engine.

**Empty state.** When `series` is empty or `series[0].data` is empty, the `#empty` slot is rendered instead of the SVG.

**Accessibility.** Each tile is a focusable `<polygon>` with `role="button"` and an `aria-label` carrying the tile name and optional value. Keyboard users can Tab through tiles and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>` for screen-reader context.

**Animation.** Tiles fade in on mount via a CSS keyframe animation. The animation is skipped when `animated=false` or `prefers-reduced-motion: reduce` is detected.

**SSR.** Tile geometry is computed from pure data — no DOM measurements are needed. The SVG renders server-side without an `onMounted` guard.

## Examples

### US-state tile-map (categorical)

```vue
<template>
  <origam-chart-honeycomb
    :series="[{
      name: 'States',
      data: [
        { x: 0, y: 0, name: 'WA', color: 'primary' },
        { x: 1, y: 0, name: 'MT', color: 'secondary' },
        { x: 0, y: 1, name: 'OR', color: 'success' },
        { x: 1, y: 1, name: 'ID', color: 'warning' },
        { x: 0, y: 2, name: 'CA', color: 'danger' }
      ]
    }]"
    orientation="pointy-top"
    color-mode="categorical"
    :tile-size="36"
    :tile-gap="3"
    :height="400"
    title="US west coast states"
  />
</template>

<script setup lang="ts">
import { OrigamChartHoneycomb } from '@origam/ds'
</script>
```

### Population heatmap

```vue
<template>
  <origam-chart-honeycomb
    :series="[{
      name: 'Population (M)',
      data: [
        { x: 0, y: 0, name: 'CA', value: 39.5 },
        { x: 1, y: 0, name: 'TX', value: 29.0 },
        { x: 2, y: 0, name: 'FL', value: 21.5 },
        { x: 0, y: 1, name: 'NY', value: 19.5 },
        { x: 1, y: 1, name: 'PA', value: 13.0 },
        { x: 2, y: 1, name: 'IL', value: 12.7 }
      ]
    }]"
    orientation="pointy-top"
    color-mode="heatmap"
    :heatmap-color-range="['info', 'danger']"
    :tile-size="40"
    :show-label="true"
    :height="360"
    title="State population heatmap"
    :y-axis-format="(v) => v.toFixed(1) + 'M'"
  />
</template>

<script setup lang="ts">
import { OrigamChartHoneycomb } from '@origam/ds'
</script>
```
