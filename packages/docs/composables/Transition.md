# Composables — Transition

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

3 symbole(s) exporte(s).

## `useCssTransition`

```ts
export function useCssTransition (props: ITransitionProps)
```

CSS-driven transition wiring (leaveAbsolute / hideOnLeave / origin
hooks) for a plain `<transition>` / `<transition-group>` — delegates
the disabled/name resolution to `useTransition` rather than
duplicating it. `useWindowTransition` is the height-tracking sibling
of this hook and lives in its own file.

**Source** : `packages/ds/src/composables/Transition/cssTransition.composable.ts`

**Consommateurs** (10) : `components/Transition/OrigamExpandX.vue`, `components/Transition/OrigamExpandY.vue`, `components/Transition/OrigamFade.vue`, `components/Transition/OrigamReverseTranslatePicker.vue`, `components/Transition/OrigamScaleRotate.vue`, `components/Transition/OrigamSlideX.vue`, `components/Transition/OrigamSlideY.vue`, `components/Transition/OrigamSnack.vue`, …

## `useTransition`

```ts
export function useTransition (props: ITransitionProps)
```

Base transition-name resolver: turns the `disabled` prop into an
empty transition name so the `<transition>` / `<transition-group>`
wrapper effectively no-ops without the consumer having to branch.
`useCssTransition` and `useWindowTransition` both delegate to this
hook rather than duplicating the disabled/name derivation.

**Source** : `packages/ds/src/composables/Transition/transition.composable.ts`

**Consommateurs** (1) : `components/Transition/OrigamTransition.vue`

## `useWindowTransition`

```ts
export function useWindowTransition (props: ITransitionProps)
```

Height-tracking transition wiring for a windowed container (e.g. a
multi-step form / carousel) — measures and freezes the container
height across the transition so intermediate steps don't jump.
Delegates the disabled/name resolution to `useTransition` rather
than duplicating it. `useCssTransition` is the CSS-only sibling of
this hook and lives in its own file.

**Source** : `packages/ds/src/composables/Transition/windowTransition.composable.ts`

**Consommateurs** (4) : `components/Transition/OrigamWindowXReverseTranslate.vue`, `components/Transition/OrigamWindowXTranslate.vue`, `components/Transition/OrigamWindowYReverseTranslate.vue`, `components/Transition/OrigamWindowYTranslate.vue`

