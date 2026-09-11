# OrigamWindowYTranslate

`<OrigamWindowYTranslate>` is the **vertical pane swap** for
`<OrigamWindow>`. New pane enters from below
(`translateY(100%)`) and previous one leaves above
(`translateY(-100%)`).

Use for vertical step-throughs (wizards, "next chapter", upward
scroll-style page transitions).

## Basic usage

```vue
<template>
    <OrigamWindowYTranslate>
        <slot />
    </OrigamWindowYTranslate>
</template>
```

## CSS classes emitted

```
origam-transition--window-y-translate-enter-from { transform: translateY(100%); }
origam-transition--window-y-translate-leave-to   { transform: translateY(-100%); }
origam-transition--window-y-translate-*-active   { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
origam-transition--window-y-translate-leave-from,
origam-transition--window-y-translate-leave-to   { position: absolute; top: 0; width: 100%; }
```

## Props

`ITransitionProps` — `name`, `disabled`. Reads from the
`ORIGAM_WINDOW_KEY` context.

## Notes

- Parent must be `position: relative` with a constrained height.
- Use `OrigamWindowYReverseTranslate`
  for the back / previous direction.
