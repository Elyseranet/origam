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

## Props

`ITransitionProps` — `name`, `disabled`, `group`, `hideOnLeave`,
`leaveAbsolute`, `origin`.

## Notes

- `group` switches to `<TransitionGroup>` for animated lists.
- Combine with `<OrigamFade>` for cross-fade on identical horizontal
  positions.
