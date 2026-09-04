# OrigamWindowXReverseTranslate

The mirror of `<OrigamWindowXTranslate>`. New pane enters from the
**left** (`translateX(-100%)`); previous pane leaves to the **right**
(`translateX(100%)`). Use this for the "back" direction in an
`<OrigamWindow direction="horizontal">`.

## Basic usage

```vue
<template>
    <OrigamWindowXReverseTranslate>
        <slot />
    </OrigamWindowXReverseTranslate>
</template>
```

## CSS classes emitted

```
origam-transition--window-x-reverse-translate-enter-from { transform: translateX(-100%); }
origam-transition--window-x-reverse-translate-leave-to   { transform: translateX(100%); }
origam-transition--window-x-reverse-translate-*-active   { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
```

## Props

`ITransitionNoOriginProps` (`ITransitionProps` minus `origin`) — `name`,
`disabled`. Reads from the `ORIGAM_WINDOW_KEY` context.

⛔ **`origin` was removed (breaking change, #538/#548).** This transition
only ever animates a plain `translate(...)` — `transform-origin` has
nothing to anchor on and never produced any observable effect. Consumers
passing `origin` now get a compile-time TypeScript error rather than a
silent no-op.

## Notes

- Always paired with `<OrigamWindowXTranslate>`; the direction is
  picked at runtime based on the user's navigation intent.
