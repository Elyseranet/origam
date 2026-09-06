# Composables — InlineEdit

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useInlineEdit`

```ts
export function useInlineEdit ( modelValue: Ref<string | number> | ComputedRef<string | number>, options: MaybeRefOrGetter<IUseInlineEditOptions> =
```

Headless edit-in-place state machine.

The composable owns the four states — IDLE / EDITING / VALIDATING /
ERROR — and the four transitions: `edit`, `confirm`, `cancel`,
`setValue`. It is **input-agnostic** (no DOM references) and only
reads the v-model value through the passed-in `Ref`. Components
plug their `<input>` value/oninput on the returned `draft` ref and
forward keyboard events to `confirm` / `cancel`.

**Exemple**

```ts
const model = ref('hello')
const {
    isEditing, draft, error, isPending,
    edit, confirm, cancel, setValue
} = useInlineEdit(model, {
    validate: (v) => v.length >= 3 || 'Min 3 chars',
    onConfirm: (v) => (model.value = v),
})
```

**Source** : `packages/ds/src/composables/InlineEdit/inline-edit.composable.ts`

**Consommateurs** (2) : `components/InlineEdit/OrigamInlineEdit.vue`, `interfaces/InlineEdit/inline-edit.interface.ts`

