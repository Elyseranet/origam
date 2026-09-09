# OrigamSlideY

`<OrigamSlideY>` enters from `translateY(-15px)` and fades in. Leaving
reverses the path. The vertical slide is intentionally subtle — for
full-pane vertical slides, use `<OrigamWindowYTranslate>`.

## Basic usage

```vue
<template>
    <OrigamSlideY>
        <Banner v-if="visible">…</Banner>
    </OrigamSlideY>
</template>
```

## CSS classes emitted

```
origam-transition--slide-y-{enter|leave}-{from|active|to}
origam-transition--slide-y-move
```

`enter-active` / `leave-active` use `transition: 0.3s
cubic-bezier(0.4, 0, 0.2, 1)` on `transform, opacity`.

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--slide-y-enter-active---transition-duration` | `0.3s` |
| `--origam-transition--slide-y-enter-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--slide-y-leave-active---transition-duration` | `0.3s` |
| `--origam-transition--slide-y-leave-active---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-transition--slide-y-move---transition-duration` | `0.5s` |
| `--origam-transition--slide-y-move---transition-timing-function` | `var(--origam-motion__easing---standard)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--slide-y-enter-active---transition-duration: 0.15s;
}
```

## Props

`ITransitionProps` — `name`, `disabled`, `group`, `hideOnLeave`,
`leaveAbsolute`, `origin`.

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
