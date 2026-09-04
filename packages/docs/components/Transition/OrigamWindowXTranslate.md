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

`ITransitionNoOriginProps` (`ITransitionProps` minus `origin`) — `name`,
`disabled`. Reads from the `ORIGAM_WINDOW_KEY` context if available.

⛔ **`origin` was removed (breaking change, #538/#548).** This transition
only ever animates a plain `translate(...)` — `transform-origin` has
nothing to anchor on and never produced any observable effect. Consumers
passing `origin` now get a compile-time TypeScript error rather than a
silent no-op.

## Notes

- The parent must be `position: relative` and have constrained width.
- Use `OrigamWindowXReverseTranslate`
  for the back / previous direction.
