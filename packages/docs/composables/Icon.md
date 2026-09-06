# Composables — Icon

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

3 symbole(s) exporte(s).

## `createIcons`

```ts
export function createIcons (options?: TIconOptions)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Icon/icon.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Icon/icon.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `useIcon`

```ts
export const useIcon = (props: Ref<TIcon | undefined>)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Icon/icon.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Icon/icon.composable.ts`

**Consommateurs** (1) : `components/Icon/OrigamIcon.vue`

## `useIconAccessibility`

```ts
export function useIconAccessibility ()
```

⛔ issue #427 — shared `aria-hidden` / `role` contract for every icon
leaf (`OrigamIcon`, `OrigamClassIcon`, `OrigamComponentIcon`,
`OrigamLigatureIcon`). A glyph is decorative by default
(`aria-hidden="true"`, no `role`) — the moment a consumer attaches a
click handler it becomes an interactive control
(`aria-hidden="false"`, `role="button"`), matching the semantics an
icon-only button needs.

"No ARIA is better than bad ARIA" — a `role="button"` with no
accessible name is worse than no role at all: it promises a control
a screen reader user cannot identify. This hook does not fabricate a
label (a guessed "icon button" string would itself be bad ARIA); it
surfaces the gap as a dev-time warning when the consumer attached a
click handler but supplied neither `aria-label` nor
`aria-labelledby`, mirroring the same defect already found on
`OrigamFileFieldListItem` (#418).

Reads `$attrs` only (`onClick`, `aria-label`, `aria-labelledby`) —
never a themable prop — so this carries no ADR-005 lazy-read
obligation. `useAttrs()` is safe to call from within a composable:
it resolves against whichever component is currently mid-`setup()`,
regardless of how many function calls deep it's invoked from.

**Source** : `packages/ds/src/composables/Icon/iconAccessibility.composable.ts`

**Consommateurs** (5) : `components/Icon/OrigamClassIcon.vue`, `components/Icon/OrigamComponentIcon.vue`, `components/Icon/OrigamIcon.vue`, `components/Icon/OrigamLigatureIcon.vue`, `utils/Commons/color.util.ts`

