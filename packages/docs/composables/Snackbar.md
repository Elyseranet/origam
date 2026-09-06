# Composables — Snackbar

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

3 symbole(s) exporte(s).

## `useCountdown`

```ts
export function useCountdown (milliseconds: number)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Snackbar/snackbar.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Snackbar/snackbar.composable.ts`

**Consommateurs** (1) : `consts/Snackbar/snackbar.const.ts`

## `useSnackbarGroup`

```ts
export function useSnackbarGroup (options: IUseSnackbarGroupOptions =
```

Public API. Returns an interface to push / pop items
from a named stack. The returned `items` ref is the
same reactive reference shared with the matching
`<OrigamSnackbarGroup id="…">` instance, so direct
mutation outside of `notify` / `dismiss` is discouraged.

The store singleton (`getStore` / `generateId` / `clearTimer`) lives
in `utils/Snackbar/snackbar-group.util.ts`, shared with
`useSnackbarGroupInternal` (own file) — both hooks address the same
per-id stack and must never own separate copies of it.

**Source** : `packages/ds/src/composables/Snackbar/snackbar-group.composable.ts`

**Consommateurs** (5) : `components/Snackbar/OrigamSnackbarGroup.vue`, `consts/Snackbar/snackbar-group.const.ts`, `interfaces/Snackbar/snackbar-group-item.interface.ts`, `interfaces/Snackbar/snackbar-group.interface.ts`, `utils/Snackbar/snackbar-group.util.ts`

## `useSnackbarGroupInternal`

```ts
export function useSnackbarGroupInternal (id: MaybeRefOrGetter<string> = SNACKBAR_GROUP_DEFAULT_ID)
```

`<OrigamSnackbarGroup>` needs a *writable* ref to the
items list (it reads them to render and the composable
mutates them). Exposed under a separate name so the
public `useSnackbarGroup` API stays read-only on
`items`. Components outside the library should never
import this.

Shares the store singleton (`getStore`) with `useSnackbarGroup` (own
file) via `utils/Snackbar/snackbar-group.util.ts` — both hooks
address the same per-id stack and must never own separate copies of
it.

`id` accepts a `MaybeRefOrGetter<string>` rather than a plain
`string` — see #469. The host component calls `getStore(props.id)`
indirectly through this composable; if `id` were captured as a
one-time snapshot at the top of `setup()`, a theme naming
`'origam-snackbar-group': { id: 'custom' }` would never be seen
(the ADR-005 theme-props resolver patches `instance.props` in
`beforeCreate`, which runs AFTER `setup()`). Resolving `toValue(id)`
lazily, INSIDE each returned accessor, defers the read to render
time, after the resolver has run, and also makes the store follow
`id` if it changes reactively later.

Deliberately NOT a single shared `computed(() => getStore(toValue(id)))`
memoized once and reused by every accessor below. The host component's
`watch(() => props.defaultDuration, …, { immediate: true })` calls
`registerDefaultDuration` SYNCHRONOUSLY during `setup()` — before the
ADR-005 resolver runs. A shared computed would be forced to evaluate
right then, permanently caching the PRE-theme store on `rawItems` too
(Vue's computed cache does not get invalidated by the resolver's
`defineProperty` patch). Each accessor below re-resolves the store
independently so an early, unavoidable read by one of them never
poisons the others.

**Source** : `packages/ds/src/composables/Snackbar/snackbarGroupInternal.composable.ts`

**Consommateurs** (3) : `components/Snackbar/OrigamSnackbarGroup.vue`, `interfaces/Snackbar/snackbar-group.interface.ts`, `utils/Snackbar/snackbar-group.util.ts`

