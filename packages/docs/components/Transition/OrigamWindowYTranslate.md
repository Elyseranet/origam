# OrigamWindowYTranslate

`<OrigamWindowYTranslate>` is the **vertical pane swap** for
`<OrigamWindow>`. New pane enters from below
(`translateY(100%)`) and previous one leaves above
(`translateY(-100%)`).

Use for vertical step-throughs (wizards, "next chapter", upward
scroll-style page transitions).

## Basic usage

```vue
<template>
    <OrigamWindowYTranslate>
        <slot />
    </OrigamWindowYTranslate>
</template>
```

## CSS classes emitted

```
origam-transition--window-y-translate-enter-from { transform: translateY(100%); }
origam-transition--window-y-translate-leave-to   { transform: translateY(-100%); }
origam-transition--window-y-translate-*-active   { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
origam-transition--window-y-translate-leave-from,
origam-transition--window-y-translate-leave-to   { position: absolute; top: 0; width: 100%; }
```

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--window-y-translate-enter-active---transition-duration` | `0.3s` |
| `--origam-transition--window-y-translate-enter-active---transition-timing-function` | `cubic-bezier(0.25, 0.8, 0.5, 1)` |
| `--origam-transition--window-y-translate-leave-active---transition-duration` | `0.3s` |
| `--origam-transition--window-y-translate-leave-active---transition-timing-function` | `cubic-bezier(0.25, 0.8, 0.5, 1)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--window-y-translate-enter-active---transition-duration: 0.15s;
}
```

## Props

`ITransitionWindowProps` — `ITransitionProps` minus `origin`,
`hideOnLeave` and `leaveAbsolute` (see the removals below). The component
also reads the `ORIGAM_WINDOW_KEY` context when one is provided; that
context arrives by `inject`, never as a prop.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'origam-transition--window-y-translate'` | Transition class prefix. Override to swap the whole animation for a bespoke one. |
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

- Parent must be `position: relative` with a constrained height.
- Use `OrigamWindowYReverseTranslate`
  for the back / previous direction.

## Accessibility

Reduced motion is handled by the component itself — you do NOT need to pass
`disabled` from a `matchMedia` listener. Every member of the family emits a
`@media (prefers-reduced-motion: reduce)` block (shared `ds-reduced-motion`
mixin, issue #494) that collapses the duration to `0.01ms`.

That override wins over the CSS variables above, deliberately: it zeroes the
PROPERTY, not the variable, so a theme or a per-instance duration cannot
resurrect the motion for a user who asked for none. Verified in Chromium —
setting a 9 s duration through the token under `prefers-reduced-motion:
reduce` still measures `0.01ms`.

`disabled` remains available for the unrelated case of skipping the
transition on purpose.
