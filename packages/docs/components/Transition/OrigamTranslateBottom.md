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

`ITransitionProps` — `name`, `disabled`.

## Notes

- The transform offset is viewport-relative (`50vh`), so the slot enters
  from off-screen regardless of its rendered position.
- Pair with `<OrigamFade>` if you also want a backdrop opacity ramp.
