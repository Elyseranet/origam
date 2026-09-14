# Composables — NumberField

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useHold`

```ts
export function useHold (
```

`holdRepeat` / `holdDelay` accept `MaybeRefOrGetter<number>` (a plain
number still works) and are read via `toValue()` inside `holdStart` —
at the moment a NEW hold sequence begins — rather than once when
`useHold()` itself is called. The caller (`OrigamNumberField.vue`)
passes `() => props.holdRepeat` / `() => props.holdDelay`, so a prop
change reaching the component after mount is honoured by the next
press-and-hold, instead of being silently frozen for the component's
whole lifetime (#487).

**Source** : `packages/ds/src/composables/NumberField/hold.composable.ts`

**Consommateurs** (2) : `components/NumberField/OrigamNumberField.vue`, `consts/NumberField/number-field.const.ts`

