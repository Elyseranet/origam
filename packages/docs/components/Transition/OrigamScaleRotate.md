# OrigamScaleRotate

`<OrigamScaleRotate>` enters by scaling from `0` while rotating `-45deg`,
and leaves by fading out. Perfect for menu icons, FABs, or any element
that benefits from a small "pop in" gesture.

## Basic usage

```vue
<template>
    <OrigamScaleRotate>
        <Icon v-if="show" name="add" />
    </OrigamScaleRotate>
</template>
```

## CSS classes emitted

`origam-transition--scale-rotate-enter-from` starts at
`transform: scale(0) rotate(-45deg); opacity: 0`. The `enter-to` and
`leave-from` states are at `transform: none; opacity: 1`.

| Class | Property |
|---|---|
| `origam-transition--scale-rotate-enter-active` | `transition: 0.3s` |
| `origam-transition--scale-rotate-leave-active` | `transition: 0.3s` |
| `origam-transition--scale-rotate-move` | `transition: transform 0.5s` |

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--scale-rotate-enter-active---transition-duration` | `0.3s` |
| `--origam-transition--scale-rotate-enter-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--scale-rotate-leave-active---transition-duration` | `0.3s` |
| `--origam-transition--scale-rotate-leave-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--scale-rotate-move---transition-duration` | `0.5s` |
| `--origam-transition--scale-rotate-move---transition-timing-function` | `var(--origam-motion__easing---standard)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--scale-rotate-enter-active---transition-duration: 0.15s;
}
```

## Props

Inherits `ITransitionProps` — `name`, `disabled`, `group`, `hideOnLeave`,
`leaveAbsolute`, `origin`.

## Notes

- The default `transform-origin` is the element's center. Override via
  the `origin` prop to anchor the scale (e.g. `top right`).
- For grouped lists, set `group` to enable `<TransitionGroup>`.

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

## Related

- `OrigamFade` — pure opacity transition.
- `OrigamTranslateScale` — translate + scale,
  optionally driven by a target rect.
