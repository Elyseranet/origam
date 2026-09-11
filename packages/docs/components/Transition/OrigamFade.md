# OrigamFade

`<OrigamFade>` cross-fades its slot via opacity transitions. It is the
default transition used by `<OrigamTransition>` and the bread-and-butter
animation for tooltips, dropdowns, and overlays.

## Basic usage

```vue
<template>
    <OrigamFade>
        <div v-if="show">…</div>
    </OrigamFade>
</template>
```

## Group mode

Set `group` to render a `<TransitionGroup>` instead of a single
`<Transition>`. Useful for animated lists.

```vue
<template>
    <OrigamFade group>
        <div v-for="item in items" :key="item.id">{{ item.label }}</div>
    </OrigamFade>
</template>
```

## CSS classes emitted

| Class | Phase |
|---|---|
| `origam-transition--fade-enter-from` | initial state on enter |
| `origam-transition--fade-enter-active` | during enter |
| `origam-transition--fade-enter-to` | final state on enter |
| `origam-transition--fade-leave-from` | initial state on leave |
| `origam-transition--fade-leave-active` | during leave |
| `origam-transition--fade-leave-to` | final state on leave |
| `origam-transition--fade-move` | reorder (group mode) |

Default `transition-duration` is **0.3s** with the standard easing
`cubic-bezier(0.4, 0, 0.2, 1)`.

## Props

```ts
interface ITransitionProps {
    mode?: 'in-out' | 'out-in' | 'default'
    disabled?: boolean
    name?: string                // override the BEM name
    group?: boolean              // → TransitionGroup
    hideOnLeave?: boolean
    leaveAbsolute?: boolean
    origin?: string              // transformOrigin
}
```

## Accessibility

Respect `prefers-reduced-motion` upstream: pass `disabled` when the user
opts into reduced motion to skip the opacity ramp.

## Related

- `OrigamSlideX` / `OrigamSlideY`
- `OrigamScaleRotate`
