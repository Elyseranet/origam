# OrigamReverseTranslatePicker

The mirror of `<OrigamTranslatePicker>`: the new item slides in from
the **left** (`translate(-100%, 0)`) and the previous one leaves to the
right (`translate(100%, 0)`).

Use for "go back" style transitions where the user moves earlier in a
sequence (e.g. previous month in a date picker).

## Basic usage

```vue
<template>
    <OrigamReverseTranslatePicker>
        <Page :key="currentPage" />
    </OrigamReverseTranslatePicker>
</template>
```

## CSS classes emitted

```
origam-transition--reverse-translate-picker-enter-from { transform: translate(-100%, 0); opacity: 0; }
origam-transition--reverse-translate-picker-leave-to   { transform: translate(100%, 0);  opacity: 0; }
origam-transition--reverse-translate-picker-leave-*    { position: absolute !important; }
origam-transition--reverse-translate-picker-*-active   { transition: 0.3s standard; }
```

## Props

`ITransitionProps` — `name`, `disabled`.

## Notes

- Pair with `<OrigamTranslatePicker>` and switch direction based on the
  user's intent (forward / backward).
