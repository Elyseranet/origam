# OrigamExpandY

`<OrigamExpandY>` animates the **height** of its slot from `0` to its
natural pixel height on enter, and the reverse on leave. Use for
collapsible cards, accordions, and disclosure widgets.

The transition is **JS-driven**: it measures `offsetHeight` and toggles
`overflow: hidden` to mask collapsing margins.

## Basic usage

```vue
<template>
    <OrigamExpandY>
        <div v-if="open">{{ content }}</div>
    </OrigamExpandY>
</template>
```

## Grouped / list usage

Set `group` to animate a **keyed list** of items instead of a single
element — the root switches from Vue's `Transition` to `TransitionGroup`,
which is what makes the `-move` CSS var below apply: as an item enters or
leaves, its siblings smoothly translate into their new position (FLIP)
instead of jumping.

```vue
<template>
    <OrigamExpandY group>
        <div v-for="row in rows" :key="row.id">{{ row.label }}</div>
    </OrigamExpandY>
</template>
```

`mode` (`in-out` / `out-in` / `default`) only applies to the single-child
form — Vue's `TransitionGroup` doesn't support it, so it's silently
omitted from the underlying transition when `group` is true (no dev
warning either way).

## CSS variables consumed

| Variable | Default |
|---|---|
| `--origam-transition--expand-y-enter-active---transition-duration` | `0.5s` |
| `--origam-transition--expand-y-enter-active---transition-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--origam-transition--expand-y-enter-active---transition-property` | `height` |
| `--origam-transition--expand-y-enter-leave---transition-duration` | `0.5s` |
| `--origam-transition--expand-y-move---transition-property` | `transform` — only reachable via `group` (see above) |

Override at root or per instance.

## Props

`ITransitionNoOriginProps` (`ITransitionProps` minus `origin`):

| Prop | Effect |
|---|---|
| `name` | CSS class prefix passed to the underlying transition. |
| `disabled` | Short-circuits both the JS measurement and the CSS path — mounts/unmounts instantly. |
| `mode` | `in-out` (default) / `out-in` / `default`. Single-child form only (see Grouped usage). |
| `group` | Switches the root to `TransitionGroup` for a keyed list; unlocks the `-move` reflow. |
| `leaveAbsolute` | On leave, pulls the element out of flow (`position: absolute`, frozen at its current box) so siblings reflow immediately instead of waiting for the height to reach `0`. Restored once the leave completes. |
| `hideOnLeave` | Skips the visible height-collapse on leave entirely — the element is hidden (`display: none`) instantly instead. |

⛔ **`origin` was removed (breaking change, #538/#548).** It set
`transform-origin`, which is meaningless for a height-only animation (no
`transform: scale(...)` anywhere in this component's enter/leave) — the
prop was declared but never produced any observable effect. Consumers
passing `origin` now get a compile-time TypeScript error rather than a
silent no-op.

## Notes

- The slot must have a single root with a measurable height (or, with
  `group`, one measurable element per keyed list item).
- This is the most common transition for accordion-style disclosure.
- `leaveAbsolute` and `hideOnLeave` are most useful together with `group`
  (removing one row from a vertical list without the others waiting on
  its full collapse animation), but both also work on a single-child
  `<OrigamExpandY>` without `group`.
