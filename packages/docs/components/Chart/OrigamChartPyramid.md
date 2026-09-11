# OrigamChartPyramid

Pyramid / Funnel chart family. Renders a **single series** of N data points as N horizontal trapezoids stacked vertically, each proportional to its value relative to the maximum in the series.

Two rendering modes:

- **`type='funnel'`** — widest trapezoid at the top, narrowing downward. Classic conversion funnel shape: many visitors → fewer leads → even fewer customers.
- **`type='pyramid'`** — narrow trapezoid at the top, widening downward. Classic org-chart or hierarchy pyramid shape.

Each slice is labelled (category name + value) inside when the slice is tall enough, or beside it otherwise. The legend exposes one entry per slice (category name + colour swatch); clicking a legend entry hides that slice.

Use this component when the type is fixed at `funnel` or `pyramid`. Use `OrigamChart` with `type="funnel"` or `type="pyramid"` when you need runtime switching between chart families.

## Import

```ts
import { OrigamChartPyramid } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-pyramid
    type="funnel"
    :series="[{ name: 'Pipeline', data: [1000, 600, 200, 80, 50] }]"
    :categories="['Visitors', 'Leads', 'Prospects', 'Demos', 'Customers']"
    :height="360"
    title="Conversion funnel"
    subtitle="Q1 2026"
  />
</template>

<script setup lang="ts">
import { OrigamChartPyramid } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | The pyramid / funnel reads `series[0]` only. Each datum becomes one horizontal slice. Extra series are silently ignored. |
| `categories` | `Array<string>` | `[]` | Label for each slice. `categories[i]` maps to `series[0].data[i]`. Falls back to `data[i].x` (object form) then `Slice N`. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | `TChartPyramidKind` | `'funnel'` | `'funnel'` = widest at top; `'pyramid'` = widest at bottom. |
| `height` | `number \| string` | `360` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Palette applied when the series omits its own `color`. Each slice gets its own colour from the palette by index. Supports intent names and raw CSS values. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `sliceGap` | `number` | `4` | Gap in SVG pixels between consecutive trapezoid slices. |
| `labelPlacement` | `'inside' \| 'outside' \| 'auto'` | `'auto'` | Where to place the category + value label. `'auto'` places the label inside when the slice height ≥ 28 px, outside otherwise. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade slices in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. One of `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Applied to the value label inside / beside each slice. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Alias for `xAxisFormat` — kept for API symmetry with other families. Both are checked; `yAxisFormat` takes precedence. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a trapezoid slice. `point.x` is the category label; `point.y` is the raw value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `slice-label` | `{ category: string, value: number, formatted: string, color: string, index: number, visible: boolean }` | Replace the label rendered on or beside each slice. |
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every slice is hidden. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are ignored. For multi-series comparisons use the cartesian family (`bar`, `column`).

**Value proportions.** Each slice width is proportional to `value / max(values)`. The slice with the maximum value always fills the full available width; other slices are centred and scaled down.

**`type='funnel'` geometry.** Slot 0 always has its top edge equal to the full width. The bottom edge is proportional to `value[0]`. Slot 1's top edge equals slot 0's bottom edge, and so on. The last slot's bottom edge is proportional to `value[N-1]`. This produces smooth trapezoid cascades — no discontinuous steps.

**`type='pyramid'` geometry.** Identical logic, but each slot's top-width is proportional to its own value, and the bottom-width to the next slot's value. Slot 0 (top) is the narrowest; slot N-1 (bottom) is the widest.

**Label placement.** `labelPlacement='auto'` renders the label inside the trapezoid when the computed slice height is ≥ 28 SVG-pixels, outside (right-aligned beside the slice) when smaller. Use `'inside'` or `'outside'` to override this heuristic.

**Hidden slices.** When a legend item is toggled off, its trapezoid is removed from the SVG and the remaining slices are recomputed as if the hidden one never existed — the column re-fills without gaps. This mirrors polar's single-ring slice-hiding behaviour.

**Empty state.** When `series` is empty, every value is zero, or every slice is hidden, the `#empty` slot is rendered instead of the SVG.

**Colour inheritance.** If `series[0].color` is set, it is used as the single colour for all slices. Per-slice colours come from `colorScheme` (cycling by index) when `series[0].color` is absent. This matches the legend's per-slice entry colours.

**Accessibility.** Each trapezoid is a focusable `<path>` with `role="button"` and an `aria-label` carrying the category + formatted value. Keyboard users can Tab through slices and activate them with Enter or Space. The SVG carries a `<title>` and `<desc>` for screen-reader context.

**Animation.** Slices fade in on mount via a CSS keyframe animation. The animation is skipped when `animated=false` or `prefers-reduced-motion: reduce` is set.

**No `type` forwarding.** Unlike `OrigamChart`, this component does not accept cartesian/polar/gauge types. It only understands `'funnel'` and `'pyramid'`.

**SSR.** The SVG is rendered server-side without JS geometry. There is no `onMounted` guard — the trapezoid paths are pure computed values.

## Examples

### Minimal funnel

```vue
<template>
  <origam-chart-pyramid
    type="funnel"
    :series="[{ name: 'Sales', data: [5000, 2800, 900, 320] }]"
    :categories="['Awareness', 'Interest', 'Decision', 'Action']"
    :height="300"
  />
</template>

<script setup lang="ts">
import { OrigamChartPyramid } from '@origam/ds'
</script>
```

### Formatted values + custom colour ramp

```vue
<template>
  <origam-chart-pyramid
    type="funnel"
    :series="[{ name: 'Pipeline', data: [12400, 7200, 2100, 640, 180] }]"
    :categories="['Impressions', 'Clicks', 'Sign-ups', 'Trials', 'Paid']"
    :color-scheme="['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe']"
    :y-axis-format="(v) => v.toLocaleString()"
    :height="400"
    title="Acquisition pipeline"
    subtitle="April 2026"
  />
</template>

<script setup lang="ts">
import { OrigamChartPyramid } from '@origam/ds'
</script>
```
