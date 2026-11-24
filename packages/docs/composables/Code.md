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

`inject(ORIGAM_CODE_KEY)` below is called synchronously here, which is
only valid while THIS function runs during a component's `setup()`
(exactly how `OrigamCode.vue` calls it). `undefined` when no
`createOrigam({ code })` ancestor provided one (or none was installed at
all): `loadHighlighter()` then keeps its original `import('shiki')`
behaviour, unchanged.

**Source** : `packages/ds/src/composables/Code/code.composable.ts`

**Consommateurs** (5) : `components/Code/OrigamCode.vue`, `consts/Code/code.const.ts`, `interfaces/Code/code.interface.ts`, `origam.ts`, `types/Code/code.type.ts`

