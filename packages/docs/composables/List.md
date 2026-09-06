# Composables — List

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `useCreateList`

```ts
export function useCreateList ()
```

Root of a list — tracks whether any item registered a prepend/append slot (so the list can reserve gutter space consistently across all its items) and provides `ORIGAM_LIST_KEY` for `useList` consumers. Independent from `useList` at the call level (no direct function dependency) — the two only share the `ORIGAM_LIST_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/List/createList.composable.ts`

**Consommateurs** (2) : `components/List/OrigamList.vue`, `components/List/OrigamListChildren.vue`

## `useList`

```ts
export function useList ()
```

Reads the nearest `ORIGAM_LIST_KEY` injection provided by `useCreateList`, or `null` when rendered outside a list. Independent from `useCreateList` at the call level (no direct function dependency) — the two only share the `ORIGAM_LIST_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/List/list.composable.ts`

**Consommateurs** (2) : `components/List/OrigamListGroup.vue`, `components/List/OrigamListItem.vue`

