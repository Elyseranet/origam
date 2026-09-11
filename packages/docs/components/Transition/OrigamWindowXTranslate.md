# OrigamWindowXTranslate

`<OrigamWindowXTranslate>` is the **horizontal pane swap** used by
`<OrigamWindow>`. The new pane enters from the right
(`translateX(100%)`) and the previous one leaves to the left
(`translateX(-100%)`). Unlike `<OrigamTranslatePicker>`, this transition
is wired to the `OrigamWindow` provide / inject pair and tracks
`transitionCount` so the parent can animate height changes.

## Basic usage

```vue
<template>
    <OrigamWindowXTranslate>
        <slot />
    </OrigamWindowXTranslate>
</template>
```

Typically consumed indirectly through an `<OrigamWindow>` with
`direction="horizontal"`.

## CSS classes emitted

```
origam-transition--window-x-translate-enter-active,
origam-transition--window-x-translate-leave-active { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
origam-transition--window-x-translate-enter-from   { transform: translateX(100%); }
origam-transition--window-x-translate-leave-to     { transform: translateX(-100%); }
origam-transition--window-x-translate-leave-from,
origam-transition--window-x-translate-leave-to     { position: absolute; top: 0; width: 100%; }
```

## Props

`ITransitionProps` — `name`, `disabled`. Reads from the
`ORIGAM_WINDOW_KEY` context if available.

## Notes

- The parent must be `position: relative` and have constrained width.
- Use `OrigamWindowXReverseTranslate`
  for the back / previous direction.
