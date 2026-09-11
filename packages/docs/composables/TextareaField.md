# Composables — TextareaField

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useTextareaRich`

```ts
export function useTextareaRich(options: IUseTextareaRichOptions)
```

Owns the runtime contract of the rich-text textarea:

 - mounts a `contenteditable` host (caller binds the returned ref);
 - applies formatting commands via `document.execCommand` (the simplest
   contenteditable API still supported by all evergreen browsers — we
   deliberately avoid Selection / Range hand-rolling to keep the
   surface tiny without an external library);
 - tracks the active formatting state at the caret via
   `document.queryCommandState` for the toolbar UI;
 - sanitises every emit so the consumer's `v-model` can never carry
   a `<script>` or a `javascript:` href;
 - registers Cmd/Ctrl keyboard shortcuts (B / I / U / K / E and the
   list shortcuts) on the host.

`execCommand` is "deprecated" by spec but stays the only first-party
way to do this without a 100 KB library; we accept the tradeoff and
document the limitations (no IME-safe undo stack, no granular
collaborative cursor) downstream.

**Source** : `packages/ds/src/composables/TextareaField/textarea-field-rich.composable.ts`

**Consommateurs** (3) : `components/TextareaField/OrigamTextareaField.vue`, `enums/TextareaField/textarea-field-rich-toolbar.enum.ts`, `interfaces/TextareaField/textarea-field-rich.interface.ts`

