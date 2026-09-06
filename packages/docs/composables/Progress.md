# Composables — Progress

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useProgress`

```ts
export function useProgress (props: IProgressTypeProps)
```

Socle partage par `<origam-progress-linear>` et
`<origam-progress-circular>` : normalise la valeur, resout l'epaisseur et
le maximum, et compose les classes et styles de la racine. Retourne
`{ progressClasses, progressStyles, normalizedValue, thickness, max,
progress, hasContent }`.

`normalizedValue` ramene toujours a un POURCENTAGE (`value / max * 100`),
quel que soit le `max` du consommateur — les deux implementations
raisonnent ensuite sur la meme echelle, l'une en largeur, l'autre en arc.

⛔ La classe `--visible` est pilotee par un `IntersectionObserver`, pas par
une prop : une barre hors de l'ecran n'anime pas. Consequence a connaitre
en test — hors d'un vrai navigateur l'observateur ne se declenche pas, donc
la classe reste absente et ce n'est pas un defaut du composant.

**Source** : `packages/ds/src/composables/Progress/progress.composable.ts`

**Consommateurs** (3) : `components/Progress/OrigamProgress.vue`, `components/Progress/OrigamProgressCircular.vue`, `components/Progress/OrigamProgressLinear.vue`

