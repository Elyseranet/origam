# Composables — Calendar

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useCalendar`

```ts
export function useCalendar ( options: IUseCalendarOptions, setView?: (view: TCalendarView)
```

Public composable. Stateless over the inputs (every getter is a
`() => …` thunk), so `<OrigamCalendar>` can drive it from props or
a parent store without re-instantiation.

Methods (`navigate`, `setView`, `buildXxxGrid`) are intentionally
**not** wrapped in computeds — they're pure functions / side-effect
channels. The reactive surface is `expandedEvents` +
`visibleDateRange`, which depend on every input thunk.

**Source** : `packages/ds/src/composables/Calendar/calendar.composable.ts`

**Consommateurs** (4) : `components/Calendar/OrigamCalendar.vue`, `enums/Calendar/calendar.enum.ts`, `interfaces/Calendar/event.interface.ts`, `types/Calendar/calendar.type.ts`

