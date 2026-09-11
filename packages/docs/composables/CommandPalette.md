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

Registre des commandes de `<origam-command-palette>`. `register` ajoute ou
remplace une commande par son `id` et retourne sa fonction de retrait.

Le retrait est aussi branche sur `tryOnScopeDispose` : une commande
enregistree depuis un `setup()` disparait avec le composant, sans que
l'appelant ait a garder la fonction retournee. Hors d'un scope Vue, cet
accrochage ne fait rien et c'est au consommateur d'appeler le retrait.

**Source** : `packages/ds/src/composables/CommandPalette/command.composable.ts`

**Consommateurs** (4) : `components/CommandPalette/OrigamCommandPalette.vue`, `consts/CommandPalette/command-palette.const.ts`, `interfaces/CommandPalette/command-palette.interface.ts`, `interfaces/CommandPalette/command.interface.ts`

