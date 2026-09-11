# Composables — SliderField

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useSteps`

```ts
export function useSteps (props: ISliderFieldProps)
```

Pure-function stepping math used by `<OrigamSliderField>`.
Returns reactive min / max / step / decimals refs and a
`roundValue` helper that snaps any raw number to the
nearest valid step (clamped to [min, max]).

The browser owns drag now — `useSlider` (the legacy JS
drag pipeline) was deleted with the native `<input
type="range">` migration. This file used to be 280 LOC.

**Source** : `packages/ds/src/composables/SliderField/slider-field.composable.ts`

**Consommateurs** (1) : `components/SliderField/OrigamSliderField.vue`

