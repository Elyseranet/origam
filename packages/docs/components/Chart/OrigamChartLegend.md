# OrigamChartLegend

Series-name + colour-swatch + visibility-toggle list shared by every chart
family in the origam DS (`<OrigamChartCartesian>`, `<OrigamChartPolar>`,
`<OrigamChartRadar>`, `<OrigamChartGauge>`). Extracted from the legacy
all-in-one `<OrigamChart>` so the same markup, keyboard behaviour and
slot API back every family.

`<OrigamChartLegend>` is a pure renderer: it expects a
pre-resolved `IChartLegendItem[]` array (one entry per series) and emits
clicks back upward. The actual visibility state lives in the parent
chart shell (which clones each series with a `visible` flag derived from
its hidden-set), so a click on a legend item flips the corresponding
series' visibility without ever dropping the item from the list — a
hidden series stays in the legend with a strikethrough + reduced opacity
so the consumer can re-enable it on the next click.

## Import

```ts
import { OrigamChartLegend } from '@origam/ds'
```

The legend is exported on purpose so consumers can compose their own
chart shell with custom geometry while reusing the canonical legend.
The common path (`<OrigamChart type="...">` or the family wrappers)
embeds the legend automatically — direct import is only useful for
"build my own chart" scenarios.

## Quick start

```vue
<template>
    <origam-chart-legend
            :items="legend"
            position="bottom"
            @series-toggle="onToggle"
    />
</template>

<script setup lang="ts">
    import { OrigamChartLegend } from '@origam/ds'
    import { useChart } from '@origam/ds/composables'
    import type { IChartSeries } from '@origam/ds/interfaces'

    const series: Array<IChartSeries> = [
        { name: 'Sales 2025', data: [12, 18, 22, 19, 25, 32], color: 'primary' },
        { name: 'Sales 2026', data: [16, 22, 25, 23, 30, 38], color: 'success' }
    ]

    const { legend } = useChart({
        type: () => 'line',
        series: () => series,
        categories: () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        stacked: () => false,
        donutHoleSize: () => 0.6,
        colorScheme: () => [],
        smoothing: () => 'none',
        yMin: () => undefined,
        yMax: () => undefined,
        width: () => 600,
        height: () => 360,
        padding: () => ({ top: 24, right: 24, bottom: 36, left: 48 })
    })

    function onToggle (s: IChartSeries, visible: boolean): void {
        // Mutate your own series state — the legend item visual flips
        // immediately as soon as the next `legend.value` recomputes.
        s.visible = visible
    }
</script>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<IChartLegendItem>` | *required* | Pre-resolved entries. Each carries `series`, `index`, `color` (resolved) and `visible`. Comes verbatim from `useChart().legend.value`. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Anchor side. Drives the flex-direction (row on top/bottom, column on left/right). The wrapper SCSS sits in the parent chart shell, the legend just exposes the modifier class `.origam-chart__legend--{position}`. |

`IChartLegendItem` shape:

```ts
interface IChartLegendItem {
    series: IChartSeries
    index: number
    color: string   // already resolved (intent token → CSS var, raw CSS, …)
    visible: boolean
}
```

## Emits

| Name | Payload | Description |
|------|---------|-------------|
| `legend-click` | `(series: IChartSeries, index: number)` | Raw click on a legend entry, fired BEFORE the visibility flip. Useful for analytics / parent custom behaviours that shouldn't depend on the visibility outcome. |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fired immediately after `legend-click` with the intended next visibility. The parent should treat this as a request and update its series state accordingly; the legend does NOT mutate the series object itself (Vue 3 deep reactivity drops silently when the consumer hands plain module-level `const` series, which is the common fixture case). |

## Slots

| Name | Bindings | Description |
|------|----------|-------------|
| `legend-item` | `{ series: IChartSeries, index: number, visible: boolean }` | Replace one legend entry. The default render is a colour swatch + an inline label that prints `series.name`. Use this slot to add an icon, a trend badge, a tooltip, etc. |

## Behaviour notes

- **Strikethrough on hidden items** — when `entry.visible === false`, the
  legend item gets the `--hidden` modifier class which applies
  `opacity: 0.4` + `text-decoration: line-through`. The item stays
  visible AND clickable so the user can re-enable a hidden series.
- **Keyboard activation** — each entry is an `<li role="button"
  tabindex="0">` that responds to `Enter` and `Space` as well as to
  click. The three handlers all route to the same `onItemClick`, and
  both key handlers call `.prevent` so `Space` never scrolls the page.
- **`aria-pressed` carries the toggle state** — bound to
  `!isHidden(entry)`, so a hidden series announces as *not pressed*.
  An `aria-label` on the same element spells the state and the
  consequence out in full (`"<series name>: visible, click to hide"` /
  `"…: hidden, click to show"`). Both halves are **translated** — they read
  `origam.chart.legend.item_visible` / `item_hidden`, built in
  `itemAriaLabel()` rather than in the template. They were English literals
  hidden behind a ternary inside a template literal until #567, which is why
  no hardcoded-string audit ever counted them.
- **The root `<ul>` carries NO explicit `role`.** This is deliberate,
  not an oversight: the native `<ul>` already has the implicit `list`
  role, and this repo's HTML-semantics-first policy applies the W3C's
  first ARIA rule — *no ARIA is better than bad ARIA*. Pinned by
  `packages/tests/e2e/chart.spec.ts` ("renders a native `<ul>` with one
  entry per series"), which asserts the tag name and counts the
  `[role="button"]` children.

  ⚠️ Known consequence: because each `<li>` is overridden to
  `role="button"`, the `<ul>` has no `listitem` children, so assistive
  technology announces a set of toggle buttons rather than "list with N
  items". The buttons themselves are fully labelled and operable — only
  the list grouping is lost.
- **Click → mutation order** — `legend-click` is emitted FIRST with the
  pre-click `entry.visible`. Then `series-toggle` is emitted with the
  inverted visibility. Parents that need only one signal should listen
  to `series-toggle` (it carries the resolved state directly).
- **No internal state** — the legend is fully controlled by the parent.
  Hiding a series outside of a click (e.g. via a "Hide all" button
  somewhere else in the page) just requires updating the consumer's
  series array; the next `useChart().legend.value` recompute updates
  the items prop and the strikethrough appears.

## Composables

The legend doesn't ship its own composable. It consumes the
`IChartLegendItem[]` array produced by `useChart().legend` (one entry per
series with `{ series, index, color, visible }`). The visibility flag
inside each entry comes from `series.visible !== false`, so any
chart-engine consumer can drive the legend without touching the
component directly.

## Examples

### Bottom legend with custom badge slot

```vue
<template>
    <origam-chart-legend
            :items="legend"
            position="bottom"
            @series-toggle="onToggle"
    >
        <template #legend-item="{ series, visible }">
            <span class="legend-row" :class="{ off: !visible }">
                <span
                        class="legend-row__dot"
                        :style="{ backgroundColor: series.color }"
                />
                <strong>{{ series.name }}</strong>
                <span v-if="series.data.length" class="legend-row__count">
                    {{ series.data.length }} pts
                </span>
            </span>
        </template>
    </origam-chart-legend>
</template>
```

### Side legend (column layout)

```vue
<template>
    <div class="my-chart">
        <svg viewBox="0 0 600 360">...</svg>
        <origam-chart-legend
                :items="legend"
                position="right"
                @series-toggle="onToggle"
        />
    </div>
</template>

<style scoped>
    .my-chart {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 16px;
    }
</style>
```

### Analytics — log every interaction without affecting state

```vue
<template>
    <origam-chart-legend
            :items="legend"
            position="bottom"
            @legend-click="(s, i) => track('chart-legend-click', { name: s.name, index: i })"
            @series-toggle="(s, v) => track('chart-series-toggle', { name: s.name, visible: v })"
    />
</template>

<script setup lang="ts">
    import { track } from '@/utils/analytics'
</script>
```
