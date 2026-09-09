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

`ITransitionNoOriginProps` — `ITransitionProps` minus `origin`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'origam-transition--fade'` | Transition class prefix. Override to swap the whole animation. |
| `mode` | `'in-out' \| 'out-in' \| 'default'` | `undefined` | Vue's transition ordering. **Only bound when `group` is `false`.** See below. |
| `disabled` | `boolean` | `false` | Turns CSS off (`:css="false"`); the JS hooks below stay bound. |
| `group` | `boolean` | `false` | Renders `<TransitionGroup>` instead of `<Transition>`, for a keyed list. |
| `hideOnLeave` | `boolean` | `false` | Sets `display: none !important` on the leaving element at the start of the leave phase (`useCssTransition`'s `onLeave` hook). |
| `leaveAbsolute` | `boolean` | `false` | Freezes the leaving element's box (`position: absolute` + its measured top/left/width/height) for the leave phase, then restores the original inline styles on `onAfterLeave`. Keeps siblings from reflowing mid-animation. |

### `mode` and `group`

`mode` is a prop of Vue's `<Transition>` only — Vue does **not** declare
it on `<TransitionGroup>`. So `useCssTransition` binds it exclusively on
the `group: false` path, and drops the key entirely (rather than passing
`undefined`) on the `group: true` path, because a present-but-undefined
key still raises Vue's *Extraneous non-props attributes* warning.

⛔ Until 2026-09-07 that condition was **inverted** (`if (props.group)`):
`mode` was bound only on `TransitionGroup`, which cannot read it, and
never on `Transition`, which can. The prop was therefore dead for every
component going through this hook. Fixed under #550 (C7); pinned by
`packages/tests/TU/composables/transition-mode-binding.spec.ts`.

⛔ **`origin` was removed (breaking change, #538/#548).** It set
`transform-origin`, which is meaningless for an opacity-only animation
(no `transform: scale(...)` anywhere in this component) — the prop was
declared but never produced any observable effect. Consumers passing
`origin` now get a compile-time TypeScript error rather than a silent
no-op (verified with an isolated `tsc --strict` probe).

## Emits

None. `ITransitionEmits` is empty — no member of the transition family
calls `emit()`; they only wire Vue's native enter / leave hooks
internally.

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The faded content. Unscoped. |

## Accessibility

Respect `prefers-reduced-motion` upstream: pass `disabled` when the user
opts into reduced motion to skip the opacity ramp.

## Related

- `OrigamSlideX` / `OrigamSlideY`
- `OrigamScaleRotate`
