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

`<OrigamTranslatePicker>` declares the whole shared `ITransitionProps`
surface and wires it through `useCssTransition`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'origam-transition--translate-picker'` | Transition class prefix. Change it only to swap in your own keyframes. |
| `disabled` | `boolean` | `undefined` | Sets `css: false` on the underlying `<transition>`, so the enter / leave classes are never applied and the content swaps instantly. |
| `group` | `boolean` | `undefined` | Render a `<transition-group>` instead of a `<transition>`. The `…-move` rule in the stylesheet only applies on this path. |
| `origin` | `string` | `undefined` | Written to `transform-origin` on the element in the `beforeEnter` hook. See the note below. |
| `hideOnLeave` | `boolean` | `undefined` | `display: none !important` on the leaving element for the whole leave phase. Note this fights the built-in slide-out — the leaving child disappears instead of sliding left. |
| `leaveAbsolute` | `boolean` | `undefined` | Freezes the leaving element's box at its measured `top` / `left` / `width` / `height`. Largely redundant here: the stylesheet already forces `position: absolute !important` on the leave classes. |
| `mode` | `TTransitionMode` | `undefined` | ⛔ **Declared but inert.** See the note below. |

## Emits

None. `ITransitionEmits` is empty for every member of the family.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | The transitioned content. Its `:key` must change for the enter / leave cycle to run. |

## Notes

- The parent container should be `position: relative` so the absolutely
  positioned leaving child stays put.
- For the opposite direction (right-to-left), use
  `OrigamReverseTranslatePicker`.
- **`origin` sets the property but this transition has nothing to anchor
  on.** `transform-origin` changes where a `scale` or `rotate` pivots;
  the enter / leave keyframes here only `translate`, which is
  origin-independent.
- ⛔ **`mode` has no effect on this component**, measured on the rendered
  tree rather than inferred. `useCssTransition` only forwards it on the
  `group` path, and Vue's `TransitionGroup` does not declare `mode`
  (`'mode' in TransitionGroup.props === false`) — it lands as an inert
  DOM attribute. On the default path the wrapper absorbs `mode` as a
  declared prop, so it never falls through to `<Transition>`, which
  *does* declare it. Use `<OrigamTransition>` or a plain
  `<transition mode="out-in">` when you need enter / leave ordering.
- `prefers-reduced-motion: reduce` collapses `enter-active`,
  `leave-active` and `move` to `0.01ms`.
