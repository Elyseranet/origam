# Composables — CommandPalette

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `resetCommandRegistryForTesting`

```ts
export function resetCommandRegistryForTesting (): void
```

Vitest needs to wipe the singleton between specs so the registry
does not leak between cases. Not part of the public surface — do
not import in product code.

**Source** : `packages/ds/src/composables/CommandPalette/command.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useCommand`

```ts
export function useCommand (): IUseCommandReturn
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/CommandPalette/command.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/CommandPalette/command.composable.ts`

**Consommateurs** (4) : `components/CommandPalette/OrigamCommandPalette.vue`, `consts/CommandPalette/command-palette.const.ts`, `interfaces/CommandPalette/command-palette.interface.ts`, `interfaces/CommandPalette/command.interface.ts`

