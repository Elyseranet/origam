# Composables — List

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

2 symbole(s) exporte(s).

## `useCreateList`

```ts
export function useCreateList (itemRole?: ComputedRef<TListItemRole>)
```

Root of a list — tracks whether any item registered a prepend/append
slot (so the list can reserve gutter space consistently across all
its items), publishes the ARIA role its rows must carry, and provides
`ORIGAM_LIST_KEY` for `useList` consumers. Independent from `useList`
at the call level (no direct function dependency) — the two only
share the `ORIGAM_LIST_KEY` provide/inject contract.

@param itemRole
The row role for the list being created, passed ONLY by the component
that owns the mode (`<OrigamList>`). Every other caller —
`<OrigamListChildren>`, which re-provides a scope for its own rows —
omits it and INHERITS the role its ancestor list published. Without
that inheritance a nested renderer would silently reset every row of
a `listbox` back to `listitem`.

The published `itemRole` stays a lazy `computed` on both branches: the
mode derives from props, and ADR-005 writes theme-resolved props AFTER
`setup()`. Resolving it eagerly here would snapshot the pre-theme
value, and nothing would warn.

**Source** : `packages/ds/src/composables/List/createList.composable.ts`

**Consommateurs** (2) : `components/List/OrigamList.vue`, `components/List/OrigamListChildren.vue`

## `useList`

```ts
export function useList ()
```

Reads the nearest `ORIGAM_LIST_KEY` injection provided by
`useCreateList`, or `null` when rendered outside a list.
Independent from `useCreateList` at the call level (no direct
function dependency) — the two only share the `ORIGAM_LIST_KEY`
provide/inject contract.

**Source** : `packages/ds/src/composables/List/list.composable.ts`

**Consommateurs** (2) : `components/List/OrigamListGroup.vue`, `components/List/OrigamListItem.vue`

