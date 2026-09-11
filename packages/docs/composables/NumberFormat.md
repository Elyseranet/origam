# Composables — NumberFormat

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `__clearNumberFormatCache`

```ts
export function __clearNumberFormatCache (): void
```

Test helper — clears the module-level LRU. Exposed for the unit-test
suite (cache-hit assertion) and not advertised in the public docs.

**Source** : `packages/ds/src/composables/NumberFormat/number-format.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useNumberFormat`

```ts
export function useNumberFormat ( options: MaybeRefOrGetter<IUseNumberFormatOptions> =
```

Headless number-formatting composable. Wraps `Intl.NumberFormat` with
an LRU cache, reactive locale resolution, and convenience format
dialects (`currency` / `percent` / `unit` / `compact` / `scientific`
/ `engineering`).

The composable accepts options as a plain object OR as ref-like
sources (refs / getters), so the same primitive backs both the
`<OrigamNumberFormat>` SFC and ad-hoc callers (e.g. a Pinia store
that formats numbers for a non-Vue consumer).

**Exemple**

```ts
const { format, formatToParts } = useNumberFormat({
    locale: 'fr-FR',
    format: 'currency',
    currency: 'EUR'
})
format(1234.5) // → "1 234,50 €"
```

**Source** : `packages/ds/src/composables/NumberFormat/number-format.composable.ts`

**Consommateurs** (4) : `components/NumberFormat/OrigamNumberFormat.vue`, `enums/NumberFormat/number-format.enum.ts`, `interfaces/NumberFormat/number-format.interface.ts`, `types/NumberFormat/number-format.type.ts`

