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

`ITransitionProps` — `name`, `disabled`. Reads from the
`ORIGAM_WINDOW_KEY` context.

## Notes

- Always paired with `<OrigamWindowXTranslate>`; the direction is
  picked at runtime based on the user's navigation intent.
