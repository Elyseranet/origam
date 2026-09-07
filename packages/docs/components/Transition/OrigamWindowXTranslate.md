# OrigamWindowXTranslate

`<OrigamWindowXTranslate>` is the **horizontal pane swap** used by
`<OrigamWindow>`. The new pane enters from the right
(`translateX(100%)`) and the previous one leaves to the left
(`translateX(-100%)`). Unlike `<OrigamTranslatePicker>`, this transition
is wired to the `OrigamWindow` provide / inject pair and tracks
`transitionCount` so the parent can animate height changes.

## Basic usage

```vue
<template>
    <OrigamWindowXTranslate>
        <slot />
    </OrigamWindowXTranslate>
</template>
```

Typically consumed indirectly through an `<OrigamWindow>` with
`direction="horizontal"`.

## CSS classes emitted

```
origam-transition--window-x-translate-enter-active,
origam-transition--window-x-translate-leave-active { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
origam-transition--window-x-translate-enter-from   { transform: translateX(100%); }
origam-transition--window-x-translate-leave-to     { transform: translateX(-100%); }
origam-transition--window-x-translate-leave-from,
origam-transition--window-x-translate-leave-to     { position: absolute; top: 0; width: 100%; }
```

## Props

`ITransitionWindowProps` — `ITransitionProps` minus `origin`,
`hideOnLeave` and `leaveAbsolute` (see the removals below). The component
also reads the `ORIGAM_WINDOW_KEY` context when one is provided; that
context arrives by `inject`, never as a prop.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'origam-transition--window-x-translate'` | Transition class prefix. Override to swap the whole animation for a bespoke one. |
| `mode` | `'in-out' \| 'out-in' \| 'default'` | `undefined` | Vue's transition ordering. **Only bound when `group` is `false`** — Vue does not declare `mode` on `TransitionGroup`, so it is dropped from the vnode entirely on the `group` path rather than passed as `undefined` (which would still raise the *Extraneous non-props attributes* warning). |
| `disabled` | `boolean` | `false` | Turns CSS off (`:css="false"`). The height-tracking JS hooks stay bound either way. |
| `group` | `boolean` | `false` | Renders `<TransitionGroup>` instead of `<Transition>`, for a keyed list. |

## Emits

None. `ITransitionEmits` is empty — no member of the transition family
calls `emit()`; they only wire Vue's native enter / leave hooks
internally.

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The transitioned content. Unscoped. |

## Removed props

⛔ **`origin` was removed (breaking change, #538/#548).** This transition
only ever animates a plain `translate(...)` — `transform-origin` has
nothing to anchor on and never produced any observable effect.

⛔ **`hideOnLeave` and `leaveAbsolute` were removed (#550).** Both are
implemented by `useCssTransition`'s JS hooks; this component goes through
`useWindowTransition`, whose hooks do height tracking and read neither
name. Declaring them here was a promise nothing kept.

> These three names now raise a compile-time TypeScript error instead of
> being silent no-ops. That was **not** true until 2026-09-07: a stale
> second declaration of `ITransitionWindowProps` sat higher in
> `transition.interface.ts`, and TypeScript's interface **declaration
> merging** unions the `extends` clauses of same-named declarations — so
> the `Omit` was neutralised and `{ origin, hideOnLeave, leaveAbsolute }`
> compiled clean. The duplicate has been deleted; verified with an
> isolated `tsc --strict` probe (4 `TS2353` errors after, 0 before).

## Notes

- The parent must be `position: relative` and have constrained width.
- Use `OrigamWindowXReverseTranslate`
  for the back / previous direction.
