# OrigamReverseTranslatePicker

The mirror of `<OrigamTranslatePicker>`: the new item slides in from
the **left** (`translate(-100%, 0)`) and the previous one leaves to the
right (`translate(100%, 0)`).

Use for "go back" style transitions where the user moves earlier in a
sequence (e.g. previous month in a date picker).

## Basic usage

```vue
<template>
    <OrigamReverseTranslatePicker>
        <Page :key="currentPage" />
    </OrigamReverseTranslatePicker>
</template>
```

## CSS classes emitted

```
origam-transition--reverse-translate-picker-enter-from { transform: translate(-100%, 0); opacity: 0; }
origam-transition--reverse-translate-picker-leave-to   { transform: translate(100%, 0);  opacity: 0; }
origam-transition--reverse-translate-picker-leave-*    { position: absolute !important; }
origam-transition--reverse-translate-picker-*-active   { transition: 0.3s standard; }
```

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--reverse-translate-picker-enter-active---transition-duration` | `0.3s` |
| `--origam-transition--reverse-translate-picker-enter-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--reverse-translate-picker-leave-active---transition-duration` | `0.3s` |
| `--origam-transition--reverse-translate-picker-leave-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--reverse-translate-picker-move---transition-duration` | `0.3s` |
| `--origam-transition--reverse-translate-picker-move---transition-timing-function` | `var(--origam-motion__easing---standard)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--reverse-translate-picker-enter-active---transition-duration: 0.15s;
}
```

## Props

`ITransitionProps` — `name`, `disabled`.

## Notes

- Pair with `<OrigamTranslatePicker>` and switch direction based on the
  user's intent (forward / backward).

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
