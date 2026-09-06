# Composables — Parallax

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `useParallaxRuntime`

```ts
export function useParallaxRuntime (options: IUseParallaxRuntimeOptions)
```

Headless runtime for the enriched OrigamParallax. Maintains a registry
of layers, tracks scroll progress / mouse-ratio, decides between the
CSS-first scroll-driven path and a JS rAF fallback, honours
`prefers-reduced-motion`, and emits enter / leave / progress hooks via
the options bag.

**Source** : `packages/ds/src/composables/Parallax/parallax.composable.ts`

**Consommateurs** (3) : `components/Parallax/OrigamParallax.vue`, `consts/Parallax/parallax-layer.const.ts`, `interfaces/Parallax/parallax.interface.ts`

## `useParallaxTransform`

```ts
export function useParallaxTransform (props: IParallaxElementProps)
```

Traduit une position de defilement en declaration `transform` pour un
`<origam-parallax-element>`, selon son `type` : `translate`, `rotate`,
`scale`, `depth` et `depth-inv`.

⛔ Les deux types de profondeur forcent `Math.abs(strength)`. Une force
negative y serait contradictoire — c'est `depth-inv` qui porte l'inversion,
pas le signe — et laisserait deux facons d'exprimer la meme chose, dont une
qui annulerait l'autre.

**Source** : `packages/ds/src/composables/Parallax/transform.composable.ts`

**Consommateurs** (2) : `components/Parallax/OrigamParallaxElement.vue`, `consts/Parallax/parallax-element.const.ts`

