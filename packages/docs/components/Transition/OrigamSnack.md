# OrigamSnack

`<OrigamSnack>` is a quick "pop-in then fade" used for snackbars and
toasts. It enters at `transform: scale(0.8); opacity: 0` and lands at
identity, with a short **0.15s** decelerate easing.

## Basic usage

```vue
<template>
    <OrigamSnack>
        <Snackbar v-if="visible">{{ message }}</Snackbar>
    </OrigamSnack>
</template>
```

## CSS classes emitted

```
origam-transition--snack-enter-from   { opacity: 0; transform: scale(.8); }
origam-transition--snack-enter-active { transition: .15s cubic-bezier(0,0,.2,1); }
origam-transition--snack-leave-active { transition: .15s cubic-bezier(0,0,.2,1); }
origam-transition--snack-leave-to     { opacity: 0; }
```

The leave path is opacity-only — perfect for stacked toasts where the
next item slots into the spot the leaver vacates.

## Props

`ITransitionProps` — `name`, `disabled`, `group`.

## Notes

- Pair with `<OrigamSnackbar>` for the canonical implementation.
- `group` enables stacked toast lists.
