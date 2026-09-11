# OrigamChartWordCloud

Word cloud chart family. Renders a **single series** of text/value pairs as SVG `<text>` elements sized by frequency and arranged without overlap using an Archimedean spiral placement algorithm.

Words with higher `value` are rendered larger. The layout engine places words from largest to smallest, starting at the canvas centre and spiralling outward until a collision-free position is found.

Use this component to visualise text frequency distributions — keyword popularity, customer feedback themes, log tag clouds, etc.

## Import

```ts
import { OrigamChartWordCloud } from '@origam/ds'
```

## Quick start

```vue
<template>
  <origam-chart-word-cloud
    :series="[{
      name: 'Tech Buzzwords',
      data: [
        { text: 'AI', value: 100 },
        { text: 'Cloud', value: 80 },
        { text: 'TypeScript', value: 60 }
      ]
    }]"
    :height="400"
    title="Tech Buzzwords"
  />
</template>

<script setup lang="ts">
import { OrigamChartWordCloud } from '@origam/ds'
</script>
```

## Data shape

The component reads `series[0]` only. Each entry in `series[0].data` must be an object `{ text: string, value: number, color?: TIntent | string }`:

```ts
type WordDatum = {
  text: string    // displayed word
  value: number   // drives font size (must be > 0)
  color?: string  // optional per-word colour override (intent or CSS)
}
```

Plain number entries in `data` are ignored — use the object form exclusively.

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Reads `series[0]` only. Each datum must be `{ text, value, color? }`. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `height` | `number \| string` | `400` | Chart height in px or any CSS length. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand. Overrides `height`. |
| `minFontSize` | `number` | `12` | Font size (px) applied to the word with the lowest value. |
| `maxFontSize` | `number` | `64` | Font size (px) applied to the word with the highest value. |
| `rotation` | `TChartWordCloudRotation` | `'none'` | Word rotation strategy. See below. |
| `fontFamily` | `string` | `'inherit'` | Font family for all words. Defaults to the host page's typeface. |
| `fontWeight` | `number \| string` | `600` | Font weight for all words. |
| `colorScheme` | `Array<TIntent \| string>` | 8-intent cycle | Colour palette cycling by word index when neither the datum nor the series provides a colour. |
| `title` | `string` | `undefined` | Optional chart title. Replaceable via the `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |

### Rotation modes

| Value | Behaviour |
|---|---|
| `'none'` | All words are horizontal (0°). Default. |
| `'random'` | Each word gets a uniform random angle in [-30°, 30°] (pseudo-random, seeded by index for determinism). |
| `'orthogonal'` | Words alternate between 0° (even index) and 90° (odd index). |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `animated` | `boolean` | `true` | Fade words in on first paint. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `showLegend` | `boolean` | `false` | Toggle the legend block. Off by default (word clouds rarely need one). |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Legend anchor. |
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |

### Formatting

| Name | Type | Default | Description |
|---|---|---|---|
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Applied to the value in the tooltip. |
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Alias for API symmetry; `yAxisFormat` takes precedence. |

## Emits

| Name | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Click or keyboard activation on a word. `point.x` is the word text; `point.y` is the raw value. |
| `legend-click` | `(series: IChartSeries, index: number)` | Click on a legend entry. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Resulting visibility flip after a legend click. |

## Slots

| Name | Bindings | Description |
|---|---|---|
| `tooltip` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replace the default tooltip card. |
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. |
| `title` | — | Replace the title + subtitle block. |
| `empty` | — | Rendered when `series` is empty or contains no valid word data. |

## Behaviour notes

**Single-series only.** The component reads `series[0]` exclusively. Extra series are silently ignored.

**Font-size mapping.** Word font sizes are linearly interpolated between `minFontSize` and `maxFontSize` based on each word's value relative to the maximum in the series.

**Placement algorithm.** An Archimedean spiral (`r = a × θ`) is used to find collision-free positions. The largest word is placed at the canvas centre; subsequent words walk the spiral until no AABB overlap is detected. Words that cannot be placed within 1 000 iterations are skipped with a `console.warn`.

**Bounding-box heuristic (v1 caveat).** Collision detection uses an estimated width of `text.length × fontSize × 0.6`. This can produce visual overlaps for narrow characters (e.g. `i`, `l`, `1`) or wide ones (e.g. `W`, `M`). Accurate measurement requires `getBBox()` deferred to `onMounted` — planned for v2.

**Colour inheritance.** Per-datum `color` takes precedence, then `series[0].color`, then `colorScheme` cycling by index.

**Empty state.** When `series` is empty, data contains no valid word objects, or placement fails for every word, the `#empty` slot is rendered.

**Accessibility.** Each `<text>` element carries `role="button"`, `tabindex="0"`, and an `aria-label` combining the word and its formatted value. Keyboard users can Tab through words and activate them with Enter or Space. The SVG carries `<title>` and `<desc>` for screen-reader context.

**Animation.** Words fade in on mount via a CSS keyframe. The animation is skipped when `animated=false` or `prefers-reduced-motion: reduce` is active.

**SSR note.** Font-size and spiral placement are computed in a `computed()` — fully SSR-safe. No `onMounted` guard is required for the current bbox-heuristic path.

## Examples

### Customer feedback word cloud

```vue
<template>
  <origam-chart-word-cloud
    :series="[{
      name: 'Customer Feedback',
      data: [
        { text: 'Fast', value: 50 },
        { text: 'Reliable', value: 45 },
        { text: 'Beautiful', value: 28 },
        { text: 'Intuitive', value: 32 }
      ]
    }]"
    :height="360"
    rotation="orthogonal"
    title="Customer sentiment"
    subtitle="Q1 2026 NPS survey"
  />
</template>

<script setup lang="ts">
import { OrigamChartWordCloud } from '@origam/ds'
</script>
```

### Custom colour scheme + value formatter in tooltip

```vue
<template>
  <origam-chart-word-cloud
    :series="series"
    :color-scheme="['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#7c3aed']"
    :y-axis-format="(v) => v.toLocaleString() + ' mentions'"
    :height="400"
    title="Keyword cloud"
  />
</template>

<script setup lang="ts">
import { OrigamChartWordCloud } from '@origam/ds'

const series = [{ name: 'Keywords', data: [
  { text: 'Design', value: 200 },
  { text: 'System', value: 180 },
  { text: 'Token', value: 150 }
]}]
</script>
```
