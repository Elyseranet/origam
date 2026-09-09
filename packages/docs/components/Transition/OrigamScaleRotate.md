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

## Props

Inherits `ITransitionProps` — `name`, `disabled`, `group`, `hideOnLeave`,
`leaveAbsolute`, `origin`.

## Notes

- The default `transform-origin` is the element's center. Override via
  the `origin` prop to anchor the scale (e.g. `top right`).
- For grouped lists, set `group` to enable `<TransitionGroup>`.

## Related

- `OrigamFade` — pure opacity transition.
- `OrigamTranslateScale` — translate + scale,
  optionally driven by a target rect.
