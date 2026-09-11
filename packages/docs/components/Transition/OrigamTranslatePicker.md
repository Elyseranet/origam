# OrigamTranslatePicker

`<OrigamTranslatePicker>` is the wheel-picker style transition: the new
item slides in from the right (`translate(100%, 0)`) and the previous
one leaves to the left (`translate(-100%, 0)`). The two children
overlap during transition because the leaving slot is `position:
absolute`.

Use for date / time pickers, swap-style detail panels, and any
left-to-right "advance" gesture.

## Basic usage

```vue
<template>
    <OrigamTranslatePicker>
        <Page :key="currentPage" />
    </OrigamTranslatePicker>
</template>
```

`:key` must change between renders — that's what triggers the
enter/leave cycle.

## CSS classes emitted

```
origam-transition--translate-picker-enter-from    { transform: translate(100%, 0); opacity: 0; }
origam-transition--translate-picker-leave-to      { transform: translate(-100%, 0); opacity: 0; }
origam-transition--translate-picker-leave-active,
origam-transition--translate-picker-leave-from,
origam-transition--translate-picker-leave-to      { position: absolute !important; }
origam-transition--translate-picker-enter-active,
origam-transition--translate-picker-leave-active  { transition: 0.3s standard; }
```

## Props

`ITransitionProps` — `name`, `disabled`.

## Notes

- The parent container should be `position: relative` so the absolutely
  positioned leaving child stays put.
- For the opposite direction (right-to-left), use
  `OrigamReverseTranslatePicker`.
