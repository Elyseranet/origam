# OrigamChartSunburst

Hierarchical multi-level donut chart. Renders a recursive tree as concentric arc rings: each depth level becomes a ring, and each node occupies an angular sector proportional to its value within its parent's span.

Use cases: filesystem breakdowns, taxonomy hierarchies, budget allocation with sub-categories.

## Import

```ts
import { OrigamChartSunburst } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-sunburst
    :series="[{ name: 'Budget', data: budgetTree }]"
    :height="400"
    title="Budget Breakdown"
    subtitle="Q1 2026"
  />
</template>

<script setup lang="ts">
import { OrigamChartSunburst } from '@origam/ds'
import type { IChartSunburstDatum } from '@origam/ds'

const budgetTree: Array<IChartSunburstDatum> = [
  {
    name: 'Engineering', value: 50,
    children: [
      { name: 'Frontend', value: 20 },
      { name: 'Backend', value: 20 },
      { name: 'DevOps', value: 10 }
    ]
  },
  { name: 'Marketing', value: 30 },
  { name: 'Sales', value: 20 }
]
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Reads `series[0].data` as `Array<IChartSunburstDatum>`. Extra series are ignored. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `undefined` | Optional title above the chart. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `innerRadius` | `number` | `0.15` | Proportion of the overall radius reserved for the centre hole. `0` = full pie. `0.4` = deep donut. |
| `ringPadding` | `number` | `1` | Radial gap in SVG pixels between consecutive depth rings. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied to root nodes. Children inherit and lighten via `color-mix`. |
| `showLabel` | `boolean` | `true` | Render arc name labels when angular span ≥ 0.1 rad. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade arcs in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block (root nodes only). |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to values in tooltips and ARIA labels. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on an arc. `point.x` is the node name; `point.y` is the resolved value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. Hiding a root hides its entire subtree. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point, series, category, node: IChartSunburstNode, path: string }` | Replace the default tooltip card. `path` is `"Root > Branch > Leaf"`. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every root is hidden. |

## Data shape

```ts
interface IChartSunburstDatum {
  name: string
  value?: number       // optional for internal nodes; computed from children if absent
  color?: TIntent | string
  children?: Array<IChartSunburstDatum>
}
```

Pass `series[0].data` as `Array<IChartSunburstDatum>`.

## Behaviour notes

**Depth cap.** A maximum of 4 depth levels are rendered. Nodes deeper than 4 are silently ignored.

**Value inference.** If an internal node omits `value`, it is computed as the sum of its children's resolved values recursively. Leaf nodes with no `value` contribute `0`.

**Colour lightening.** Child arcs inherit the root colour lightened by `depth × 15%` via `color-mix(in srgb, <parent> calc(100% - N%), white)`. Capped at depth 4 (60% lightening).

**Legend.** Shows root-level nodes only. Clicking a legend entry toggles the entire subtree.

**Labels.** Arc labels are only rendered when the angular span of the node is ≥ 0.1 rad (~5.7°). This prevents overlapping text on thin slices.

**Empty state.** When `series` is empty or every root is hidden, the `#empty` slot is rendered.

**Accessibility.** Each arc is a focusable `<path>` with `role="button"` and an `aria-label` in the form `"Root > Branch: value"`. Keyboard users can Tab through arcs and activate with Enter or Space. The SVG carries a `<title>` and `<desc>`.

**Animation.** Arcs fade in on mount. Skipped when `animated=false` or `prefers-reduced-motion: reduce`.

## Examples

### Filesystem breakdown

```vue
<template>
  <origam-chart-sunburst
    :series="[{ name: 'Filesystem', data: fsTree }]"
    :height="400"
    :inner-radius="0.2"
    title="Repository structure"
  />
</template>

<script setup lang="ts">
import { OrigamChartSunburst } from '@origam/ds'
import type { IChartSunburstDatum } from '@origam/ds'

const fsTree: Array<IChartSunburstDatum> = [
  {
    name: 'src', value: 1200,
    children: [
      { name: 'components', value: 500 },
      { name: 'composables', value: 300 },
      { name: 'utils', value: 200 },
      { name: 'types', value: 200 }
    ]
  },
  {
    name: 'tests', value: 400,
    children: [
      { name: 'unit', value: 250 },
      { name: 'e2e', value: 150 }
    ]
  },
  { name: 'docs', value: 100 }
]
</script>
```

### Custom tooltip showing full path

```vue
<template>
  <origam-chart-sunburst
    :series="[{ name: 'Budget', data: tree }]"
    :height="400"
  >
    <template #tooltip="{ path, point }">
      <div style="padding: 8px">
        <strong>{{ path }}</strong><br>
        {{ point?.y?.toLocaleString() }}
      </div>
    </template>
  </origam-chart-sunburst>
</template>
```
