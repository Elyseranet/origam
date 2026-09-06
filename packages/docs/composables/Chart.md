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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (2) : `components/Chart/OrigamChartCartesian.vue`, `interfaces/Chart/chart-annotation.interface.ts`

## `computePlotBandGeometry`

```ts
export const computePlotBandGeometry = ( band: IChartPlotBand, scales: IChartScales, categories: Array<string>, plotX0: number, plotX1: number, plotY0: number, plotY1: number ):
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (1) : `components/Chart/OrigamChartCartesian.vue`

## `computePlotLineGeometry`

```ts
export const computePlotLineGeometry = ( line: IChartPlotLine, scales: IChartScales, categories: Array<string>, plotX0: number, plotX1: number, plotY0: number, plotY1: number ):
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (1) : `components/Chart/OrigamChartCartesian.vue`

## `useChart`

```ts
export const useChart = (options: IUseChartOptions)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Consommateurs** (18) : `components/Chart/OrigamChart.vue`, `components/Chart/OrigamChartAxis.vue`, `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartLegend.vue`, `components/Chart/OrigamChartPictorial.vue`, `components/Chart/OrigamChartPolar.vue`, …

## `useChartAnimationStyle`

```ts
export function useChartAnimationStyle (props: Pick<IChartBaseProps, 'animationDuration'>): ComputedRef<Record<string, string>>
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart-animation.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart-animation.composable.ts`

**Consommateurs** (21) : `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, …

## `useChartGauge`

```ts
export const useChartGauge = (options: IUseChartGaugeOptions):
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart-gauge.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart-gauge.composable.ts`

**Consommateurs** (2) : `components/Chart/OrigamChartGauge.vue`, `interfaces/Chart/chart-gauge.interface.ts`

## `useChartHeaderTypography`

```ts
export function useChartHeaderTypography (props: ITypographyProps)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart-header-typography.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart-header-typography.composable.ts`

**Consommateurs** (20) : `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, …

## `useChartUnsupportedProp`

```ts
export function useChartUnsupportedProp ( component: string, prop: string, reason: string, isPassed: ()
```

⛔ issue #426 — dev-time warning for a prop that a chart component publicly exposes (usually inherited from `IChartBaseProps`) but that has no rendering effect on THAT particular chart type. First consumer: `colorScheme` (a rotating discrete palette) on `OrigamChartBullet` / `OrigamChartCandlestick` / `OrigamChartHeatmap` / `OrigamChartMap` — their colour model is a uniform fill, binary, or a continuous gradient, none of which a rotating palette can drive. Neither wiring a fake behaviour (nothing to invent — no spec says what a "rotating palette" would mean on a 2-colour or gradient model) nor removing the prop (breaking change for existing consumers) is on the table — see #426. Documenting + warning is the third option.

The check runs inside `watchEffect` rather than a bare `if` in the `setup()` body: per ADR-005, a prop read eagerly at `setup()` time never sees a value applied later via `theme.components` (the resolver patches `instance.props` after `setup()` runs). Wrapping the read in `watchEffect` defers it to Vue's reactive effect flush, same pattern as `useIconAccessibility`'s dev-time a11y warning.

Actual `console.warn` emission is delegated to `warnUnsupportedProp` (`utils/Commons/color.util.ts`), which dedupes per `(component, prop)` key and gates on `import.meta.env.DEV` — so the effect above may re-run on every reactive change, but the console only ever sees the warning once, and never in a production build. @param component - PascalCase component name, e.g. `'OrigamChartHeatmap'`. @param prop - Name of the inapplicable prop, e.g. `'colorScheme'`. @param reason - What DOES drive colour on this component, and why a   rotating palette doesn't apply — surfaced verbatim in the warning. @param isPassed - Reactive getter, `true` when the consumer passed a   non-empty / meaningful value for the prop.

**Source** : `packages/ds/src/composables/Chart/chart-prop-warning.composable.ts`

**Consommateurs** (14) : `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, `components/Chart/OrigamChartPictorial.vue`, `components/Chart/OrigamChartPolarBar.vue`, …

## `useChartZoom`

```ts
export function useChartZoom(options:
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Chart/chart-zoom.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Chart/chart-zoom.composable.ts`

**Consommateurs** (1) : `components/Chart/OrigamChartCartesian.vue`

