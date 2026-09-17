# useUnsupportedProp

Declares, in one line, that a prop a component exposes has **no effect on that
component** — and warns once, in dev only, when a consumer actually passes it.

## API

```ts
function useUnsupportedProp (
    component: string,
    prop: string,
    reason: string,
    isPassed: () => boolean,
): void
```

Returns nothing. It registers a `watchEffect` that calls
`warnUnsupportedProp(component, prop, reason)` whenever `isPassed()` is true.

## Usage

A real call site, copied verbatim from `OrigamChartGauge.vue`:

```ts
import { useUnsupportedProp } from 'origam/composables'

const props = defineProps<{ showLegend?: boolean }>()

useUnsupportedProp(
    'OrigamChartGauge',
    'showLegend',
    'a gauge reads a single value from the first series and renders no legend markup at all.',
    () => props.showLegend === true
)
```

The emitted message:

```
[origam] <OrigamChartGauge> prop "showLegend" has no effect on this component: a gauge reads a single value from the first series and renders no legend markup at all.
```

Note that call sites pass the **PascalCase** component name, not the
kebab-cased instance name — the `component` argument is interpolated verbatim
into the message, nothing normalises it.

`warnUnsupportedProp` (in `utils/Commons/color.util.ts`) is a no-op outside
`import.meta.env.DEV`, and deduplicates on `` `${component}::${prop}` `` — so
the warning fires at most once per component/prop pair for the whole session,
however many instances mount.

## ⛔ The predicate must compare to the prop's REAL default

`props.x !== undefined` is **always true** as soon as `withDefaults` gives the
prop a value, so the warning would fire on every mount. Measured on the Chart
family, where `animated: false` and `animationDuration: 600` shouted
continuously. A permanent warning is ignored within two days.

Write the predicate against the actual default. Real examples from the
catalogue: `() => props.showLegend === true`,
`() => props.modelValue !== undefined`,
`() => (props.categories?.length ?? 0) > 0`,
`() => props.legendPosition !== undefined && props.legendPosition !== 'bottom'`.

## Why warn instead of deleting the prop

These props are exposed in stories and sometimes documented. Removing one
breaks a story and a consumer's types, for a prop that already did nothing.
Wiring it to invented behaviour would be worse. The warning tells the truth
without breaking anything — and it carries the **reason**, so the reader does
not have to open the source to find out why.

## Useful side effect

Reading the prop inside the predicate makes it **consumed** as far as the
`unconsumed-props` guard is concerned. The surface stops being counted as dead
code, which is accurate: it is now monitored, not ignored.

## Consumers

**19** components, the `Chart` family being the first and largest group:
`ChartBullet`, `ChartCandlestick`, `ChartGauge`, `ChartHeatmap`,
`ChartHoneycomb`, `ChartMap`, `ChartPictorial`, `ChartPolarBar`, `ChartRadar`,
`ChartSankey`, `ChartSparkline`, `ChartTreemap`, `ChartWordCloud`, plus
`Audio`, `DatePickerControls`, `ListChildren`, `Messages`, `Toolbar`, `Video`.
Plus `packages/tests/TU/composables/Commons/unsupportedProp.composable.spec.ts`.

## Source

- `packages/ds/src/composables/Commons/unsupportedProp.composable.ts`
- The warner it reuses: `warnUnsupportedProp` in
  `packages/ds/src/utils/Commons/color.util.ts`

## Related

- [`installThemePropsResolver`](./installThemePropsResolver.md) — uses the same
  `warnUnsupportedProp` for the mirror case: a **theme** naming a prop the
  component never declares.
