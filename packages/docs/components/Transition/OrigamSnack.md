# OrigamSnack

`<OrigamSnack>` is a quick "pop-in then fade" used for snackbars and
toasts. It enters at `transform: scale(0.8); opacity: 0` and lands at
identity, with a short **0.15s** decelerate easing.

## Basic usage

```vue
<template>
    <OrigamSnack>
        <Snackbar v-if="visible">{{ message }}</Snackbar>
    </OrigamSnack>
</template>
```

## CSS classes emitted

```
origam-transition--snack-enter-from   { opacity: 0; transform: scale(.8); }
origam-transition--snack-enter-active { transition: .15s cubic-bezier(0,0,.2,1); }
origam-transition--snack-leave-active { transition: .15s cubic-bezier(0,0,.2,1); }
origam-transition--snack-leave-to     { opacity: 0; }
```

The leave path is opacity-only — perfect for stacked toasts where the
next item slots into the spot the leaver vacates.

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--snack-enter-active---transition-duration` | `var(--origam-motion__duration---normal)` |
| `--origam-transition--snack-enter-active---transition-timing-function` | `var(--origam-motion__easing---decelerate)` |
| `--origam-transition--snack-leave-active---transition-duration` | `var(--origam-motion__duration---normal)` |
| `--origam-transition--snack-leave-active---transition-timing-function` | `var(--origam-motion__easing---decelerate)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--snack-enter-active---transition-duration: 0.15s;
}
```

## Props

`ITransitionProps` — `name`, `disabled`, `group`.

## Notes

- Pair with `<OrigamSnackbar>` for the canonical implementation.
- `group` enables stacked toast lists.

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
