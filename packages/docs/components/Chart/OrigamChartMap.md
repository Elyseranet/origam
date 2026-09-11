# OrigamChartMap

World map chart family. Two rendering modes selectable via the `mode` prop:

- **`mode='choropleth'`** — country shapes filled with an interpolated colour from `colorRange`, proportional to each country's value. Countries absent from the dataset receive `defaultCountryFill`.
- **`mode='flight-routes'`** — quadratic Bezier arcs drawn between country-centroid pairs over a neutral map backdrop. Stroke width scales logarithmically with the optional `value` on each route.

**Map coverage:** 35 countries on a simplified 1000 × 500 Mercator canvas. See "Coverage" below for the full list and omitted countries.

## Import

```ts
import { OrigamChartMap } from '@origam/ds'
```

## Quick start — Choropleth

```vue
<template>
  <origam-chart-map
    mode="choropleth"
    :series="[{
      name: 'GDP (T USD)',
      data: [
        { code: 'US', value: 27.4, name: 'United States' },
        { code: 'CN', value: 17.7, name: 'China' },
        { code: 'DE', value: 4.4,  name: 'Germany' }
      ]
    }]"
    :height="400"
    title="GDP by Country"
  />
</template>

<script setup lang="ts">
import { OrigamChartMap } from '@origam/ds'
</script>
```

## Quick start — Flight routes

```vue
<template>
  <origam-chart-map
    mode="flight-routes"
    :series="[{
      name: 'Routes from London',
      data: [
        { from: 'GB', to: 'US', value: 850 },
        { from: 'GB', to: 'JP', value: 280 },
        { from: 'GB', to: 'AU', value: 220 }
      ]
    }]"
    :height="400"
    :route-curvature="0.3"
    :show-legend="false"
    title="Routes from GB"
  />
</template>

<script setup lang="ts">
import { OrigamChartMap } from '@origam/ds'
</script>
```

## Data shapes

### Choropleth datum (`IChartMapChoroplethDatum`)

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | Yes | ISO-3166-1 alpha-2 country code (e.g. `'FR'`, `'US'`). |
| `value` | `number` | Yes | Numeric value for colour interpolation. |
| `name` | `string` | No | Human-readable label. Falls back to `code`. |

### Route datum (`IChartMapRouteDatum`)

| Field | Type | Required | Description |
|---|---|---|---|
| `from` | `string` | Yes | ISO-3166-1 alpha-2 code for the origin country. |
| `to` | `string` | Yes | ISO-3166-1 alpha-2 code for the destination country. |
| `value` | `number` | No | Flow weight — drives stroke width via `Math.log(value + 1) * 1.5`. Constant `2` when absent. |
| `color` | `TIntent \| string` | No | Per-route stroke colour override. Falls back to `lineColor` prop. |

## Props

### Data

| Name | Type | Default | Description |
|---|---|---|---|
| `series` | `Array<IChartSeries>` | required | Single series. Data shape depends on `mode`: `IChartMapChoroplethDatum[]` for choropleth, `IChartMapRouteDatum[]` for flight-routes. |

### Visual

| Name | Type | Default | Description |
|---|---|---|---|
| `mode` | `TChartMapMode` | `'choropleth'` | Rendering mode. `'choropleth'` or `'flight-routes'`. |
| `height` | `number \| string` | `360` | Chart height in px. Ignored when `aspectRatio` is set. |
| `aspectRatio` | `string` | `undefined` | CSS `aspect-ratio` shorthand — overrides `height`. |
| `title` | `string` | `undefined` | Optional title above the chart. Replaceable via `#title` slot. |
| `subtitle` | `string` | `undefined` | Optional subtitle below the title. |
| `colorRange` | `[TIntent \| string, TIntent \| string]` | `['info', 'danger']` | Choropleth gradient endpoints. First = min value, second = max value. |
| `defaultCountryFill` | `string` | `'rgba(0,0,0,0.08)'` | Fill for countries absent from the dataset (both modes). |
| `borderColor` | `string` | `'rgba(0,0,0,0.2)'` | Stroke applied to all country paths. |
| `lineColor` | `TIntent \| string` | `'primary'` | Default stroke colour for flight-route arcs. Overridden per route. |
| `nodeRadius` | `number` | `4` | Radius of the endpoint circles in flight-routes mode. |
| `routeCurvature` | `number` | `0.3` | Bezier offset as a fraction of chord length `[0..1]`. `0` = straight. |

### Legend

| Name | Type | Default | Description |
|---|---|---|---|
| `showLegend` | `boolean` | `true` | Toggle the gradient legend bar (choropleth). Has no visible effect in flight-routes mode (no legend rendered). |
| `legendPosition` | `TChartLegendPosition` | `'bottom'` | Anchor of the legend. |

### Behaviour

| Name | Type | Default | Description |
|---|---|---|---|
| `showTooltip` | `boolean` | `true` | Toggle the hover tooltip. |
| `animated` | `boolean` | `true` | Fade-in animation on mount. Respects `prefers-reduced-motion`. |
| `animationDuration` | `number` | `600` | Animation duration in ms. |
| `yAxisFormat` | `(value: number) => string` | `undefined` | Value formatter used in tooltips and the gradient legend labels. |

### Inherited from `IChartBaseProps`

`bgColor`, `elevation`, `rounded`, `margin`, `padding`, `colorScheme` — see base props.

## Emits

| Event | Payload | Description |
|---|---|---|
| `point-click` | `(point: IChartPoint, event: MouseEvent \| KeyboardEvent)` | Fires when a choropleth country with data (or a flight-route arc) is activated by click or Enter/Space. |
| `legend-click` | `(series: IChartSeries, index: number)` | Fires when a legend entry is clicked (not applicable in current gradient legend). |
| `series-toggle` | `(series: IChartSeries, visible: boolean)` | Fires when a series visibility is toggled (not applicable in current gradient legend). |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `#tooltip` | `{ point, series, category }` | Replace the default tooltip body. |
| `#title` | — | Replace the title + subtitle block. |
| `#empty` | — | Render when `series` is empty or has no renderable data. |

## Coverage

Countries included in the simplified map (35 total):

| Region | Countries |
|---|---|
| North America | US, CA, MX |
| South America | BR, AR, CL, PE, CO |
| Europe | GB, FR, DE, IT, ES, PT, NL, BE, PL, SE, NO, FI, GR, TR |
| Asia | RU, CN, JP, KR, IN, TH, SG, ID |
| Africa | ZA, EG, NG |
| Oceania | AU, NZ |

**Omitted** (hard to approximate clearly at 1000×500 scale, or too small):
- Central African countries, Saharan countries between EG/NG/ZA
- Small island states beyond SG and NZ
- Eastern European countries between DE/PL and TR/GR

## Behaviour notes

- **SVG-only** — no canvas fallback, no external map library.
- **Projection** — simplified Mercator on a fixed 1000×500 coordinate space. Shapes are recognisable approximations, not GIS-accurate.
- **Choropleth colour interpolation** — uses `color-mix(in srgb, …)`. Requires a browser with `color-mix()` support (Baseline 2023). Falls back to the start colour in unsupported environments.
- **Keyboard navigation** — choropleth countries with data and route arcs are keyboard-focusable (`tabindex="0"`, Enter/Space activate `point-click`). Countries without data are `tabindex="-1"`.
- **Animation** — `prefers-reduced-motion: reduce` disables all animations automatically.
- **Route curvature edge cases** — at `routeCurvature=0` the arc degenerates to a straight line. At values above `0.6` the perpendicular offset may push the control point outside the SVG viewport on short inter-country chords; `0.3`–`0.4` is the recommended range.

## Composable

No dedicated composable — geometry logic lives inside the component as computed properties, following the heatmap/pyramid pattern.
