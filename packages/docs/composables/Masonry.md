# Composables — Masonry

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

3 symbole(s) exporte(s).

## `bucketFill`

```ts
export function bucketFill ( heights: ReadonlyArray<number>, containerWidth: number, gap: number, columns: number, align: TMasonryAlign = 'top' ): IMasonryLayoutResult
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Masonry/masonry.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `pickColumnsForWidth`

```ts
export function pickColumnsForWidth ( width: number, breakpoints: TMasonryColumnBreakpoints | undefined, defaultColumns: number ): number
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Masonry/masonry.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useMasonry`

```ts
export function useMasonry (options: IUseMasonryOptions)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Masonry/masonry.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Consommateurs** (2) : `components/Masonry/OrigamMasonry.vue`, `interfaces/Masonry/masonry.interface.ts`

