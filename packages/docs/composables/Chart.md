# Composables — Chart

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

9 symbole(s) exporte(s).

## `computeAnnotationGeometry`

```ts
export const computeAnnotationGeometry = ( anno: IChartAnnotation, scales: IChartScales, categories: Array<string>, categoryCount: number ): IChartAnnotationGeo | null
```

Project a single `IChartAnnotation` into pixel space using the
chart's X/Y scales and the current category list.

Returns `null` when required coordinates cannot be resolved
(e.g. a category string that doesn't exist in the list).

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (2) : `components/Chart/OrigamChartCartesian.vue`, `interfaces/Chart/chart-annotation.interface.ts`

## `computePlotBandGeometry`

```ts
export const computePlotBandGeometry = ( band: IChartPlotBand, scales: IChartScales, categories: Array<string>, plotX0: number, plotX1: number, plotY0: number, plotY1: number ):
```

Compute geometry for a single plot band. Returns an object with
SVG rect attributes and label positioning, or `null` when the
band falls entirely outside the plot.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (1) : `components/Chart/OrigamChartCartesian.vue`

## `computePlotLineGeometry`

```ts
export const computePlotLineGeometry = ( line: IChartPlotLine, scales: IChartScales, categories: Array<string>, plotX0: number, plotX1: number, plotY0: number, plotY1: number ):
```

Compute geometry for a single plot line. Returns an object with
SVG line attributes and label positioning, or `null` when the
line falls outside the plot.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (1) : `components/Chart/OrigamChartCartesian.vue`

## `useChart`

```ts
export const useChart = (options: IUseChartOptions)
```

Stateless chart engine. Produces every render-time descriptor
`<OrigamChart>` needs:

- `viewBox` — pre-formatted SVG attribute string.
- `scales.x|y` — pure pixel-mapping functions.
- `paths` — array of `<path>`/`<rect>`/`<circle>` descriptors,
  one entry per series for line/area/radar/pie/donut, one entry
  per data point for bar/column/scatter.
- `ticks` — gridline + axis-label positions.
- `legend` — pre-resolved legend entries.
- `hover`, `onPointHover` — interactive state shared between
  the data points and the tooltip teleport.

Every getter is a `() => …` thunk so the composable can be driven
from props *or* a Pinia store without re-instantiation.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (18) : `components/Chart/OrigamChart.vue`, `components/Chart/OrigamChartAxis.vue`, `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartLegend.vue`, `components/Chart/OrigamChartPictorial.vue`, `components/Chart/OrigamChartPolar.vue`, …

## `useChartAnimationStyle`

```ts
export function useChartAnimationStyle (props: Pick<IChartBaseProps, 'animationDuration'>): ComputedRef<Record<string, string>>
```

Resolves the `--origam-chart---animation-duration` inline style. Every
`OrigamChart*.vue` used to write
`` out['--origam-chart---animation-duration'] = `${props.animationDuration}ms` ``
UNCONDITIONALLY. That looks harmless because `props.animationDuration`
carries a `withDefaults()` default of `600`, but Vue resolves an UNSET
prop to that default too — so the assignment fired on every render
whether anything ever touched the prop or not, and an inline style
ALWAYS outranks a `[data-theme] { --origam-chart---animation-duration:
… }` rule set through the `vars`/`cssVars` escape hatch. The token was
reachable in the generated CSS but never actually applied — the
component itself permanently shadowed it. See #505.

⛔ A plain `usePassedProps('animationDuration')` gate is NOT enough on
its own, and shipping it as the only condition would be a REGRESSION,
not a fix. ADR-005 lets a theme set this exact prop via
`theme.components['origam-chart-cartesian'].animationDuration` WITHOUT
the consumer ever writing it in the template — `usePassedProps` reads
`instance.vnode.props` (the parent's own template), which the ADR-005
resolver deliberately does NOT touch (see
`theme-props-resolver.composable.ts`'s note on why `usePassedProps` and
the resolver "independently arrive at the same answer" — they read the
SAME vnode-props source, on purpose). So under a props-level theme
override, `usePassedProps('animationDuration')` is `false` even though
`props.animationDuration` correctly resolves to the theme's value. Gating
on `usePassedProps` alone would silently drop that value from the CSS
var — the opposite of "theme applies" — while `props.animationDuration`
itself stayed right.

The distinguishing test is therefore: did the value that reached this
render differ from the component's OWN static default
(`CHART_ANIMATION_DURATION_DEFAULT`, mirrored in every `withDefaults()`
call verbatim — see that const's own doc for why it can't be imported
INTO `withDefaults()` itself)? Either the consumer passed something
explicitly, OR a theme did — in both cases the resolved value is
meaningful and must reach the CSS var. Only when NEITHER touched it
(value === the static default, `usePassedProps` false) do we omit the
inline write and defer to the CSS-baked
`var(--origam-chart---animation-duration, 600ms)` fallback — leaving
room for a theme's raw `cssVars` override (a DIFFERENT, lower-level
channel than `theme.components`) to apply through the cascade instead.

Resulting priority: consumer explicit > theme (either channel:
`theme.components[...].animationDuration` OR a raw `cssVars` override)
> CSS default (`600ms`).

**Exemple**

const chartAnimationStyle = useChartAnimationStyle(props)
// merge into the root styles computed, alongside the other entries:
Object.assign(out, chartAnimationStyle.value)

**Source** : `packages/ds/src/composables/Chart/chart-animation.composable.ts`

**Consommateurs** (21) : `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, …

## `useChartGauge`

```ts
export const useChartGauge = (options: IUseChartGaugeOptions):
```

Solid-gauge geometry engine. Given a `value` clamped between
`min` and `max`, produces:

- `trackPath` — the empty arc behind the indicator (full sweep).
- `valuePath` — the filled arc from `min` to `value` (partial sweep).
- `valueAngle` — the radian angle of the indicator end (for the
  needle / handle if needed later).
- `centerX` / `centerY` — pivot point used by the value label.
- `outerRadius` / `innerRadius` — sized from the available plot
  box minus the gauge thickness.

The composable is intentionally framework-agnostic in spirit:
inputs are thunks so `<OrigamChartGauge>` can drive it from
props OR a Pinia store without re-instantiating.

**Source** : `packages/ds/src/composables/Chart/chart-gauge.composable.ts`

**Consommateurs** (2) : `components/Chart/OrigamChartGauge.vue`, `interfaces/Chart/chart-gauge.interface.ts`

## `useChartHeaderTypography`

```ts
export function useChartHeaderTypography (props: ITypographyProps)
```

useChartHeaderTypography — applies the shared `ITypographyProps` surface to a
chart's header (title + subtitle) at once.

Both the title and subtitle `<text>` of every chart read the GLOBAL
`--origam-chart__title---*` / `--origam-chart__subtitle---*` variables (their
per-type element classes — `chart-gauge__title`, `chart-cartesian__title`, …
— all reference the same shared vars in SCSS). So the returned styles are
bound on the chart ROOT element and cascade down to those descendant `<text>`
nodes; no per-element binding is needed.

Effective props on SVG `<text>`: **fontSize + fontWeight** only (title reads
both, subtitle reads font-size). `fontFamily` / `lineHeight` / `letterSpacing`
are part of the surface but inert on charts — no SCSS rule reads them, and
`line-height` is not even a valid SVG `<text>` property. See the chart
typography recipe.

**Exemple**

// in a chart component:
const { headerTypographyStyles } = useChartHeaderTypography(props)
// template root: :style="[rootStyles, …, headerTypographyStyles]"

**Source** : `packages/ds/src/composables/Chart/chart-header-typography.composable.ts`

**Consommateurs** (20) : `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, …

## `useChartUnsupportedProp`

```ts
export function useChartUnsupportedProp ( component: string, prop: string, reason: string, isPassed: ()
```

⛔ issue #426 — dev-time warning for a prop that a chart component
publicly exposes (usually inherited from `IChartBaseProps`) but that
has no rendering effect on THAT particular chart type. First
consumer: `colorScheme` (a rotating discrete palette) on
`OrigamChartBullet` / `OrigamChartCandlestick` / `OrigamChartHeatmap`
/ `OrigamChartMap` — their colour model is a uniform fill, binary, or
a continuous gradient, none of which a rotating palette can drive.

Neither wiring a fake behaviour (nothing to invent — no spec says
what a "rotating palette" would mean on a 2-colour or gradient
model) nor removing the prop (breaking change for existing
consumers) is on the table — see #426. Documenting + warning is the
third option.

The check runs inside `watchEffect` rather than a bare `if` in the
`setup()` body: per ADR-005, a prop read eagerly at `setup()` time
never sees a value applied later via `theme.components` (the
resolver patches `instance.props` after `setup()` runs). Wrapping
the read in `watchEffect` defers it to Vue's reactive effect flush,
same pattern as `useIconAccessibility`'s dev-time a11y warning.

Actual `console.warn` emission is delegated to `warnUnsupportedProp`
(`utils/Commons/color.util.ts`), which dedupes per `(component, prop)`
key and gates on `import.meta.env.DEV` — so the effect above may
re-run on every reactive change, but the console only ever sees the
warning once, and never in a production build.

@param component - PascalCase component name, e.g. `'OrigamChartHeatmap'`.
@param prop - Name of the inapplicable prop, e.g. `'colorScheme'`.
@param reason - What DOES drive colour on this component, and why a
  rotating palette doesn't apply — surfaced verbatim in the warning.
@param isPassed - Reactive getter, `true` when the consumer passed a
  non-empty / meaningful value for the prop.

**Source** : `packages/ds/src/composables/Chart/chart-prop-warning.composable.ts`

**Consommateurs** (14) : `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, `components/Chart/OrigamChartPictorial.vue`, `components/Chart/OrigamChartPolarBar.vue`, …

## `useChartZoom`

```ts
export function useChartZoom(options:
```

Manages interactive zoom / pan state for `<OrigamChartCartesian>`.

The zoom window is expressed as a closed `[zoomStart, zoomEnd]`
range of **category indices** (integers). The engine clips the
category array and re-computes the X scale against the visible
subset before handing off to the path generator.

Invariants maintained by every mutating method:
  - `0 ≤ zoomStart < zoomEnd ≤ dataLength - 1`
  - `zoomEnd - zoomStart ≥ CHART_ZOOM_MIN_VISIBLE_CATEGORIES - 1`

@param options.dataLength  Reactive getter returning the total
  number of categories (or data points when no categories array
  is provided). Must always be ≥ 1.

**Source** : `packages/ds/src/composables/Chart/chart-zoom.composable.ts`

**Consommateurs** (1) : `components/Chart/OrigamChartCartesian.vue`

