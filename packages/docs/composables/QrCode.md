# Composables — QrCode

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `__clearQrCodeCache`

```ts
export function __clearQrCodeCache (): void
```

Test helper — clears the module-level matrix LRU. Exposed for the
unit-test suite and not advertised publicly.

**Source** : `packages/ds/src/composables/QrCode/qr-code.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useQrCode`

```ts
export function useQrCode ( value: MaybeRefOrGetter<string>, options: MaybeRefOrGetter<IUseQrCodeOptions> =
```

Headless QR-code composable. Encodes `value` through
`qrcode-generator` (Reed-Solomon + matrix masking handled by the
library) and rebuilds an SVG fragment on every reactive change.

The composable is SSR-safe — no DOM API is touched, the encoder is
pure JS, and the SVG string is suitable for `v-html` on both client
and server.

**Exemple**

```ts
const value = ref('https://origam.dev')
const { svg, modules, size } = useQrCode(value, {
    errorCorrectionLevel: 'M',
    foreground: '#000',
    background: '#fff'
})
```

**Source** : `packages/ds/src/composables/QrCode/qr-code.composable.ts`

**Consommateurs** (2) : `components/QrCode/OrigamQrCode.vue`, `interfaces/QrCode/qr-code.interface.ts`

