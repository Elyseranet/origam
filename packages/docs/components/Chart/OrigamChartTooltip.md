# OrigamChartTooltip

The floating card that follows the cursor and shows the hovered data point.
Extracted from the legacy all-in-one `<OrigamChart>` so every chart family
shares one default body and one slot API — **18 chart components render it**
(Bullet, BoxPlot, Candlestick, Cartesian, Heatmap, Honeycomb, Map, Pareto,
Pictorial, Polar, PolarBar, Pyramid, Sankey, Streamgraph, Sunburst, Treemap,
Variwide, WordCloud).

It is a pure renderer. Position comes from the `x` / `y` props (pixels relative
to the chart body); there is no `popper.js`, no floating-element measurement,
no collision detection. It never emits.

## Import

```ts
import { OrigamChartTooltip } from '@origam/ds'
```

Direct import is only useful when composing a custom chart shell. Every family
wrapper already embeds it and re-exposes its slot under the name `tooltip`, so
consumers of `<OrigamChart>` / `<OrigamChartCartesian>` / … should use
`<template #tooltip>` on the chart rather than mounting this component.

## Quick start

```vue
<template>
    <div class="my-chart-body">
        <svg @mousemove="onMove">…</svg>

        <origam-chart-tooltip
                :point="hovered"
                :series="hoveredSeries"
                :category="hoveredCategory"
                :x="cursor.x"
                :y="cursor.y"
                :y-axis-format="(v) => `$${v}k`"
        />
    </div>
</template>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `point` | `IChartPoint \| null` | *required* | Hovered point payload (denormalised). `null` hides the card entirely — the root `v-if` fails and nothing is rendered. |
| `series` | `IChartSeries \| null` | *required* | Hovered series. Companion to `point`: `null` here hides the card even when `point` is set. |
| `category` | `string \| number` | *required* | Friendly X-axis label for the hovered point. Passed through `xAxisFormat` before display. |
| `x` | `number` | *required* | Cursor X in pixels, relative to the positioned chart body. |
| `y` | `number` | *required* | Cursor Y in pixels, relative to the positioned chart body. |
| `xAxisFormat` | `(value: string \| number) => string` | `String(value)` | Formatter applied to `category` in the default body. |
| `yAxisFormat` | `(value: number) => string` | `String(value)` | Formatter applied to `point.y` in the default body. |

## Emits

None. `IChartTooltipEmits` is empty by design — the card is positioned by its
props and never reports back.

## Slots

| Name | Bindings | Description |
|---|---|---|
| `default` | `{ point: IChartPoint, series: IChartSeries, category: string \| number }` | Replaces the **entire** card body — the title row, the swatch and the value row all disappear. The bindings are the non-null narrowings of the props (the slot is only reached once both `point` and `series` are set). |

The default body, when the slot is not filled:

```html
<div class="origam-chart__tooltip-title">{{ series.name }}</div>
<div class="origam-chart__tooltip-row">
    <span class="origam-chart__tooltip-swatch" :style="{ backgroundColor: point.color }"/>
    <span class="origam-chart__tooltip-label">{{ xAxisFormat(category) }}</span>
    <span class="origam-chart__tooltip-value">{{ yAxisFormat(point.y) }}</span>
</div>
```

## Behaviour notes

**Positioning.** The root gets an inline `left: {x + 12}px; top: {y + 12}px` —
a fixed 12 px offset below-right of the cursor, reproducing the legacy shell
pixel for pixel. There is no viewport-edge flip: near the right or bottom edge
of a small container the card can overflow. That is the historical behaviour
and it is deliberate; a chart body with `overflow: hidden` clips it instead.

**The parent must be a positioning context.** The card is `position: absolute`,
so the element that contains it needs `position: relative`. Every family
wrapper's `__body` already does.

**⛔ This component ships NO `<style>` block.** Its appearance lives in each
consumer's scoped SCSS as a `:deep(.origam-chart__tooltip)` rule — one copy in
each of the 18 files listed above. Mount `<origam-chart-tooltip>` inside your
own shell and it renders **unstyled**: no absolute positioning, no card
background, no shadow. Copy the rule block (or reference the tokens below)
into your shell's stylesheet.

**Design tokens.** Each `:deep` block reads the same five variables, declared in
`packages/ds/src/assets/css/tokens/light.css` and `dark.css`:

| Variable | Light default |
|---|---|
| `--origam-chart__tooltip---background-color` | `var(--origam-color__surface---inverse)` |
| `--origam-chart__tooltip---color` | `var(--origam-color__text---inverse)` |
| `--origam-chart__tooltip---padding` | `var(--origam-space---2)` |
| `--origam-chart__tooltip---border-radius` | `var(--origam-radius---sm)` |
| `--origam-chart__tooltip---shadow` | `var(--origam-shadow---md)` |

**Accessibility — `aria-hidden="true"`, not `role="tooltip"` (#426).** The card
is hidden from the accessibility tree on purpose. Every trigger (the hovered
bar / point / slice, in each of the 18 consuming families) already carries an
`aria-label` announcing the same category / value pair the card renders
visually, so the information reaches assistive technology through the trigger.
A `role="tooltip"` with no `id` wired into the trigger's `aria-describedby` is
an orphaned role the ARIA APG explicitly warns against; retrofitting a unique
id + `aria-describedby` link across every point element in 18 files was
rejected in favour of marking the card decorative. Pinned by
`packages/tests/TU/components/Chart/OrigamChartTooltip.spec.ts`.

**`pointer-events: none`.** Set by the consumer `:deep` rule, so the card never
steals the hover that produced it.

**No composable.** The tooltip owns no state and ships no `useChartTooltip`.
The hover state it displays comes from `useChart().hover` / `onPointHover` in
the parent shell.

## Examples

### Custom body with a currency value

```vue
<template>
    <origam-chart-cartesian
            :series="series"
            :categories="months"
            type="line"
    >
        <template #tooltip="{ point, series, category }">
            <strong>{{ series.name }}</strong>
            <div>{{ category }} — {{ point.y.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</div>
        </template>
    </origam-chart-cartesian>
</template>
```

The family wrappers forward their own `#tooltip` slot into this component's
`#default` slot, so the bindings above are exactly the ones documented in the
Slots table.

### Standalone, inside a hand-built chart shell

```vue
<template>
    <div class="chart-body">
        <svg
                viewBox="0 0 600 360"
                @mousemove="onMove"
                @mouseleave="hovered = null"
        >
            <polyline :points="points"/>
        </svg>

        <origam-chart-tooltip
                :point="hovered"
                :series="hovered ? series[0] : null"
                :category="hovered?.x ?? ''"
                :x="cursor.x"
                :y="cursor.y"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { OrigamChartTooltip } from '@origam/ds'
    import type { IChartPoint, IChartSeries } from '@origam/ds'

    const series: Array<IChartSeries> = [
        { name: 'Sales', data: [12, 18, 22, 19, 25], color: 'primary' }
    ]

    const hovered = ref<IChartPoint | null>(null)
    const cursor = ref({ x: 0, y: 0 })

    function onMove (event: MouseEvent): void {
        const box = (event.currentTarget as SVGElement).getBoundingClientRect()
        cursor.value = { x: event.clientX - box.left, y: event.clientY - box.top }
        // resolve `hovered` from your own geometry here
    }
</script>

<style scoped>
    .chart-body {
        position: relative;
    }

    /* Required: the component ships no style of its own. */
    .chart-body :deep(.origam-chart__tooltip) {
        position: absolute;
        pointer-events: none;
        z-index: 10;
        font-size: 0.8125rem;
        background-color: var(--origam-chart__tooltip---background-color);
        color: var(--origam-chart__tooltip---color);
        padding: var(--origam-chart__tooltip---padding);
        border-radius: var(--origam-chart__tooltip---border-radius);
        box-shadow: var(--origam-chart__tooltip---shadow);
    }
</style>
```
