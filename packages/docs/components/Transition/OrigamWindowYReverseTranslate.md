# OrigamWindowYReverseTranslate

The mirror of `<OrigamWindowYTranslate>`: new pane enters from **above**
(`translateY(-100%)`); previous pane leaves **below**
(`translateY(100%)`).

Use for the "previous" direction in a vertical
`<OrigamWindow direction="vertical">`.

## Basic usage

```vue
<template>
    <OrigamWindowYReverseTranslate>
        <slot />
    </OrigamWindowYReverseTranslate>
</template>
```

## CSS classes emitted

```
origam-transition--window-y-reverse-translate-enter-from { transform: translateY(-100%); }
origam-transition--window-y-reverse-translate-leave-to   { transform: translateY(100%); }
origam-transition--window-y-reverse-translate-*-active   { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
```

## Props

`ITransitionProps` — `name`, `disabled`. Reads from the
`ORIGAM_WINDOW_KEY` context.

## Notes

- Always paired with `<OrigamWindowYTranslate>`.
