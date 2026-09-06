# Composables — Code

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `resetCodeHighlighterForTesting`

```ts
export function resetCodeHighlighterForTesting (): void
```

Test-only: drop the singleton so a fresh dynamic import runs next call.
Production code should never need this.

**Source** : `packages/ds/src/composables/Code/code.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useCode`

```ts
export function useCode (): IUseCodeReturn
```

Public hook — see `IUseCodeReturn` for the surface contract.

**Source** : `packages/ds/src/composables/Code/code.composable.ts`

**Consommateurs** (4) : `components/Code/OrigamCode.vue`, `consts/Code/code.const.ts`, `interfaces/Code/code.interface.ts`, `types/Code/code.type.ts`

