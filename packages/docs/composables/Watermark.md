# Composables — Watermark

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useWatermark`

```ts
export function useWatermark ( options: MaybeRefOrGetter<IUseWatermarkOptions> =
```

Headless watermark composable. Returns the data-URL pattern (for
consumers who want to bind it manually via `:style`) plus
`install()` / `uninstall()` helpers for programmatic use without
mounting `<OrigamWatermark>`.

The composable is SSR-safe — pure-string SVG construction, no DOM
access. `install()` short-circuits when `document` is undefined.

**Exemple**

```ts
const { patternUrl, install, uninstall } = useWatermark({
    text: 'CONFIDENTIAL — john.doe@example.com',
    opacity: 0.08,
    angle: -30,
    gap: 120
})
onMounted(() => install(document.body))
onBeforeUnmount(() => uninstall())
```

**Source** : `packages/ds/src/composables/Watermark/watermark.composable.ts`

**Consommateurs** (2) : `components/Watermark/OrigamWatermark.vue`, `interfaces/Watermark/watermark.interface.ts`

