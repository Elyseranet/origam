# OrigamChartPictorial

Pictorial / isotype chart family. Renders each data value as a **column of repeated SVG icons** — one icon represents N data units. Filled icons encode the actual value; background (empty) icons show the maximum capacity, making partial fills immediately legible.

Classic use-cases: "3 of 4 customers recommend us", demographic infographics, NPS breakdowns, star-rating distributions.

## Import

```ts
import { OrigamChartPictorial } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-pictorial
    :series="[{ name: 'Satisfaction', data: [65, 25, 10] }]"
    :categories="['Promoters', 'Passives', 'Detractors']"
    :icons-per-unit="5"
    :height="400"
    title="Customer satisfaction"
    subtitle="Q1 2026"
  />
</template>

<script setup lang="ts">
import { OrigamChartPictorial } from '@origam/ds'
</script>
```

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | One or more data series. Each series renders its own colour of filled icons side-by-side with other series per category. |
| `categories` | `Array<string>` | `[]` | X-axis labels. `categories[i]` is the label for `series[*].data[i]`. |

### Icon

| Name | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | person silhouette `d` path | SVG `<path d="…">` string. Must fit a `viewBox="0 0 24 24"` coordinate system. Use constants from `@origam/consts`: `PICTORIAL_ICON_PERSON`, `PICTORIAL_ICON_HEART`, `PICTORIAL_ICON_STAR`, `PICTORIAL_ICON_DOLLAR`. |
| `iconColor` | `TIntent \| string` | per-series cycle | Fill colour for all filled icons. Accepts an intent name or a raw CSS colour. When omitted, each series gets its own colour from `colorScheme`. |
| `emptyIconColor` | `string` | `'rgba(0,0,0,0.1)'` | Fill colour for background (not-yet-filled) icon slots. |
| `iconsPerUnit` | `number` | `1` | How many data units one icon represents. `iconsPerUnit=5` → a value of 65 renders 13 filled icons. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `direction` | `TChartPictorialDirection` | `'vertical'` | `'vertical'` stacks icons bottom-to-top (traditional column). `'horizontal'` stacks left-to-right. |
| `height` | `number \| string` | `400` | Chart height. A plain number is `px`. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Per-series fill palette when `iconColor` is not set. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `showLabel` | `boolean` | `true` | Display the raw value label above (vertical) or to the right (horizontal) of each column. |
| `showAxis` | `boolean` | `true` | Display X-axis category labels (vertical) or Y-axis row labels (horizontal). |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade icons in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `true` | Toggle the legend block. |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor: `'top'`, `'bottom'`, `'left'`, `'right'`. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `xAxisFormat` | `(value: string \| number) => string` | identity | Applied to category axis labels. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to the value label and tooltip value. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a column. `point.x` is the category label; `point.y` is the raw value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ category: string \| number, value: number, iconCount: number, color: string }` | Replace the default tooltip card. `iconCount` is the number of filled icons. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or every series is hidden. |

## Behaviour notes

**Icon geometry.** The SVG uses `<defs><symbol id="origam-chart-pictorial-icon">` + `<use href="…">` references to avoid path duplication. One `<symbol>` is emitted regardless of how many icons render.

**Slots per column.** `slotsPerColumn = Math.ceil(maxValue / iconsPerUnit)` — this is the background capacity that all columns share. Every column paints exactly `slotsPerColumn` background icons, then overlays `Math.round(value / iconsPerUnit)` filled icons on top.

**Rounding.** `Math.round` is used for filled icon count — a value of 7 with `iconsPerUnit=5` rounds to 1 filled icon (7/5 = 1.4 → 1), while a value of 8 rounds to 2 (8/5 = 1.6 → 2). The background capacity uses `Math.ceil` to ensure the column is never "over-full".

**Partial icons.** The component does NOT render partial (half-filled) icons — the granularity is controlled by `iconsPerUnit`. For finer detail, lower `iconsPerUnit`; for rougher grouping, raise it.

**Multi-series.** Multiple series render side-by-side within each category column. Each series gets its own colour from `colorScheme` (or `iconColor` if set globally).

**Horizontal mode.** When `direction='horizontal'`, icons stack left-to-right and categories become row labels on the left. The chart still fits inside the same SVG viewBox.

**Legend toggle.** Toggling a series via its legend entry hides ALL columns belonging to that series and removes them from the SVG.

**Empty state.** Rendered when `series` is empty, contains no data, or every series is hidden via legend toggle.

**Accessibility.** Each column `<g>` has `role="button"`, `tabindex="0"`, and an `aria-label` carrying `"Category: value (N of M icons)"`. Keyboard users Tab through columns and activate with Enter or Space. The SVG carries `<title>` and `<desc>` for screen-reader context.

**Animation.** Icons fade in on mount. Skipped when `animated=false` or `prefers-reduced-motion: reduce` is active.

## Named icon paths

Import from `@origam/consts`:

```ts
import {
  PICTORIAL_ICON_PERSON,  // default — human silhouette
  PICTORIAL_ICON_HEART,   // favourite / like
  PICTORIAL_ICON_STAR,    // rating
  PICTORIAL_ICON_DOLLAR   // currency / revenue
} from '@origam/consts'
```

Each constant is a `viewBox="0 0 24 24"` SVG path `d` string. Pass any path string to `icon` for custom shapes.

## Examples

### Customer satisfaction (NPS-style)

```vue
<template>
  <origam-chart-pictorial
    :series="[{ name: 'NPS', data: [65, 25, 10] }]"
    :categories="['Promoters', 'Passives', 'Detractors']"
    :icons-per-unit="5"
    :height="400"
    title="Net Promoter Score"
    subtitle="Q1 2026"
  />
</template>
```

### Star-rating distribution

```vue
<template>
  <origam-chart-pictorial
    :series="[{ name: 'Reviews', data: [4, 12, 28, 55, 78] }]"
    :categories="['★', '★★', '★★★', '★★★★', '★★★★★']"
    :icons-per-unit="10"
    :icon="PICTORIAL_ICON_STAR"
    icon-color="warning"
    :height="400"
    title="Rating breakdown"
  />
</template>

<script setup lang="ts">
import { OrigamChartPictorial } from '@origam/ds'
import { PICTORIAL_ICON_STAR } from '@origam/consts'
</script>
```

### Horizontal layout with custom tooltip

```vue
<template>
  <origam-chart-pictorial
    :series="[{ name: 'Customers', data: [65, 25, 10] }]"
    :categories="['Promoters', 'Passives', 'Detractors']"
    :icons-per-unit="5"
    direction="horizontal"
    :height="300"
    title="Satisfaction — horizontal"
  >
    <template #tooltip="{ category, value, iconCount }">
      <strong>{{ category }}</strong>
      <span>{{ value }}% — {{ iconCount }} icons</span>
    </template>
  </origam-chart-pictorial>
</template>
```
