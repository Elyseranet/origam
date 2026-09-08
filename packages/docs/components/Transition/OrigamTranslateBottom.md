# OrigamTranslateBottom

`<OrigamTranslateBottom>` enters from `translateY(calc(50vh + 50%))` —
the slot rises from below the viewport — and lands at the natural
position. Use for bottom sheets, mobile dialogs, action sheets, or any
content that should feel anchored to the bottom of the screen.

## Basic usage

```vue
<template>
    <OrigamTranslateBottom>
        <BottomSheet v-if="open">…</BottomSheet>
    </OrigamTranslateBottom>
</template>
```

## CSS classes emitted

```
origam-transition--translate-bottom-enter-active  { transition: 225ms decelerate; }
origam-transition--translate-bottom-leave-active  { transition: 125ms accelerate; }
origam-transition--translate-bottom-enter-from,
origam-transition--translate-bottom-leave-to     { transform: translateY(calc(50vh + 50%)); }
```

`pointer-events: none` is applied during the active phases so the user
doesn't tap a moving target.

## Props

`<OrigamTranslateBottom>` declares the whole shared `ITransitionProps`
surface and wires it through `useCssTransition`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'origam-transition--translate-bottom'` | Transition class prefix. Change it only to swap in your own keyframes. |
| `disabled` | `boolean` | `undefined` | Sets `css: false` on the underlying `<transition>`, so the enter / leave classes are never applied and the content mounts and unmounts instantly. |
| `group` | `boolean` | `undefined` | Render a `<transition-group>` instead of a `<transition>` — needed when the slot holds a keyed list rather than a single element. |
| `origin` | `string` | `undefined` | Written to `transform-origin` on the element in the `beforeEnter` hook. See the note below. |
| `hideOnLeave` | `boolean` | `undefined` | `display: none !important` on the leaving element for the whole leave phase. |
| `leaveAbsolute` | `boolean` | `undefined` | Freezes the leaving element's box (`position: absolute` at its measured `top` / `left` / `width` / `height`) so the remaining siblings don't reflow mid-transition. Restored in `afterLeave`. |
| `mode` | `TTransitionMode` | `undefined` | ⛔ **Declared but inert.** See the note below. |

`hideOnLeave`, `leaveAbsolute` and `origin` each guard on their own prop
inside the hook, and the hooks are bound unconditionally since #549 —
before that they were bound only while the transition was *disabled*, so
all three were dead in normal use.

## Emits

None. `ITransitionEmits` is empty for every member of the family — these
wrappers only wire the native Vue `<transition>` enter / leave hooks
internally.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | The transitioned content. With `group`, a keyed list. |

## Notes

- The transform offset is viewport-relative (`50vh`), so the slot enters
  from off-screen regardless of its rendered position.
- Pair with `<OrigamFade>` if you also want a backdrop opacity ramp.
- **`origin` sets the property but this transition has nothing to anchor
  on.** `transform-origin` changes where a `scale` or `rotate` pivots;
  the enter / leave keyframes here only `translateY`, which is
  origin-independent. It becomes visible only if your slotted content
  carries its own scale / rotate.
- ⛔ **`mode` has no effect on this component**, measured on the rendered
  tree rather than inferred. `useCssTransition` only forwards it on the
  `group` path (`if (props.group) bind.mode = props.mode`), and that is
  the one place it cannot work: Vue's `TransitionGroup` does not declare
  `mode` (`'mode' in TransitionGroup.props === false`), so it lands as an
  inert DOM attribute. On the default path the wrapper absorbs `mode` as
  a declared prop, so it never falls through to `<Transition>` — which
  *does* declare it. Observed markup:
  `<transition-stub name="origam-transition--translate-bottom" appear="false" persisted="false" css="true">`
  with `mode="out-in"` passed in. Use `<OrigamTransition>` or a plain
  `<transition mode="out-in">` when you need enter / leave ordering.
- `prefers-reduced-motion: reduce` collapses both phases to `0.01ms`
  through the `ds.ds-reduced-motion` SCSS mixin.
