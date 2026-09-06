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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Parallax/transform.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Parallax/transform.composable.ts`

**Consommateurs** (2) : `components/Parallax/OrigamParallaxElement.vue`, `consts/Parallax/parallax-element.const.ts`

