# Composables — Clipboard

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useClipboard`

```ts
export function useClipboard (options: IUseClipboardOptions =
```

Headless clipboard composable. Wraps the modern Clipboard API + a
legacy execCommand fallback and exposes a self-resetting `copied`
flag so consumers don't have to wire the timeout themselves.

**Exemple**

```ts
const { copy, copied, error, isSupported } = useClipboard({ feedbackDuration: 2000 })

await copy('hello world')
// copied.value === true for 2000ms, then auto-resets to false
```

**Source** : `packages/ds/src/composables/Clipboard/clipboard.composable.ts`

**Consommateurs** (4) : `components/Clipboard/OrigamClipboard.vue`, `components/Code/OrigamCode.vue`, `consts/Clipboard/clipboard.const.ts`, `interfaces/Clipboard/clipboard.interface.ts`

