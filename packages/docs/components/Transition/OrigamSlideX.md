# OrigamSlideX

`<OrigamSlideX>` enters from `translateX(-15px)` and fades in. Leaving
reverses the path. The horizontal slide is intentionally subtle — for
larger window-style slides, use `<OrigamWindowXTranslate>` instead.

## Basic usage

```vue
<template>
    <OrigamSlideX>
        <Toast v-if="visible">…</Toast>
    </OrigamSlideX>
</template>
```

## CSS classes emitted

```
origam-transition--slide-x-{enter|leave}-{from|active|to}
origam-transition--slide-x-move
```

`enter-active` / `leave-active` use `transition: 0.3s
cubic-bezier(0.4, 0, 0.2, 1)` on `transform, opacity`.

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--slide-x-enter-active---transition-duration` | `0.3s` |
| `--origam-transition--slide-x-enter-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--slide-x-leave-active---transition-duration` | `0.3s` |
| `--origam-transition--slide-x-leave-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--slide-x-move---transition-duration` | `0.5s` |
| `--origam-transition--slide-x-move---transition-timing-function` | `var(--origam-motion__easing---standard)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--slide-x-enter-active---transition-duration: 0.15s;
}
```

## Props

`ITransitionProps` — `name`, `disabled`, `group`, `hideOnLeave`,
`leaveAbsolute`, `origin`.

## Notes

- `group` switches to `<TransitionGroup>` for animated lists.
- Combine with `<OrigamFade>` for cross-fade on identical horizontal
  positions.

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
