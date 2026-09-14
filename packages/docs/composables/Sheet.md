# Composables — Sheet

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `resolveHeightPx`

```ts
export function resolveHeightPx (height: number | string): number
```

Resolve a height token (number → px, string → CSS length) to absolute
pixels at the current viewport. SSR-safe: when `window` is missing we
fall back to a 0/static interpretation since the DOM cannot be read
anyway.

Exported so `OrigamSheet.vue` can share this exact resolution logic
(capping the live drag height, and ordering snap points for the
keyboard path on the drag handle) instead of re-implementing a second,
slightly different regex — see the "Reuse existing composables/utils"
rule in the project CLAUDE.md.

**Source** : `packages/ds/src/composables/Sheet/sheetSwipe.composable.ts`

**Consommateurs** (1) : `components/Sheet/OrigamSheet.vue`

## `useSheetSwipe`

```ts
export function useSheetSwipe (options: ISheetSwipeOptions): ISheetSwipeReturn
```

Geste de glissement d'un `<origam-sheet>` : suit le doigt sur l'element ou
sur sa poignee, puis s'aimante au point d'accroche le plus proche a la
relache.

Les points d'accroche sont TRIES PAR HAUTEUR CROISSANTE avant usage. C'est
ce qui permet aux recherches d'index (`snaps[i+1]`, `snaps[i-1]`) de
designer les voisins visuels ; sur une liste non triee, glisser vers le haut
pourrait aimanter vers le bas.

`persistent` empeche la fermeture par glissement — le dernier cran reste le
plus bas point d'accroche au lieu d'etre l'etat ferme.

**Source** : `packages/ds/src/composables/Sheet/sheetSwipe.composable.ts`

**Consommateurs** (5) : `components/Sheet/OrigamSheet.vue`, `consts/Sheet/sheet.const.ts`, `interfaces/Sheet/sheet-swipe-options.interface.ts`, `interfaces/Sheet/sheet-swipe-return.interface.ts`, `interfaces/Sheet/sheet.interface.ts`

